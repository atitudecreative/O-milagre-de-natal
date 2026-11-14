import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/server";

const schema = z.object({
  event_id: z.uuid(),
  name: z.enum(["page_view", "cta_click", "tiers_view", "form_start", "form_submit", "whatsapp_click", "deck_download"]),
  label: z.string().max(120).optional(),
  session_id: z.string().max(64).optional(),
  path: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  device: z.enum(["mobile", "tablet", "desktop"]).optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
});

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(request: NextRequest) {
  if (BOT.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  let raw: unknown;
  try {
    raw = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const d = parsed.data;
  const { error } = await createPublicClient().from("event_analytics").insert({
    event_id: d.event_id,
    name: d.name,
    label: d.label || null,
    session_id: d.session_id || null,
    path: d.path || null,
    referrer: d.referrer || null,
    device: d.device ?? null,
    utm_source: d.utm_source || null,
    utm_medium: d.utm_medium || null,
    utm_campaign: d.utm_campaign || null,
  });
  return new NextResponse(null, { status: error ? 202 : 204 });
}
