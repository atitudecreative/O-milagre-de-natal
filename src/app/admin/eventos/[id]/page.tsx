import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<"/admin/eventos/[id]">) {
  const { id } = await params;
  redirect(`/admin/eventos/${id}/geral`);
}
