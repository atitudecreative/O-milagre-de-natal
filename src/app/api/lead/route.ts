/**
 * Recebe o formulário de interesse e repassa para um webhook (ex.: Make).
 * O endereço fica em MAKE_WEBHOOK_URL (variável de ambiente do Render), nunca
 * no navegador. Sem a variável, responde 503 e o formulário usa o WhatsApp/e-mail.
 */
import { EVENTO } from "@/content/evento";

export const dynamic = "force-dynamic";

const LIMIT = 5; // envios por IP
const WINDOW = 10 * 60 * 1000; // em 10 minutos
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return Response.json({ ok: false, fallback: true }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Campo invisível: só robôs preenchem. Finge sucesso e descarta.
  if (str(body.website, 200)) return Response.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) return Response.json({ ok: false, error: "rate" }, { status: 429 });

  const lead = {
    evento: EVENTO.event.name,
    nome: str(body.full_name, 120),
    empresa: str(body.company, 160),
    cargo: str(body.job_title, 120),
    email: str(body.email, 200),
    telefone: str(body.phone, 40),
    segmento: str(body.segment, 120),
    interesse: str(body.interest, 120),
    cota: str(body.tier, 60),
    mensagem: str(body.message, 3000),
    aceita_novidades: body.marketing_opt_in === true,
    consentimento: body.consent === true,
    origem: str(body.origin, 120),
    pagina: str(body.page, 500),
    utm_source: str(body.utm_source, 120),
    utm_medium: str(body.utm_medium, 120),
    utm_campaign: str(body.utm_campaign, 120),
    enviado_em: new Date().toISOString(),
  };

  const valid =
    lead.nome.length >= 3 &&
    lead.empresa.length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email) &&
    lead.telefone.replace(/\D/g, "").length >= 10 &&
    lead.consentimento;
  if (!valid) return Response.json({ ok: false, error: "invalid" }, { status: 422 });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } catch (e) {
    console.error("[lead] falha ao enviar para o webhook:", e);
    return Response.json({ ok: false, fallback: true }, { status: 502 });
  }
  return Response.json({ ok: true });
}
