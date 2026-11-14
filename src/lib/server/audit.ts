import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export async function audit(entry: { actorId: string; action: string; entity: string; entityId?: string | null; eventId?: string | null; summary?: string; meta?: Record<string, unknown> }) {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    event_id: entry.eventId ?? null,
    summary: entry.summary?.slice(0, 400) ?? null,
    meta: (entry.meta ?? {}) as NonNullable<Json>,
  });
  if (error) console.error("[audit]", error.message);
}

/** Invalida o cache da página pública do evento e das listagens. */
export async function revalidateEvent(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("slug").eq("id", eventId).maybeSingle();
  if (data?.slug) {
    revalidatePath(`/eventos/${data.slug}`);
    revalidatePath(`/eventos/${data.slug}/privacidade`);
    revalidatePath(`/eventos/${data.slug}/apresentacao.pdf`);
  }
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/admin/eventos/${eventId}`, "layout");
}

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof Error) {
    const m = error.message;
    if (/duplicate key.*slug/i.test(m)) return { ok: false, error: "Já existe um evento com esse endereço (slug)." };
    if (/row-level security|permission denied/i.test(m)) return { ok: false, error: "Seu perfil não tem permissão para esta ação." };
    if (/violates check constraint/i.test(m)) return { ok: false, error: "Algum valor está fora do formato permitido." };
    return { ok: false, error: m.length < 200 ? m : "Erro inesperado." };
  }
  return { ok: false, error: "Erro inesperado." };
}

export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}
