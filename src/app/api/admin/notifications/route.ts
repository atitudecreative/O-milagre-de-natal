import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session?.can("leads.read")) return NextResponse.json({ newLeads: 0 }, { status: 401 });
  const supabase = await createClient();
  const [{ count }, { data: latest }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("leads").select("company, event:events(name)").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return NextResponse.json(
    { newLeads: count ?? 0, latest: latest ? { company: latest.company, event: (latest.event as unknown as { name: string } | null)?.name ?? "" } : undefined },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
