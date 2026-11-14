-- =============================================================================
-- Segurança: RLS, grants, regras de negócio e funções RPC
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Regras de negócio
-- -----------------------------------------------------------------------------

-- Lead: valida a cota informada (precisa ser do mesmo evento) e congela o nome.
create or replace function public.leads_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tier record;
begin
  if new.tier_id is not null then
    select id, event_id, name into v_tier from public.sponsorship_tiers where id = new.tier_id;
    if v_tier.id is null or v_tier.event_id <> new.event_id then
      new.tier_id := null;
      new.tier_name := null;
    else
      new.tier_name := v_tier.name;
    end if;
  end if;
  new.status := 'new';
  new.consent_at := now();
  return new;
end $$;
create trigger leads_before_insert before insert on public.leads
  for each row execute function public.leads_before_insert();

-- Lead: registra mudanças de status no histórico automaticamente.
create or replace function public.leads_status_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_interactions (lead_id, author_id, kind, from_status, to_status)
    values (new.id, auth.uid(), 'status_change', old.status, new.status);
  end if;
  return new;
end $$;
create trigger leads_status_history after update of status on public.leads
  for each row execute function public.leads_status_history();

-- Interações atualizam a data do último contato.
create or replace function public.lead_interaction_touch()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.kind in ('call', 'email', 'meeting', 'whatsapp', 'proposal') then
    update public.leads set last_contact_at = new.created_at where id = new.lead_id;
  end if;
  return new;
end $$;
create trigger lead_interaction_touch after insert on public.lead_interactions
  for each row execute function public.lead_interaction_touch();

-- Publicação controla published_at / archived_at.
create or replace function public.events_status_dates()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  if new.status = 'archived' and (old.status is distinct from 'archived') then
    new.archived_at := now();
  end if;
  if new.status <> 'archived' then
    new.archived_at := null;
  end if;
  return new;
end $$;
create trigger events_status_dates before update of status on public.events
  for each row execute function public.events_status_dates();

-- Seções padrão + identidade + integrações para todo evento novo.
create or replace function public.events_bootstrap()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.event_branding (event_id) values (new.id) on conflict do nothing;
  insert into public.event_integrations (event_id) values (new.id) on conflict do nothing;
  insert into public.event_sections (event_id, type, position, eyebrow, title, body, settings)
  values
    (new.id, 'hero', 0, null, null, null,
      '{"align":"left","vertical":"bottom","height":"screen","overlay":0.45,"show_scroll_hint":true}'),
    (new.id, 'metrics', 1, 'O evento em números', 'Uma audiência que se mede em escala.', null, '{"layout":"editorial"}'),
    (new.id, 'grandeur', 2, 'A grandiosidade', 'Uma experiência que ocupa a cidade.', null, '{}'),
    (new.id, 'audience', 3, 'Nosso público', 'Quem está lá — e por que importa para sua marca.', null, '{}'),
    (new.id, 'results', 4, 'Resultados da última edição', 'O que a última edição entregou.', null, '{}'),
    (new.id, 'opportunities', 5, 'Oportunidades para marcas', 'Formas de estar no centro da experiência.', null, '{}'),
    (new.id, 'tiers', 6, 'Cotas de patrocínio', 'Escolha o tamanho da sua presença.', null, '{}'),
    (new.id, 'sponsors', 7, 'Quem já acredita no projeto', 'Marcas que já subiram ao palco com a gente.', null, '{}'),
    (new.id, 'next_edition', 8, 'A próxima edição', 'O que vem a seguir.', null, '{"items":[]}'),
    (new.id, 'cta', 9, 'Patrocine', 'Sua marca precisa estar onde as grandes experiências acontecem.',
      'Converse com nosso time comercial e desenhe uma presença sob medida para os objetivos da sua marca.',
      '{"button_label":"Quero conectar minha marca ao evento"}'),
    (new.id, 'footer', 10, null, null, null, '{}')
  on conflict (event_id, type) do nothing;
  return new;
end $$;
create trigger events_bootstrap after insert on public.events
  for each row execute function public.events_bootstrap();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.profiles                  enable row level security;
alter table public.role_permissions          enable row level security;
alter table public.events                    enable row level security;
alter table public.event_branding            enable row level security;
alter table public.event_sections            enable row level security;
alter table public.event_metrics             enable row level security;
alter table public.event_media               enable row level security;
alter table public.event_testimonials        enable row level security;
alter table public.event_audience            enable row level security;
alter table public.event_results             enable row level security;
alter table public.sponsorship_opportunities enable row level security;
alter table public.sponsorship_tiers         enable row level security;
alter table public.sponsors                  enable row level security;
alter table public.event_sponsors            enable row level security;
alter table public.leads                     enable row level security;
alter table public.lead_interactions         enable row level security;
alter table public.event_analytics           enable row level security;
alter table public.event_integrations        enable row level security;
alter table public.audit_logs                enable row level security;

-- Perfis
create policy "profiles: ver o próprio" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());
create policy "profiles: editar o próprio" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin gerencia" on public.profiles
  for all to authenticated using (public.has_permission('users.manage'))
  with check (public.has_permission('users.manage'));

create policy "permissões: staff lê" on public.role_permissions
  for select to authenticated using (public.is_staff());

-- Eventos
create policy "events: público lê publicados" on public.events
  for select to anon, authenticated using (status = 'published');
create policy "events: staff lê" on public.events
  for select to authenticated using (public.has_permission('events.read'));
create policy "events: editor cria" on public.events
  for insert to authenticated with check (public.has_permission('events.write'));
create policy "events: editor altera" on public.events
  for update to authenticated using (public.has_permission('events.write'))
  with check (
    public.has_permission('events.write')
    and (status = 'draft' or public.has_permission('events.publish'))
  );
create policy "events: admin exclui" on public.events
  for delete to authenticated using (public.has_permission('events.delete'));

-- Tabelas de conteúdo do evento: mesma regra para todas.
do $$
declare
  t text;
begin
  foreach t in array array[
    'event_branding', 'event_sections', 'event_metrics', 'event_media',
    'event_testimonials', 'event_audience', 'event_results',
    'sponsorship_opportunities', 'event_sponsors'
  ] loop
    execute format(
      'create policy "%1$s: público lê de eventos publicados" on public.%1$I
         for select to anon, authenticated using (public.is_event_public(event_id))', t);
    execute format(
      'create policy "%1$s: staff lê" on public.%1$I
         for select to authenticated using (public.has_permission(''events.read''))', t);
    execute format(
      'create policy "%1$s: editor escreve" on public.%1$I
         for all to authenticated using (public.has_permission(''events.write''))
         with check (public.has_permission(''events.write''))', t);
  end loop;
end $$;

-- Cotas: editor estrutura; comercial atualiza vendas.
create policy "tiers: público lê de eventos publicados" on public.sponsorship_tiers
  for select to anon, authenticated using (public.is_event_public(event_id) and enabled);
create policy "tiers: staff lê" on public.sponsorship_tiers
  for select to authenticated using (public.has_permission('events.read'));
create policy "tiers: editor escreve" on public.sponsorship_tiers
  for all to authenticated using (public.has_permission('events.write'))
  with check (public.has_permission('events.write'));
create policy "tiers: comercial atualiza vendas" on public.sponsorship_tiers
  for update to authenticated using (public.has_permission('tiers.sales'))
  with check (public.has_permission('tiers.sales'));

-- Marcas (biblioteca global)
create policy "sponsors: público lê marcas de eventos publicados" on public.sponsors
  for select to anon, authenticated using (
    exists (select 1 from public.event_sponsors es
            where es.sponsor_id = sponsors.id and public.is_event_public(es.event_id)));
create policy "sponsors: staff lê" on public.sponsors
  for select to authenticated using (public.is_staff());
create policy "sponsors: editor escreve" on public.sponsors
  for all to authenticated using (public.has_permission('sponsors.write'))
  with check (public.has_permission('sponsors.write'));

-- Integrações: os IDs de rastreamento são públicos por natureza (vão no HTML),
-- mas a lista de e-mails de notificação não — por isso o público lê via view.
create policy "integrations: staff lê" on public.event_integrations
  for select to authenticated using (public.has_permission('events.read'));
create policy "integrations: editor escreve" on public.event_integrations
  for all to authenticated using (public.has_permission('integrations.write'))
  with check (public.has_permission('integrations.write'));

create view public.public_event_tracking
with (security_invoker = false) as
  select i.event_id, i.meta_pixel_id, i.ga_measurement_id, i.gtm_id
  from public.event_integrations i
  join public.events e on e.id = i.event_id
  where e.status = 'published' and i.tracking_enabled;
grant select on public.public_event_tracking to anon, authenticated;

-- Leads: o público só insere (colunas restritas); comercial/admin leem e gerenciam.
create policy "leads: público envia para evento publicado" on public.leads
  for insert to anon, authenticated with check (consent and public.is_event_public(event_id));
create policy "leads: comercial lê" on public.leads
  for select to authenticated using (public.has_permission('leads.read'));
create policy "leads: comercial altera" on public.leads
  for update to authenticated using (public.has_permission('leads.write'))
  with check (public.has_permission('leads.write'));
create policy "leads: admin exclui" on public.leads
  for delete to authenticated using (public.has_permission('users.manage'));

revoke insert, update, delete on public.leads from anon;
grant insert (
  id, event_id, tier_id, full_name, company, job_title, email, phone, segment, interest,
  message, consent, consent_version, marketing_opt_in, cta_origin, utm_source,
  utm_medium, utm_campaign, utm_content, referrer, landing_path, ip_hash, user_agent
) on public.leads to anon;

create policy "interactions: comercial lê" on public.lead_interactions
  for select to authenticated using (public.has_permission('leads.read'));
create policy "interactions: comercial registra" on public.lead_interactions
  for insert to authenticated with check (
    public.has_permission('leads.write') and author_id = auth.uid());
create policy "interactions: autor remove nota" on public.lead_interactions
  for delete to authenticated using (author_id = auth.uid() and kind <> 'status_change');

-- Analytics: público registra (colunas restritas) em evento publicado; staff lê.
create policy "analytics: público registra" on public.event_analytics
  for insert to anon, authenticated with check (public.is_event_public(event_id));
create policy "analytics: staff lê" on public.event_analytics
  for select to authenticated using (public.has_permission('analytics.read'));
revoke insert, update, delete on public.event_analytics from anon;
grant insert (event_id, name, session_id, path, referrer, utm_source, utm_medium,
              utm_campaign, device, label) on public.event_analytics to anon;

-- Auditoria: staff registra as próprias ações; admin lê.
create policy "audit: staff registra" on public.audit_logs
  for insert to authenticated with check (public.is_staff() and actor_id = auth.uid());
create policy "audit: admin lê" on public.audit_logs
  for select to authenticated using (public.has_permission('audit.read'));

-- -----------------------------------------------------------------------------
-- RPC
-- -----------------------------------------------------------------------------

-- Antispam: quantos leads esse IP (hash) enviou recentemente.
create or replace function public.lead_recent_count(p_ip_hash text, p_minutes int default 10)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.leads
  where ip_hash = p_ip_hash and created_at > now() - make_interval(mins => least(p_minutes, 1440))
$$;
revoke all on function public.lead_recent_count(text, int) from public;
grant execute on function public.lead_recent_count(text, int) to anon, authenticated;

-- Duplicação de evento: copia estrutura, conteúdo e identidade.
-- Nunca copia leads, analytics, patrocinadores vinculados ou vendas de cotas.
create or replace function public.duplicate_event(
  p_source uuid,
  p_name text,
  p_slug text,
  p_copy_tiers boolean default true,
  p_copy_media boolean default true
) returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  v_new uuid;
begin
  if not public.has_permission('events.write') then
    raise exception 'Sem permissão para criar eventos.';
  end if;

  insert into public.events (
    slug, name, tagline, short_description, description, edition_number, edition_label,
    starts_on, ends_on, date_label, venue, city, state, country, status, is_demo,
    organizer_name, organizer_document, organizer_about, contact_name, contact_email,
    contact_phone, whatsapp, social_links, footer_links, form_interests,
    form_success_message, privacy_contact_email, deck_enabled, seo_title,
    seo_description, og_image_url, noindex, duplicated_from, created_by, updated_by
  )
  select
    p_slug, p_name, tagline, short_description, description, edition_number, edition_label,
    starts_on, ends_on, date_label, venue, city, state, country, 'draft', false,
    organizer_name, organizer_document, organizer_about, contact_name, contact_email,
    contact_phone, whatsapp, social_links, footer_links, form_interests,
    form_success_message, privacy_contact_email, deck_enabled, null,
    null, og_image_url, noindex, id, auth.uid(), auth.uid()
  from public.events where id = p_source
  returning id into v_new;

  if v_new is null then
    raise exception 'Evento de origem não encontrado.';
  end if;

  -- O trigger criou defaults; substitui pelos dados da origem.
  delete from public.event_sections where event_id = v_new;
  insert into public.event_sections (event_id, type, position, enabled, eyebrow, title, body, settings)
  select v_new, type, position, enabled, eyebrow, title, body, settings
  from public.event_sections where event_id = p_source;

  update public.event_branding b set
    logo_url = s.logo_url, logo_alt_url = s.logo_alt_url, favicon_url = s.favicon_url,
    color_primary = s.color_primary, color_secondary = s.color_secondary,
    color_accent = s.color_accent, color_background = s.color_background,
    color_text = s.color_text, font_heading = s.font_heading, font_body = s.font_body,
    heading_case = s.heading_case, texture_url = s.texture_url,
    texture_opacity = s.texture_opacity, grain = s.grain, corner_style = s.corner_style
  from public.event_branding s
  where b.event_id = v_new and s.event_id = p_source;

  insert into public.event_metrics (event_id, kind, label, value, prefix, unit, description, source, period, animate, featured, position)
  select v_new, kind, label, value, prefix, unit, description, source, period, animate, featured, position
  from public.event_metrics where event_id = p_source;

  insert into public.event_audience (event_id, dimension, title, chart_type, data, unit, source, period, note, position)
  select v_new, dimension, title, chart_type, data, unit, source, period, note, position
  from public.event_audience where event_id = p_source;

  insert into public.event_results (event_id, category, label, value, prefix, unit, previous_value, description, source, period, position)
  select v_new, category, label, value, prefix, unit, previous_value, description, source, period, position
  from public.event_results where event_id = p_source;

  insert into public.event_testimonials (event_id, context, quote, author, role, company, avatar_url, position)
  select v_new, context, quote, author, role, company, avatar_url, position
  from public.event_testimonials where event_id = p_source and context <> 'sponsor';

  insert into public.sponsorship_opportunities (event_id, category, title, description, deliverables, image_url, enabled, position)
  select v_new, category, title, description, deliverables, image_url, enabled, position
  from public.sponsorship_opportunities where event_id = p_source;

  if p_copy_tiers then
    insert into public.sponsorship_tiers (event_id, name, tagline, description, price, currency, show_price,
      quantity_total, quantity_sold, deliverables, benefits, image_url, highlight, enabled, position)
    select v_new, name, tagline, description, price, currency, show_price,
      quantity_total, 0, deliverables, benefits, image_url, highlight, enabled, position
    from public.sponsorship_tiers where event_id = p_source;
  end if;

  if p_copy_media then
    insert into public.event_media (event_id, kind, folder, storage_path, url, poster_url, caption, alt,
      credit, width, height, size_bytes, mime_type, in_gallery, featured, position, created_by)
    select v_new, kind, folder, storage_path, url, poster_url, caption, alt,
      credit, width, height, size_bytes, mime_type, in_gallery, featured, position, auth.uid()
    from public.event_media where event_id = p_source;
  end if;

  return v_new;
end $$;
revoke all on function public.duplicate_event(uuid, text, text, boolean, boolean) from public, anon;
grant execute on function public.duplicate_event(uuid, text, text, boolean, boolean) to authenticated;

-- Indicadores do dashboard (agregados; não expõe dados pessoais).
create or replace function public.dashboard_overview()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_staff() then
    raise exception 'Acesso negado.';
  end if;
  select jsonb_build_object(
    'events_total',      (select count(*) from events where status <> 'archived'),
    'events_published',  (select count(*) from events where status = 'published'),
    'events_draft',      (select count(*) from events where status = 'draft'),
    'events_archived',   (select count(*) from events where status = 'archived'),
    'leads_total',       (select count(*) from leads),
    'leads_new',         (select count(*) from leads where status = 'new'),
    'leads_won',         (select count(*) from leads where status = 'won'),
    'leads_30d',         (select count(*) from leads where created_at > now() - interval '30 days'),
    'tiers_sold',        (select coalesce(sum(t.quantity_sold), 0) from sponsorship_tiers t
                            join events e on e.id = t.event_id where e.status <> 'archived'),
    'tiers_available',   (select coalesce(sum(greatest(t.quantity_total - t.quantity_sold, 0)), 0)
                            from sponsorship_tiers t join events e on e.id = t.event_id
                            where e.status <> 'archived' and t.quantity_total is not null),
    'tiers_revenue',     (select coalesce(sum(t.quantity_sold * t.price), 0) from sponsorship_tiers t
                            join events e on e.id = t.event_id where e.status <> 'archived' and t.price is not null),
    'views_30d',         (select count(*) from event_analytics
                            where name = 'page_view' and created_at > now() - interval '30 days'),
    'leads_by_day',      (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'count', c) order by d), '[]'::jsonb)
                            from (select gs as d, (select count(*) from leads l
                                    where l.created_at >= gs and l.created_at < gs + interval '1 day') as c
                                  from generate_series(date_trunc('day', now()) - interval '29 days',
                                                       date_trunc('day', now()), interval '1 day') gs) x),
    'leads_by_status',   (select coalesce(jsonb_object_agg(status, c), '{}'::jsonb)
                            from (select status, count(*) c from leads group by status) s),
    'by_event',          (select coalesce(jsonb_agg(row_to_json(x) order by x.leads desc), '[]'::jsonb) from (
                            select e.id, e.name, e.slug, e.status,
                              (select count(*) from leads l where l.event_id = e.id) as leads,
                              (select count(*) from leads l where l.event_id = e.id and l.status = 'won') as won,
                              (select count(*) from event_analytics a where a.event_id = e.id and a.name = 'page_view') as views,
                              (select count(distinct a.session_id) from event_analytics a where a.event_id = e.id and a.name = 'page_view') as visitors,
                              (select coalesce(sum(t.quantity_sold), 0) from sponsorship_tiers t where t.event_id = e.id) as sold,
                              (select coalesce(sum(t.quantity_total), 0) from sponsorship_tiers t where t.event_id = e.id) as total
                            from events e where e.status <> 'archived') x)
  ) into result;
  return result;
end $$;
revoke all on function public.dashboard_overview() from public, anon;
grant execute on function public.dashboard_overview() to authenticated;

-- Contagem de leads por evento para a listagem (staff).
create or replace function public.event_lead_counts()
returns table (event_id uuid, total bigint, fresh bigint)
language sql stable security definer set search_path = public as $$
  select l.event_id, count(*), count(*) filter (where l.status = 'new')
  from public.leads l
  where public.is_staff()
  group by l.event_id
$$;
revoke all on function public.event_lead_counts() from public, anon;
grant execute on function public.event_lead_counts() to authenticated;

-- Funil de um evento num período (staff com analytics.read).
create or replace function public.event_funnel(p_event uuid, p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  since timestamptz := now() - make_interval(days => least(greatest(p_days, 1), 730));
  result jsonb;
begin
  if not public.has_permission('analytics.read') then
    raise exception 'Acesso negado.';
  end if;
  select jsonb_build_object(
    'counts', (select coalesce(jsonb_object_agg(name, c), '{}'::jsonb) from (
                 select name, count(*) c from event_analytics
                 where event_id = p_event and created_at >= since group by name) s),
    'sessions', (select count(distinct session_id) from event_analytics
                 where event_id = p_event and created_at >= since and name = 'page_view'),
    'by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'views', v, 'leads', l) order by d), '[]'::jsonb) from (
                 select gs d,
                   (select count(*) from event_analytics a where a.event_id = p_event and a.name = 'page_view'
                      and a.created_at >= gs and a.created_at < gs + interval '1 day') v,
                   (select count(*) from event_analytics a where a.event_id = p_event and a.name = 'form_submit'
                      and a.created_at >= gs and a.created_at < gs + interval '1 day') l
                 from generate_series(date_trunc('day', since), date_trunc('day', now()), interval '1 day') gs) x),
    'sources', (select coalesce(jsonb_agg(row_to_json(s)), '[]'::jsonb) from (
                 select coalesce(nullif(utm_source, ''), case when referrer is null or referrer = '' then 'direto'
                        else split_part(split_part(referrer, '://', 2), '/', 1) end) as source,
                        count(*) as views
                 from event_analytics where event_id = p_event and name = 'page_view' and created_at >= since
                 group by 1 order by 2 desc limit 8) s),
    'devices', (select coalesce(jsonb_object_agg(coalesce(device, 'desconhecido'), c), '{}'::jsonb) from (
                 select device, count(*) c from event_analytics
                 where event_id = p_event and name = 'page_view' and created_at >= since group by device) d)
  ) into result;
  return result;
end $$;
revoke all on function public.event_funnel(uuid, int) from public, anon;
grant execute on function public.event_funnel(uuid, int) to authenticated;

-- -----------------------------------------------------------------------------
-- Storage
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml',
        'image/x-icon', 'image/vnd.microsoft.icon', 'video/mp4', 'video/webm', 'application/pdf']
)
on conflict (id) do nothing;

create policy "media: staff envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (public.has_permission('media.write') or public.has_permission('sponsors.write')));
create policy "media: staff substitui" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.has_permission('media.write'))
  with check (bucket_id = 'media' and public.has_permission('media.write'));
create policy "media: staff remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.has_permission('media.write'));
create policy "media: staff lista" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_staff());

-- Comercial só pode alterar a quantidade vendida de uma cota.
create or replace function public.tiers_guard_sales()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.has_permission('events.write')
     or current_setting('role', true) in ('service_role', 'postgres') then
    return new;
  end if;
  if (to_jsonb(new) - 'quantity_sold' - 'updated_at') <> (to_jsonb(old) - 'quantity_sold' - 'updated_at') then
    raise exception 'Seu perfil só pode atualizar as vendas da cota.';
  end if;
  return new;
end $$;
create trigger sponsorship_tiers_guard before update on public.sponsorship_tiers
  for each row execute function public.tiers_guard_sales();
