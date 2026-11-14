import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewEventForm } from "@/components/admin/wizard/NewEventForm";
import { WizardSteps } from "@/components/admin/wizard/WizardSteps";

export const metadata: Metadata = { title: "Novo evento" };

export default async function NewEventPage() {
  await requirePermission("events.write");
  const supabase = await createClient();
  const { data: templates } = await supabase.from("events").select("id, name").neq("status", "archived").order("updated_at", { ascending: false }).limit(30);
  return (
    <div className="mx-auto max-w-4xl">
      <WizardSteps current={1} />
      <NewEventForm templates={templates ?? []} />
    </div>
  );
}
