import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { LeadStatus } from "@/lib/types";

export type LeadFilters = { q?: string; evento?: string; status?: string; interesse?: string; de?: string; ate?: string; origem?: string };

export function parseLeadFilters(sp: Record<string, string | string[] | undefined>): LeadFilters {
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).slice(0, 120) : undefined);
  return { q: get("q"), evento: get("evento"), status: get("status"), interesse: get("interesse"), de: get("de"), ate: get("ate"), origem: get("origem") };
}

const STATUSES: LeadStatus[] = ["new", "contacted", "negotiating", "proposal_sent", "won", "lost"];

/** Monta a consulta de leads com filtros (RLS garante que só perfis autorizados leem). */
export function leadsQuery(supabase: SupabaseClient<Database>, f: LeadFilters, columns = "*, event:events(id, name, slug)") {
  let q = supabase.from("leads").select(columns, { count: "exact" }).order("created_at", { ascending: false });
  if (f.evento && /^[0-9a-f-]{36}$/i.test(f.evento)) q = q.eq("event_id", f.evento);
  if (f.status && STATUSES.includes(f.status as LeadStatus)) q = q.eq("status", f.status as LeadStatus);
  if (f.interesse) q = q.eq("interest", f.interesse);
  if (f.de && /^\d{4}-\d{2}-\d{2}$/.test(f.de)) q = q.gte("created_at", `${f.de}T00:00:00`);
  if (f.ate && /^\d{4}-\d{2}-\d{2}$/.test(f.ate)) q = q.lte("created_at", `${f.ate}T23:59:59`);
  if (f.origem) q = f.origem === "direto" ? q.is("utm_source", null) : q.eq("utm_source", f.origem);
  if (f.q) {
    const term = f.q.replace(/[%,()]/g, " ").trim();
    if (term) q = q.or(`full_name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,job_title.ilike.%${term}%`);
  }
  return q;
}
