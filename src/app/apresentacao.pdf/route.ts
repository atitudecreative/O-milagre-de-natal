import { EVENTO } from "@/content/evento";
import { renderEventDeck } from "@/lib/pdf/deck";

export const runtime = "nodejs";

/** Apresentação comercial em PDF, gerada a partir de src/content/evento.ts. */
export async function GET() {
  if (!EVENTO.event.deck_enabled) {
    return new Response("Apresentação não disponível.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const pdf = await renderEventDeck(EVENTO);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${EVENTO.event.slug}-apresentacao-comercial.pdf"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
