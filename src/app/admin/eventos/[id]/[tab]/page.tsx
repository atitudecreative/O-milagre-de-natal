import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { getEditorData } from "@/lib/data/editor";
import { EditorPanel } from "@/components/admin/editors/EditorPanel";
import { EDITOR_TABS } from "@/components/admin/editors/tabs";

export async function generateMetadata({ params }: PageProps<"/admin/eventos/[id]/[tab]">): Promise<Metadata> {
  const { id, tab } = await params;
  const { bundle } = await getEditorData(id);
  return { title: `${EDITOR_TABS.find((t) => t.slug === tab)?.label ?? "Editor"} · ${bundle.event.name}` };
}

export default async function Page({ params }: PageProps<"/admin/eventos/[id]/[tab]">) {
  const { id, tab } = await params;
  const session = await requireStaff();
  const data = await getEditorData(id);
  return <EditorPanel tab={tab} bundle={data.bundle} integrations={data.integrations} sponsorOptions={data.sponsorOptions} session={session} />;
}
