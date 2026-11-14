import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { getEventBundle } from "@/lib/data/events";
import { renderEventDeck } from "@/lib/pdf/deck";

export const runtime = "nodejs";

/** Prévia da apresentação para a equipe (inclui rascunhos e PDF desabilitado). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !session.can("events.read")) {
    return Response.json({ error: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }

  const { id } = await params;
  const bundle = await getEventBundle(await createClient(), { id });
  if (!bundle) {
    return Response.json({ error: "Evento não encontrado." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }

  const pdf = await renderEventDeck(bundle);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${bundle.event.slug}-apresentacao-comercial.pdf"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "private, no-store",
    },
  });
}
