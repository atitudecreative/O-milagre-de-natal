"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "./ui/toast";

/** Verifica novos leads periodicamente e avisa a equipe dentro do painel. */
export function LeadNotifier({ initial }: { initial: number }) {
  const last = useRef(initial);
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    const tick = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (!res.ok) return;
        const { newLeads, latest } = (await res.json()) as { newLeads: number; latest?: { company: string; event: string } };
        if (newLeads > last.current) {
          toast(latest ? `Novo lead: ${latest.company} — ${latest.event}` : "Você recebeu um novo lead.", "info");
          router.refresh();
        }
        last.current = newLeads;
      } catch {}
    };
    const id = setInterval(tick, 45000);
    return () => clearInterval(id);
  }, [toast, router]);
  return null;
}
