-- =============================================================================
-- Palco — Plataforma de apresentação de eventos e captação de patrocínios
-- Esquema principal
-- =============================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'editor', 'commercial');
create type public.event_status as enum ('draft', 'published', 'archived');
create type public.section_type as enum (
  'hero', 'metrics', 'grandeur', 'audience', 'results',
  'opportunities', 'tiers', 'sponsors', 'next_edition', 'cta', 'footer'
);
create type public.metric_kind as enum ('actual', 'projection');
create type public.media_kind as enum ('image', 'video', 'embed');
create type public.lead_status as enum (
  'new', 'contacted', 'negotiating', 'proposal_sent', 'won', 'lost'
);
create type public.interaction_kind as enum (
  'note', 'call', 'email', 'meeting', 'whatsapp', 'status_change', 'proposal'
);
create type public.sponsor_relation as enum (
  'past', 'current', 'institutional', 'supporter', 'media'
);
create type public.chart_type as enum ('bar', 'donut', 'stat', 'map');
create type public.analytics_event as enum (
  'page_view', 'cta_click', 'tiers_view', 'form_start',
  'form_submit', 'whatsapp_click', 'deck_download'
);

-- -----------------------------------------------------------------------------
-- Funções utilitárias
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- Perfis e permissões
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 120),
  email       citext,
  role        public.app_role,              -- null = sem acesso ao painel
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Matriz de permissões por perfil. Preparada para permissões personalizadas:
-- basta inserir novas linhas (ou, futuramente, permissões por usuário).
create table public.role_permissions (
  role        public.app_role not null,
  permission  text not null check (permission ~ '^[a-z_]+\.[a-z_]+$'),
  primary key (role, permission)
);

insert into public.role_permissions (role, permission) values
  ('admin', 'events.read'), ('admin', 'events.write'), ('admin', 'events.publish'),
  ('admin', 'events.delete'), ('admin', 'media.write'), ('admin', 'sponsors.write'),
  ('admin', 'tiers.sales'), ('admin', 'leads.read'), ('admin', 'leads.write'),
  ('admin', 'leads.export'), ('admin', 'analytics.read'), ('admin', 'users.manage'),
  ('admin', 'audit.read'), ('admin', 'integrations.write'),
  ('editor', 'events.read'), ('editor', 'events.write'), ('editor', 'events.publish'),
  ('editor', 'media.write'), ('editor', 'sponsors.write'), ('editor', 'analytics.read'),
  ('editor', 'integrations.write'),
  ('commercial', 'events.read'), ('commercial', 'tiers.sales'), ('commercial', 'leads.read'),
  ('commercial', 'leads.write'), ('commercial', 'leads.export'), ('commercial', 'analytics.read');

create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create or replace function public.has_permission(p text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.profiles pr
    join public.role_permissions rp on rp.role = pr.role
    where pr.id = auth.uid() and pr.active and rp.permission = p
  )
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_app_role() is not null
$$;

-- Cria perfil automaticamente quando um usuário é criado no Auth.
-- O perfil nasce sem papel; um administrador concede o acesso.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.app_role;
begin
  begin
    v_role := nullif(new.raw_app_meta_data ->> 'role', '')::public.app_role;
  exception when others then
    v_role := null;
  end;
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    v_role
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede que um usuário altere o próprio papel/status sem ser admin.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active)
     and not public.has_permission('users.manage')
     and current_setting('role', true) not in ('service_role', 'postgres') then
    raise exception 'Somente administradores podem alterar papéis.';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- -----------------------------------------------------------------------------
-- Eventos
-- -----------------------------------------------------------------------------
create table public.events (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                     check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 2 and 80),
  name               text not null check (char_length(name) between 2 and 120),
  tagline            text check (char_length(tagline) <= 200),
  short_description  text check (char_length(short_description) <= 400),
  description        text check (char_length(description) <= 6000),
  edition_number     int check (edition_number between 1 and 999),
  edition_label      text check (char_length(edition_label) <= 60),
  starts_on          date,
  ends_on            date,
  date_label         text check (char_length(date_label) <= 80),
  venue              text check (char_length(venue) <= 160),
  city               text check (char_length(city) <= 80),
  state              text check (char_length(state) <= 40),
  country            text default 'Brasil' check (char_length(country) <= 60),
  status             public.event_status not null default 'draft',
  published_at       timestamptz,
  archived_at        timestamptz,
  is_demo            boolean not null default false,
  -- Organização / contatos
  organizer_name     text check (char_length(organizer_name) <= 160),
  organizer_document text check (char_length(organizer_document) <= 40),
  organizer_about    text check (char_length(organizer_about) <= 1200),
  contact_name       text check (char_length(contact_name) <= 120),
  contact_email      text check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  contact_phone      text check (char_length(contact_phone) <= 40),
  whatsapp           text check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'),
  social_links       jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  footer_links       jsonb not null default '[]'::jsonb check (jsonb_typeof(footer_links) = 'array'),
  -- Formulário
  form_interests     text[] not null default array[
                       'Patrocínio de cota', 'Naming rights', 'Ativação de marca',
                       'Estande', 'Mídia digital', 'Apoio institucional'
                     ],
  form_success_message text check (char_length(form_success_message) <= 400),
  privacy_contact_email text check (privacy_contact_email is null or privacy_contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  deck_enabled       boolean not null default true,
  -- SEO
  seo_title          text check (char_length(seo_title) <= 70),
  seo_description    text check (char_length(seo_description) <= 200),
  og_image_url       text,
  noindex            boolean not null default false,
  -- Controle
  duplicated_from    uuid references public.events (id) on delete set null,
  created_by         uuid references auth.users (id) on delete set null,
  updated_by         uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint events_dates check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create index events_status_idx on public.events (status);
create index events_updated_idx on public.events (updated_at desc);
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

create or replace function public.is_event_public(e uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.events where id = e and status = 'published')
$$;

-- Identidade visual -----------------------------------------------------------
create table public.event_branding (
  event_id          uuid primary key references public.events (id) on delete cascade,
  logo_url          text,
  logo_alt_url      text,
  favicon_url       text,
  color_primary     text not null default '#F2E8D5' check (color_primary ~* '^#[0-9a-f]{6}$'),
  color_secondary   text not null default '#1C1B19' check (color_secondary ~* '^#[0-9a-f]{6}$'),
  color_accent      text not null default '#E8572A' check (color_accent ~* '^#[0-9a-f]{6}$'),
  color_background  text not null default '#0E0D0C' check (color_background ~* '^#[0-9a-f]{6}$'),
  color_text        text not null default '#F4F1EA' check (color_text ~* '^#[0-9a-f]{6}$'),
  font_heading      text not null default 'Anton' check (char_length(font_heading) <= 60),
  font_body         text not null default 'Inter' check (char_length(font_body) <= 60),
  heading_case      text not null default 'upper' check (heading_case in ('upper', 'none')),
  texture_url       text,
  texture_opacity   numeric(3,2) not null default 0.08 check (texture_opacity between 0 and 1),
  grain             boolean not null default true,
  corner_style      text not null default 'square' check (corner_style in ('square', 'soft', 'round')),
  updated_at        timestamptz not null default now()
);
create trigger event_branding_touch before update on public.event_branding
  for each row execute function public.touch_updated_at();

-- Seções ----------------------------------------------------------------------
create table public.event_sections (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  type        public.section_type not null,
  position    int not null default 0,
  enabled     boolean not null default true,
  eyebrow     text check (char_length(eyebrow) <= 80),
  title       text check (char_length(title) <= 240),
  body        text check (char_length(body) <= 4000),
  settings    jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  updated_at  timestamptz not null default now(),
  unique (event_id, type)
);
create index event_sections_event_idx on public.event_sections (event_id, position);
create trigger event_sections_touch before update on public.event_sections
  for each row execute function public.touch_updated_at();

-- Indicadores -----------------------------------------------------------------
create table public.event_metrics (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events (id) on delete cascade,
  kind         public.metric_kind not null default 'actual',
  label        text not null check (char_length(label) between 1 and 80),
  value        numeric(18,2) not null,
  prefix       text check (char_length(prefix) <= 8),
  unit         text check (char_length(unit) <= 24),
  description  text check (char_length(description) <= 280),
  source       text check (char_length(source) <= 200),
  period       text check (char_length(period) <= 80),
  animate      boolean not null default true,
  featured     boolean not null default false,
  position     int not null default 0,
  created_at   timestamptz not null default now()
);
create index event_metrics_event_idx on public.event_metrics (event_id, kind, position);

-- Mídia -----------------------------------------------------------------------
create table public.event_media (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events (id) on delete cascade,
  kind          public.media_kind not null default 'image',
  folder        text not null default 'geral'
                check (folder ~ '^[a-z0-9-]{1,40}$'),
  storage_path  text,
  url           text not null check (char_length(url) <= 2000),
  poster_url    text,
  caption       text check (char_length(caption) <= 280),
  alt           text check (char_length(alt) <= 280),
  credit        text check (char_length(credit) <= 120),
  width         int,
  height        int,
  size_bytes    bigint,
  mime_type     text,
  in_gallery    boolean not null default false,
  featured      boolean not null default false,
  position      int not null default 0,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);
create index event_media_event_idx on public.event_media (event_id, folder, position);

-- Depoimentos -----------------------------------------------------------------
create table public.event_testimonials (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  context     text not null default 'audience' check (context in ('audience', 'sponsor', 'results')),
  quote       text not null check (char_length(quote) between 2 and 600),
  author      text not null check (char_length(author) <= 120),
  role        text check (char_length(role) <= 120),
  company     text check (char_length(company) <= 120),
  avatar_url  text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);
create index event_testimonials_event_idx on public.event_testimonials (event_id, context, position);

-- Público ---------------------------------------------------------------------
create table public.event_audience (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  dimension   text not null default 'other' check (dimension in (
                'age', 'gender', 'region', 'socioeconomic', 'interests',
                'consumption', 'professional', 'other')),
  title       text not null check (char_length(title) between 1 and 120),
  chart_type  public.chart_type not null default 'bar',
  data        jsonb not null default '[]'::jsonb check (jsonb_typeof(data) = 'array'),
  unit        text default '%' check (char_length(unit) <= 12),
  source      text check (char_length(source) <= 200),
  period      text check (char_length(period) <= 80),
  note        text check (char_length(note) <= 280),
  position    int not null default 0,
  created_at  timestamptz not null default now()
);
create index event_audience_event_idx on public.event_audience (event_id, position);

-- Resultados ------------------------------------------------------------------
create table public.event_results (
  id                      uuid primary key default gen_random_uuid(),
  event_id                uuid not null references public.events (id) on delete cascade,
  category                text not null default 'media' check (category in (
                            'media', 'organic', 'paid', 'impressions', 'engagement',
                            'attendance', 'activation', 'other')),
  label                   text not null check (char_length(label) between 1 and 120),
  value                   numeric(18,2) not null,
  prefix                  text check (char_length(prefix) <= 8),
  unit                    text check (char_length(unit) <= 24),
  previous_value          numeric(18,2),
  description             text check (char_length(description) <= 280),
  source                  text check (char_length(source) <= 200),
  period                  text check (char_length(period) <= 80),
  position                int not null default 0,
  created_at              timestamptz not null default now()
);
create index event_results_event_idx on public.event_results (event_id, position);

-- Comercial -------------------------------------------------------------------
create table public.sponsorship_opportunities (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events (id) on delete cascade,
  category      text not null default 'custom' check (category in (
                  'naming_rights', 'master', 'official', 'category', 'activation',
                  'booth', 'experience', 'digital_media', 'audiovisual',
                  'institutional', 'custom')),
  title         text not null check (char_length(title) between 1 and 120),
  description   text check (char_length(description) <= 1200),
  deliverables  text[] not null default '{}',
  image_url     text,
  enabled       boolean not null default true,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index sponsorship_opportunities_event_idx on public.sponsorship_opportunities (event_id, position);

create table public.sponsorship_tiers (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  name            text not null check (char_length(name) between 1 and 60),
  tagline         text check (char_length(tagline) <= 140),
  description     text check (char_length(description) <= 1200),
  price           numeric(14,2) check (price is null or price >= 0),
  currency        text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  show_price      boolean not null default false,
  quantity_total  int check (quantity_total is null or quantity_total >= 0),
  quantity_sold   int not null default 0 check (quantity_sold >= 0),
  deliverables    text[] not null default '{}',
  benefits        text[] not null default '{}',
  image_url       text,
  highlight       boolean not null default false,
  enabled         boolean not null default true,
  position        int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint tiers_sold_le_total check (quantity_total is null or quantity_sold <= quantity_total)
);
create index sponsorship_tiers_event_idx on public.sponsorship_tiers (event_id, position);
create trigger sponsorship_tiers_touch before update on public.sponsorship_tiers
  for each row execute function public.touch_updated_at();

-- Biblioteca global de marcas (reutilizável entre eventos)
create table public.sponsors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  logo_url    text,
  website     text check (website is null or website ~* '^https?://'),
  segment     text check (char_length(segment) <= 80),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index sponsors_name_key on public.sponsors (lower(name));
create trigger sponsors_touch before update on public.sponsors
  for each row execute function public.touch_updated_at();

create table public.event_sponsors (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events (id) on delete cascade,
  sponsor_id   uuid not null references public.sponsors (id) on delete cascade,
  relation     public.sponsor_relation not null default 'past',
  tier_label   text check (char_length(tier_label) <= 60),
  case_title   text check (char_length(case_title) <= 140),
  case_body    text check (char_length(case_body) <= 1200),
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  unique (event_id, sponsor_id, relation)
);
create index event_sponsors_event_idx on public.event_sponsors (event_id, position);

-- Leads -----------------------------------------------------------------------
create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.events (id) on delete cascade,
  tier_id          uuid references public.sponsorship_tiers (id) on delete set null,
  tier_name        text check (char_length(tier_name) <= 60),
  full_name        text not null check (char_length(full_name) between 2 and 120),
  company          text not null check (char_length(company) between 1 and 160),
  job_title        text check (char_length(job_title) <= 120),
  email            citext not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  phone            text check (char_length(phone) <= 40),
  segment          text check (char_length(segment) <= 120),
  interest         text check (char_length(interest) <= 120),
  message          text check (char_length(message) <= 3000),
  status           public.lead_status not null default 'new',
  -- LGPD
  consent          boolean not null check (consent),
  consent_at       timestamptz not null default now(),
  consent_version  text not null default 'v1',
  marketing_opt_in boolean not null default false,
  -- Origem da conversão
  cta_origin       text check (char_length(cta_origin) <= 60),
  utm_source       text check (char_length(utm_source) <= 120),
  utm_medium       text check (char_length(utm_medium) <= 120),
  utm_campaign     text check (char_length(utm_campaign) <= 120),
  utm_content      text check (char_length(utm_content) <= 120),
  referrer         text check (char_length(referrer) <= 500),
  landing_path     text check (char_length(landing_path) <= 500),
  ip_hash          text check (char_length(ip_hash) <= 128),
  user_agent       text check (char_length(user_agent) <= 400),
  -- Gestão
  assigned_to      uuid references auth.users (id) on delete set null,
  estimated_value  numeric(14,2) check (estimated_value is null or estimated_value >= 0),
  last_contact_at  timestamptz,
  seen_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index leads_event_idx on public.leads (event_id, created_at desc);
create index leads_status_idx on public.leads (status);
create index leads_created_idx on public.leads (created_at desc);
create index leads_ip_recent_idx on public.leads (ip_hash, created_at desc);
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

create table public.lead_interactions (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads (id) on delete cascade,
  author_id    uuid references auth.users (id) on delete set null,
  kind         public.interaction_kind not null default 'note',
  body         text check (char_length(body) <= 4000),
  from_status  public.lead_status,
  to_status    public.lead_status,
  created_at   timestamptz not null default now()
);
create index lead_interactions_lead_idx on public.lead_interactions (lead_id, created_at desc);

-- Analytics -------------------------------------------------------------------
create table public.event_analytics (
  id           bigint generated always as identity primary key,
  event_id     uuid not null references public.events (id) on delete cascade,
  name         public.analytics_event not null,
  session_id   text check (char_length(session_id) <= 64),
  path         text check (char_length(path) <= 500),
  referrer     text check (char_length(referrer) <= 500),
  utm_source   text check (char_length(utm_source) <= 120),
  utm_medium   text check (char_length(utm_medium) <= 120),
  utm_campaign text check (char_length(utm_campaign) <= 120),
  device       text check (device in ('mobile', 'tablet', 'desktop')),
  label        text check (char_length(label) <= 120),
  created_at   timestamptz not null default now()
);
create index event_analytics_event_idx on public.event_analytics (event_id, created_at desc);
create index event_analytics_name_idx on public.event_analytics (event_id, name, created_at desc);

create table public.event_integrations (
  event_id            uuid primary key references public.events (id) on delete cascade,
  meta_pixel_id       text check (meta_pixel_id is null or meta_pixel_id ~ '^[0-9]{6,20}$'),
  ga_measurement_id   text check (ga_measurement_id is null or ga_measurement_id ~ '^G-[A-Z0-9]{4,16}$'),
  gtm_id              text check (gtm_id is null or gtm_id ~ '^GTM-[A-Z0-9]{4,12}$'),
  tracking_enabled    boolean not null default true,
  notify_emails       text[] not null default '{}',
  updated_at          timestamptz not null default now()
);
create trigger event_integrations_touch before update on public.event_integrations
  for each row execute function public.touch_updated_at();

-- Auditoria -------------------------------------------------------------------
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users (id) on delete set null,
  action      text not null check (char_length(action) <= 80),
  entity      text not null check (char_length(entity) <= 60),
  entity_id   text,
  event_id    uuid references public.events (id) on delete set null,
  summary     text check (char_length(summary) <= 400),
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_event_idx on public.audit_logs (event_id, created_at desc);
