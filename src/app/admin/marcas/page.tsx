import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SponsorsLibrary } from "@/components/admin/SponsorsLibrary";

export const metadata: Metadata = { title: "Marcas" };

export default async function Page() {
  const session = await requireStaff();
  const supabase = await createClient();
  const [{ data: sponsors }, { data: links }] = await Promise.all([
    supabase.from("sponsors").select("id, name, logo_url, website, segment").order("name"),
    supabase.from("event_sponsors").select("sponsor_id"),
  ]);
  const uses = new Map<string, number>();
  for (const l of links ?? []) uses.set(l.sponsor_id, (uses.get(l.sponsor_id) ?? 0) + 1);
  return (
    <>
      <PageHeader title="Marcas" description="Biblioteca global de patrocinadores, parceiros e apoiadores, reutilizada entre eventos." />
      <SponsorsLibrary initial={(sponsors ?? []).map((s) => ({ ...s, uses: uses.get(s.id) ?? 0 }))} canWrite={session.can("sponsors.write")} />
    </>
  );
}
