import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/server";
import { eventDateLabel } from "@/lib/format";
import type { HeroSettings } from "@/lib/types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Apresentação comercial do evento";

/** Imagem de compartilhamento gerada com a identidade do evento (quando não há uma enviada). */
export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: e } = await supabase.from("events").select("id, name, tagline, starts_on, ends_on, date_label, city, state, edition_number").eq("slug", slug).maybeSingle();
  const { data: b } = e ? await supabase.from("event_branding").select("color_background, color_text, color_accent").eq("event_id", e.id).maybeSingle() : { data: null };
  const { data: hero } = e ? await supabase.from("event_sections").select("settings").eq("event_id", e.id).eq("type", "hero").maybeSingle() : { data: null };
  const bg = b?.color_background ?? "#111111";
  const fg = b?.color_text ?? "#ffffff";
  const accent = b?.color_accent ?? "#ff5b2e";
  const img = (hero?.settings as HeroSettings | undefined)?.image_desktop;
  const imgSrc = img?.startsWith("http") ? img : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: bg, color: fg, fontFamily: "sans-serif" }}>
        {imgSrc ? <img src={imgSrc} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover", opacity: 0.45 }} /> : null}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: 4, textTransform: "uppercase" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: accent }} />
            {e?.edition_number ? `${e.edition_number}ª edição · ` : ""}Oportunidades de patrocínio
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 0.9, letterSpacing: -2, textTransform: "uppercase" }}>{e?.name ?? "Evento"}</div>
            <div style={{ marginTop: 24, fontSize: 30, opacity: 0.85 }}>
              {[eventDateLabel(e?.starts_on, e?.ends_on, e?.date_label), [e?.city, e?.state].filter(Boolean).join(" · ")].filter(Boolean).join("  —  ")}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
