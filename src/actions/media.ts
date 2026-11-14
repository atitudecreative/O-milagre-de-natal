"use server";
import { z } from "zod";
import { assertPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/env";
import { audit, fail, revalidateEvent, type ActionResult } from "@/lib/server/audit";
import type { MediaRow } from "@/lib/types";

const registerSchema = z.object({
  kind: z.enum(["image", "video", "embed"]),
  folder: z.string().regex(/^[a-z0-9-]{1,40}$/),
  storage_path: z.string().max(400).nullable().optional(),
  url: z.string().max(2000).optional(),
  width: z.number().int().positive().max(20000).nullable().optional(),
  height: z.number().int().positive().max(20000).nullable().optional(),
  size_bytes: z.number().int().nonnegative().nullable().optional(),
  mime_type: z.string().max(100).nullable().optional(),
  alt: z.string().max(280).nullable().optional(),
  caption: z.string().max(280).nullable().optional(),
});

/** Registra no banco um arquivo já enviado ao Storage (ou um vídeo externo por URL). */
export async function registerMedia(eventId: string, values: z.input<typeof registerSchema>): Promise<ActionResult<MediaRow>> {
  try {
    const session = await assertPermission("media.write");
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Arquivo inválido." };
    const d = parsed.data;
    let url = d.url ?? "";
    if (d.storage_path) {
      if (!d.storage_path.startsWith(`events/${eventId}/`)) return { ok: false, error: "Caminho de arquivo inválido." };
      url = `${SUPABASE_URL}/storage/v1/object/public/media/${d.storage_path}`;
    } else if (!/^https:\/\//.test(url)) {
      return { ok: false, error: "Informe um link https:// válido." };
    }
    const supabase = await createClient();
    const { data: last } = await supabase.from("event_media").select("position").eq("event_id", eventId).order("position", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase
      .from("event_media")
      .insert({
        event_id: eventId,
        kind: d.kind,
        folder: d.folder,
        storage_path: d.storage_path ?? null,
        url,
        width: d.width ?? null,
        height: d.height ?? null,
        size_bytes: d.size_bytes ?? null,
        mime_type: d.mime_type ?? null,
        alt: d.alt ?? null,
        caption: d.caption ?? null,
        in_gallery: d.folder === "galeria" || d.folder === "momentos" || d.folder === "estrutura",
        position: (last?.position ?? -1) + 1,
        created_by: session.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await audit({ actorId: session.userId, action: "media.upload", entity: "event_media", entityId: data.id, eventId, summary: `Enviou ${d.kind === "image" ? "imagem" : "vídeo"}` });
    await revalidateEvent(eventId);
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

/** Substitui o arquivo de uma mídia mantendo legendas, posição e vínculos. */
export async function replaceMediaFile(eventId: string, mediaId: string, values: { storage_path: string; width?: number | null; height?: number | null; size_bytes?: number | null; mime_type?: string | null }): Promise<ActionResult<MediaRow>> {
  try {
    const session = await assertPermission("media.write");
    if (!values.storage_path.startsWith(`events/${eventId}/`)) return { ok: false, error: "Caminho de arquivo inválido." };
    const supabase = await createClient();
    const { data: old } = await supabase.from("event_media").select("storage_path, url").eq("id", mediaId).eq("event_id", eventId).single();
    const url = `${SUPABASE_URL}/storage/v1/object/public/media/${values.storage_path}`;
    const { data, error } = await supabase
      .from("event_media")
      .update({ storage_path: values.storage_path, url, width: values.width ?? null, height: values.height ?? null, size_bytes: values.size_bytes ?? null, mime_type: values.mime_type ?? null })
      .eq("id", mediaId)
      .eq("event_id", eventId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    // Atualiza referências da URL antiga em seções/identidade deste evento.
    if (old?.url) await replaceUrlReferences(eventId, old.url, url);
    if (old?.storage_path) {
      const { count } = await supabase.from("event_media").select("id", { count: "exact", head: true }).eq("storage_path", old.storage_path);
      if (!count) await supabase.storage.from("media").remove([old.storage_path]);
    }
    await audit({ actorId: session.userId, action: "media.replace", entity: "event_media", entityId: mediaId, eventId, summary: "Substituiu um arquivo de mídia" });
    await revalidateEvent(eventId);
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

async function replaceUrlReferences(eventId: string, from: string, to: string) {
  const supabase = await createClient();
  const { data: sections } = await supabase.from("event_sections").select("id, settings").eq("event_id", eventId);
  for (const s of sections ?? []) {
    const raw = JSON.stringify(s.settings);
    if (raw.includes(from)) await supabase.from("event_sections").update({ settings: JSON.parse(raw.split(from).join(to)) }).eq("id", s.id);
  }
  const { data: b } = await supabase.from("event_branding").select("*").eq("event_id", eventId).maybeSingle();
  if (b) {
    const patch: { logo_url?: string; logo_alt_url?: string; favicon_url?: string; texture_url?: string } = {};
    for (const k of ["logo_url", "logo_alt_url", "favicon_url", "texture_url"] as const) if (b[k] === from) patch[k] = to;
    if (Object.keys(patch).length) await supabase.from("event_branding").update(patch).eq("event_id", eventId);
  }
  for (const t of ["sponsorship_opportunities", "sponsorship_tiers"] as const) {
    await supabase.from(t).update({ image_url: to }).eq("event_id", eventId).eq("image_url", from);
  }
}
