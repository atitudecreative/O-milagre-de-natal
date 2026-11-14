import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { leadsQuery, parseLeadFilters } from "@/lib/data/leads";
import { audit } from "@/lib/server/audit";
import { LEAD_STATUS_LABEL } from "@/lib/labels";
import type { LeadStatus } from "@/lib/types";

function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  // Evita injeção de fórmulas em planilhas (CSV injection).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.can("leads.export")) return new NextResponse("Não autorizado", { status: 401 });
  const filters = parseLeadFilters(Object.fromEntries(request.nextUrl.searchParams));
  const supabase = await createClient();
  const { data, error } = await leadsQuery(supabase, filters).range(0, 9999);
  if (error) return new NextResponse("Erro ao exportar", { status: 500 });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];

  const header = ["Data", "Evento", "Status", "Nome", "Empresa", "Cargo", "E-mail", "Telefone", "Segmento", "Interesse", "Cota", "Mensagem", "Valor estimado", "Origem (CTA)", "utm_source", "utm_medium", "utm_campaign", "Referência", "Consentimento em", "Aceita marketing"];
  const lines = rows.map((l) =>
    [
      new Date(String(l.created_at)).toLocaleString("pt-BR"),
      (l.event as { name?: string } | null)?.name,
      LEAD_STATUS_LABEL[l.status as LeadStatus],
      l.full_name, l.company, l.job_title, l.email, l.phone, l.segment, l.interest, l.tier_name, l.message, l.estimated_value,
      l.cta_origin, l.utm_source, l.utm_medium, l.utm_campaign, l.referrer,
      new Date(String(l.consent_at)).toLocaleString("pt-BR"), l.marketing_opt_in ? "sim" : "não",
    ].map(cell).join(";"),
  );
  await audit({ actorId: session.userId, action: "leads.export", entity: "lead", summary: `Exportou ${rows.length} leads (CSV)`, meta: { ...filters } });
  const body = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
