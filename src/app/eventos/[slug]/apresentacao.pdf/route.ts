import { createPublicClient } from "@/lib/supabase/server";
import { getEventBundle } from "@/lib/data/events";
import { renderEventDeck } from "@/lib/pdf/deck";

export const runtime = "nodejs";

/** Apresentação comercial pública (somente eventos publicados com o PDF habilitado). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getEventBundle(createPublicClient(), { slug });
  if (!bundle || !bundle.event.deck_enabled) {
    return new Response("Apresentação não encontrada.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const pdf = await renderEventDeck(bundle);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${bundle.event.slug}-apresentacao-comercial.pdf"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
