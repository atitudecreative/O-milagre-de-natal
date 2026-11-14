import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEventBundle } from "@/lib/data/events";
import { EventPage } from "@/components/public/EventPage";

export const metadata: Metadata = { title: "Pré-visualização", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Pré-visualização para a equipe: mostra rascunhos exatamente como ficarão publicados. */
export default async function Preview({ params }: PageProps<"/preview/[id]">) {
  const { id } = await params;
  await requirePermission("events.read");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const bundle = await getEventBundle(await createClient(), { id });
  if (!bundle) notFound();
  return <EventPage bundle={bundle} preview />;
}
