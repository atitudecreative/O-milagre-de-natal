import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { EventBundle, EventSponsorWithBrand } from "@/lib/types";

type Client = SupabaseClient<Database>;

/**
 * Carrega o evento completo. O RLS decide o que cada cliente enxerga:
 * o cliente público só recebe eventos publicados; a equipe recebe rascunhos.
 */
export async function getEventBundle(
  supabase: Client,
  where: { slug: string } | { id: string },
): Promise<EventBundle | null> {
  const base = supabase.from("events").select("*");
  const { data: event } = await ("slug" in where ? base.eq("slug", where.slug) : base.eq("id", where.id)).maybeSingle();
  if (!event) return null;

  const id = event.id;
  const [branding, sections, metrics, media, testimonials, audience, results, opportunities, tiers, sponsors, tracking] =
    await Promise.all([
      supabase.from("event_branding").select("*").eq("event_id", id).maybeSingle(),
      supabase.from("event_sections").select("*").eq("event_id", id).order("position"),
      supabase.from("event_metrics").select("*").eq("event_id", id).order("position"),
      supabase.from("event_media").select("*").eq("event_id", id).order("position").order("created_at"),
      supabase.from("event_testimonials").select("*").eq("event_id", id).order("position"),
      supabase.from("event_audience").select("*").eq("event_id", id).order("position"),
      supabase.from("event_results").select("*").eq("event_id", id).order("position"),
      supabase.from("sponsorship_opportunities").select("*").eq("event_id", id).order("position"),
      supabase.from("sponsorship_tiers").select("*").eq("event_id", id).order("position"),
      supabase.from("event_sponsors").select("*, sponsor:sponsors(*)").eq("event_id", id).order("position"),
      supabase.from("public_event_tracking").select("meta_pixel_id, ga_measurement_id, gtm_id").eq("event_id", id).maybeSingle(),
    ]);

  return {
    event,
    branding: branding.data ?? defaultBranding(id),
    sections: sections.data ?? [],
    metrics: metrics.data ?? [],
    media: media.data ?? [],
    testimonials: testimonials.data ?? [],
    audience: audience.data ?? [],
    results: results.data ?? [],
    opportunities: opportunities.data ?? [],
    tiers: tiers.data ?? [],
    sponsors: ((sponsors.data ?? []) as EventSponsorWithBrand[]).filter((s) => s.sponsor),
    tracking: tracking.data ?? null,
  };
}

export function defaultBranding(eventId: string): EventBundle["branding"] {
  return {
    event_id: eventId,
    logo_url: null,
    logo_alt_url: null,
    favicon_url: null,
    color_primary: "#F2E8D5",
    color_secondary: "#1C1B19",
    color_accent: "#E8572A",
    color_background: "#0E0D0C",
    color_text: "#F4F1EA",
    font_heading: "Anton",
    font_body: "Inter",
    heading_case: "upper",
    texture_url: null,
    texture_opacity: 0.08,
    grain: true,
    corner_style: "square",
    updated_at: new Date().toISOString(),
  };
}
