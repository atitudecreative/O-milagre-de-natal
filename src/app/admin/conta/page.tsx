import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { AccountForm } from "@/components/admin/AccountForm";
import { ROLE_LABEL } from "@/lib/labels";

export const metadata: Metadata = { title: "Minha conta" };

export default async function Page() {
  const s = await requireStaff();
  return (
    <>
      <PageHeader title="Minha conta" />
      <AccountForm name={s.profile.full_name} email={s.email} role={s.role ? ROLE_LABEL[s.role] : ""} />
    </>
  );
}
