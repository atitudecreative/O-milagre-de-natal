/**
 * Ajudantes que completam campos técnicos (ids, datas, posições) para que
 * `evento.ts` contenha apenas o conteúdo editorial.
 */
import type {
  BrandingRow, EventBundle, EventRow, EventSponsorWithBrand, MetricRow, MediaRow, OpportunityRow,
  ResultRow, SectionRow, SectionSettingsMap, SectionType, TestimonialRow, TierRow, AudienceRow,
} from "@/lib/types";
import type { Json } from "@/lib/schema.types";

const NOW = "2026-01-01T00:00:00.000Z";
const EVENT_ID = "evento";
let seq = 0;
const id = (p: string) => `${p}-${++seq}`;

type Opt<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function event(e: Partial<EventRow> & Pick<EventRow, "name" | "slug">): EventRow {
  return {
    id: EVENT_ID, status: "published", is_demo: false, deck_enabled: true, noindex: false,
    tagline: null, short_description: null, description: null, edition_number: null, edition_label: null,
    starts_on: null, ends_on: null, date_label: null, venue: null, city: null, state: null, country: "Brasil",
    organizer_name: null, organizer_document: null, organizer_about: null, contact_name: null, contact_email: null,
    contact_phone: null, whatsapp: null, privacy_contact_email: null, social_links: [], footer_links: [],
    form_interests: ["Patrocínio de cota", "Naming rights", "Ativação de marca", "Estande", "Mídia digital", "Apoio institucional"],
    form_success_message: null, seo_title: null, seo_description: null, og_image_url: null,
    published_at: NOW, archived_at: null, duplicated_from: null, created_by: null, updated_by: null, created_at: NOW, updated_at: NOW,
    ...e,
  };
}

export function branding(b: Partial<BrandingRow>): BrandingRow {
  return {
    event_id: EVENT_ID, logo_url: null, logo_alt_url: null, favicon_url: null, texture_url: null,
    color_primary: "#F2E8D5", color_secondary: "#1C1B19", color_accent: "#E8572A", color_background: "#0E0D0C", color_text: "#F4F1EA",
    font_heading: "Anton", font_body: "Inter", heading_case: "upper", texture_opacity: 0.08, grain: true, corner_style: "square",
    updated_at: NOW, ...b,
  };
}

type SectionInput<T extends SectionType> = { eyebrow?: string; title?: string; body?: string; enabled?: boolean; settings?: SectionSettingsMap[T] };
/** Seções na ordem em que aparecem. Remova uma linha ou use `enabled: false` para ocultar. */
export function sections(list: { [T in SectionType]: [T, SectionInput<T>] }[SectionType][]): SectionRow[] {
  return list.map(([type, s], position) => ({
    id: id("sec"), event_id: EVENT_ID, type, position, enabled: s.enabled ?? true,
    eyebrow: s.eyebrow ?? null, title: s.title ?? null, body: s.body ?? null, settings: (s.settings ?? {}) as NonNullable<Json>, updated_at: NOW,
  }));
}

const withMeta = <T,>(items: T[], prefix: string) =>
  items.map((it, position) => ({ id: id(prefix), event_id: EVENT_ID, created_at: NOW, position, ...it }));

type MetricIn = Opt<Omit<MetricRow, "id" | "event_id" | "created_at" | "position">, "prefix" | "unit" | "description" | "source" | "period" | "animate" | "featured" | "kind">;
export const metrics = (l: MetricIn[]): MetricRow[] =>
  withMeta(l.map((m) => ({ kind: "actual" as const, prefix: null, unit: null, description: null, source: null, period: null, animate: true, featured: false, ...m })), "met");

type MediaIn = Opt<Omit<MediaRow, "id" | "event_id" | "created_at" | "position">, "kind" | "folder" | "storage_path" | "poster_url" | "caption" | "alt" | "credit" | "width" | "height" | "size_bytes" | "mime_type" | "in_gallery" | "featured" | "created_by">;
export const media = (l: MediaIn[]): MediaRow[] =>
  withMeta(l.map((m) => ({ kind: "image" as const, folder: "galeria", storage_path: null, poster_url: null, caption: null, alt: null, credit: null, width: null, height: null, size_bytes: null, mime_type: null, in_gallery: false, featured: false, created_by: null, ...m })), "med");

type TestimonialIn = Opt<Omit<TestimonialRow, "id" | "event_id" | "created_at" | "position">, "role" | "company" | "avatar_url" | "context">;
export const testimonials = (l: TestimonialIn[]): TestimonialRow[] =>
  withMeta(l.map((t) => ({ context: "audience", role: null, company: null, avatar_url: null, ...t })), "dep");

type AudienceIn = Opt<Omit<AudienceRow, "id" | "event_id" | "created_at" | "position" | "data">, "dimension" | "chart_type" | "unit" | "source" | "period" | "note"> & { data: { label: string; value: number }[] };
export const audience = (l: AudienceIn[]): AudienceRow[] =>
  withMeta(l.map((a) => ({ dimension: "other", chart_type: "bar" as const, unit: "%", source: null, period: null, note: null, ...a, data: a.data as NonNullable<Json> })), "pub");

type ResultIn = Opt<Omit<ResultRow, "id" | "event_id" | "created_at" | "position">, "category" | "prefix" | "unit" | "previous_value" | "description" | "source" | "period">;
export const results = (l: ResultIn[]): ResultRow[] =>
  withMeta(l.map((r) => ({ category: "other", prefix: null, unit: null, previous_value: null, description: null, source: null, period: null, ...r })), "res");

type OpportunityIn = Opt<Omit<OpportunityRow, "id" | "event_id" | "created_at" | "position">, "category" | "description" | "deliverables" | "image_url" | "enabled">;
export const opportunities = (l: OpportunityIn[]): OpportunityRow[] =>
  withMeta(l.map((o) => ({ category: "custom", description: null, deliverables: [], image_url: null, enabled: true, ...o })), "opo");

type TierIn = Opt<Omit<TierRow, "id" | "event_id" | "created_at" | "updated_at" | "position">, "tagline" | "description" | "price" | "currency" | "show_price" | "quantity_total" | "quantity_sold" | "deliverables" | "benefits" | "image_url" | "highlight" | "enabled">;
export const tiers = (l: TierIn[]): TierRow[] =>
  withMeta(l.map((t) => ({ tagline: null, description: null, price: null, currency: "BRL", show_price: false, quantity_total: null, quantity_sold: 0, deliverables: [], benefits: [], image_url: null, highlight: false, enabled: true, updated_at: NOW, ...t })), "cot");

type SponsorIn = { name: string; logo_url?: string | null; website?: string | null; segment?: string | null; relation?: EventSponsorWithBrand["relation"]; tier_label?: string | null; case_title?: string | null; case_body?: string | null };
export const sponsors = (l: SponsorIn[]): EventSponsorWithBrand[] =>
  l.map((s, position) => {
    const sponsorId = id("mar");
    return {
      id: id("vin"), event_id: EVENT_ID, sponsor_id: sponsorId, relation: s.relation ?? "past", tier_label: s.tier_label ?? null,
      case_title: s.case_title ?? null, case_body: s.case_body ?? null, position, created_at: NOW,
      sponsor: { id: sponsorId, name: s.name, logo_url: s.logo_url ?? null, website: s.website ?? null, segment: s.segment ?? null, created_at: NOW, updated_at: NOW },
    };
  });

export type Tracking = { meta_pixel_id?: string | null; ga_measurement_id?: string | null; gtm_id?: string | null };
export function bundle(b: Omit<EventBundle, "tracking"> & { tracking?: Tracking }): EventBundle {
  const t = b.tracking ?? {};
  const any = t.meta_pixel_id || t.ga_measurement_id || t.gtm_id;
  return { ...b, tracking: any ? { meta_pixel_id: t.meta_pixel_id ?? null, ga_measurement_id: t.ga_measurement_id ?? null, gtm_id: t.gtm_id ?? null } : null };
}
