"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./index";

/** Diálogo de confirmação acessível (usa <dialog> nativo). */
export function ConfirmDialog({ open, title, description, confirmLabel = "Confirmar", tone = "primary", onConfirm, onClose, busy, children }: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,460px)] rounded-2xl bg-card p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 className="font-display text-3xl leading-tight">{title}</h2>
        {description ? <div className="mt-3 text-sm leading-relaxed text-mute">{description}</div> : null}
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-line bg-paper px-6 py-4">
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} type="button" onClick={onConfirm} disabled={busy}>
          {busy ? "Aguarde…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
