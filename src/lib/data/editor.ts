import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventBundle } from "./events";

/** Dados do editor (deduplicado por requisição entre layout e página). */
export const getEditorData = cache(async (id: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [bundle, integrations, sponsors] = await Promise.all([
    getEventBundle(supabase, { id }),
    supabase.from("event_integrations").select("*").eq("event_id", id).maybeSingle(),
    supabase.from("sponsors").select("id, name, logo_url").order("name"),
  ]);
  if (!bundle) notFound();
  return { bundle, integrations: integrations.data, sponsorOptions: sponsors.data ?? [] };
});
