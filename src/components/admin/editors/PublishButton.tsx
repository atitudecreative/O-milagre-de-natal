"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setEventStatus } from "@/actions/events";
import type { EventStatus } from "@/lib/types";
import { Button } from "../ui";
import { ConfirmDialog } from "../ui/confirm";
import { useToast } from "../ui/toast";

export function PublishButton({ eventId, slug, status, issues = 0, size = "md" }: { eventId: string; slug: string; status: EventStatus; issues?: number; size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const publish = status !== "published";
  return (
    <>
      <Button type="button" size={size} variant={publish ? "primary" : "secondary"} onClick={() => setOpen(true)}>
        {publish ? "Publicar" : "Despublicar"}
      </Button>
      <ConfirmDialog
        open={open}
        title={publish ? "Publicar a apresentação?" : "Despublicar?"}
        confirmLabel={publish ? "Publicar agora" : "Despublicar"}
        busy={pending}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          start(async () => {
            const r = await setEventStatus(eventId, publish ? "published" : "draft");
            if (r.ok) {
              toast(r.message ?? "Feito.");
              setOpen(false);
              router.refresh();
            } else toast(r.error, "bad");
          })
        }
        description={
          publish ? (
            <>
              A página ficará disponível em <strong>/eventos/{slug}</strong>, aparecerá no sitemap e o formulário começará a registrar leads.
              {issues ? <span className="mt-3 block rounded-lg bg-[#f6ecd9] px-3 py-2 text-warn">Há {issues} pendência(s) na revisão. Você pode publicar mesmo assim.</span> : null}
            </>
          ) : (
            "A página sai do ar imediatamente. Conteúdo e leads são preservados."
          )
        }
      />
    </>
  );
}
