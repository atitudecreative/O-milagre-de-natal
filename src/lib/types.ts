import type { Database, Tables } from "@/lib/schema.types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type EventStatus = Database["public"]["Enums"]["event_status"];
export type SectionType = Database["public"]["Enums"]["section_type"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type InteractionKind = Database["public"]["Enums"]["interaction_kind"];
export type SponsorRelation = Database["public"]["Enums"]["sponsor_relation"];
export type ChartType = Database["public"]["Enums"]["chart_type"];
export type AnalyticsEventName = Database["public"]["Enums"]["analytics_event"];

export type EventRow = Tables<"events">;
export type BrandingRow = Tables<"event_branding">;
export type SectionRow = Tables<"event_sections">;
export type MetricRow = Tables<"event_metrics">;
export type MediaRow = Tables<"event_media">;
export type TestimonialRow = Tables<"event_testimonials">;
export type AudienceRow = Tables<"event_audience">;
export type ResultRow = Tables<"event_results">;
export type OpportunityRow = Tables<"sponsorship_opportunities">;
export type TierRow = Tables<"sponsorship_tiers">;
export type SponsorRow = Tables<"sponsors">;
export type EventSponsorRow = Tables<"event_sponsors">;
export type LeadRow = Tables<"leads">;
export type InteractionRow = Tables<"lead_interactions">;
export type ProfileRow = Tables<"profiles">;
export type IntegrationRow = Tables<"event_integrations">;

export type LinkItem = { label: string; url: string };
export type SocialLink = { network: string; url: string };

/* ---------- Configurações por seção (jsonb `settings`) ---------- */
export type HeroSettings = {
  align?: "left" | "center" | "right";
  vertical?: "top" | "center" | "bottom";
  height?: "screen" | "tall" | "medium";
  overlay?: number;
  title_size?: "xl" | "lg" | "md";
  image_desktop?: string | null;
  image_mobile?: string | null;
  video_url?: string | null;
  video_poster?: string | null;
  primary_label?: string;
  secondary_label?: string;
  show_scroll_hint?: boolean;
  show_logo?: boolean;
  text_color?: string | null;
};
export type MetricsSettings = { show_projections?: boolean };
export type GrandeurSettings = {
  aftermovie_url?: string | null;
  aftermovie_poster?: string | null;
  aftermovie_title?: string | null;
  statement?: string | null;
};
export type AudienceSettings = { statement?: string | null };
export type ResultsSettings = {
  edition_label?: string | null;
  previous_edition_label?: string | null;
  show_comparison?: boolean;
};
export type TiersSettings = { note?: string | null };
export type SponsorsSettings = { show_marquee?: boolean };
export type NextEditionItem = { title: string; description?: string; image_url?: string | null };
export type NextEditionSettings = {
  date_label?: string | null;
  items?: NextEditionItem[];
};
export type CtaSettings = { button_label?: string; background_image?: string | null };
export type FooterSettings = { copyright?: string | null };

export type SectionSettingsMap = {
  hero: HeroSettings;
  metrics: MetricsSettings;
  grandeur: GrandeurSettings;
  audience: AudienceSettings;
  results: ResultsSettings;
  opportunities: Record<string, never>;
  tiers: TiersSettings;
  sponsors: SponsorsSettings;
  next_edition: NextEditionSettings;
  cta: CtaSettings;
  footer: FooterSettings;
};

export type AudienceDatum = { label: string; value: number; code?: string };

export type EventSponsorWithBrand = EventSponsorRow & { sponsor: SponsorRow };

/** Tudo o que a página pública (e o PDF) precisa para renderizar um evento. */
export type EventBundle = {
  event: EventRow;
  branding: BrandingRow;
  sections: SectionRow[];
  metrics: MetricRow[];
  media: MediaRow[];
  testimonials: TestimonialRow[];
  audience: AudienceRow[];
  results: ResultRow[];
  opportunities: OpportunityRow[];
  tiers: TierRow[];
  sponsors: EventSponsorWithBrand[];
  tracking: { meta_pixel_id: string | null; ga_measurement_id: string | null; gtm_id: string | null } | null;
};

export function sectionSettings<T extends SectionType>(section: SectionRow | undefined) {
  return ((section?.settings ?? {}) as SectionSettingsMap[T]) || ({} as SectionSettingsMap[T]);
}
