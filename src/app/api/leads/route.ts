import { NextResponse, after, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createPublicClient } from "@/lib/supabase/server";
import { CONSENT_VERSION, leadSchema } from "@/lib/validation/lead";
import { clientIp, hashIp, verifyTurnstile } from "@/lib/server/request";
import { notifyNewLead } from "@/lib/server/notify";

const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 2500;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json({ ok: false, error: "Revise os campos destacados.", fieldErrors }, { status: 422 });
  }
  const input = parsed.data;

  // Antispam silencioso: bots recebem "ok" mas nada é gravado.
  if (input.website || (input.elapsed_ms != null && input.elapsed_ms < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(request.headers);
  const ipHash = hashIp(ip);
  if (!(await verifyTurnstile(input.turnstile_token, ip))) {
    return NextResponse.json({ ok: false, error: "Não foi possível validar o envio. Recarregue a página." }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { data: recent } = await supabase.rpc("lead_recent_count", { p_ip_hash: ipHash, p_minutes: 10 });
  if ((recent ?? 0) >= MAX_PER_WINDOW) {
    return NextResponse.json({ ok: false, error: "Muitos envios em sequência. Aguarde alguns minutos." }, { status: 429 });
  }

  const id = randomUUID();
  const { error } = await supabase.from("leads").insert({
    id,
    event_id: input.event_id,
    tier_id: input.tier_id ?? null,
    full_name: input.full_name,
    company: input.company,
    job_title: input.job_title,
    email: input.email,
    phone: input.phone,
    segment: input.segment,
    interest: input.interest,
    message: input.message || null,
    consent: true,
    consent_version: CONSENT_VERSION,
    marketing_opt_in: input.marketing_opt_in,
    cta_origin: input.cta_origin ?? null,
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    utm_content: input.utm_content ?? null,
    referrer: input.referrer ?? null,
    landing_path: input.landing_path ?? null,
    ip_hash: ipHash,
    user_agent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
  } as never);

  if (error) {
    console.error("[leads] insert failed", error.code, error.message);
    const notOpen = error.code === "42501";
    return NextResponse.json(
      { ok: false, error: notOpen ? "Este evento não está recebendo contatos no momento." : "Não foi possível registrar agora. Tente novamente." },
      { status: notOpen ? 403 : 500 },
    );
  }

  after(() => notifyNewLead(id));
  return NextResponse.json({ ok: true });
}
