"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteSponsor, saveSponsor } from "@/actions/sponsors";
import type { SponsorRow } from "@/lib/types";
import { EvImage } from "@/components/public/EvImage";
import { Button, Empty } from "./ui";
import { Field, Input } from "./ui/fields";
import { useToast } from "./ui/toast";
import { ConfirmDialog } from "./ui/confirm";
import { uploadSponsorLogo } from "./media/upload";

type S = Pick<SponsorRow, "id" | "name" | "logo_url" | "website" | "segment"> & { uses: number };

export function SponsorsLibrary({ initial, canWrite }: { initial: S[]; canWrite: boolean }) {
  const [items, setItems] = useState(initial);
  const [edit, setEdit] = useState<Partial<S> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [del, setDel] = useState<S | null>(null);
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();
  const list = items.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Buscar marca" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar marca" />
        {canWrite ? <Button type="button" onClick={() => { setErrors({}); setEdit({ name: "", logo_url: "", website: "", segment: "" }); }}>Nova marca</Button> : null}
      </div>
      {edit ? (
        <div className="mb-6 rounded-xl bg-card p-5 ring-1 ring-line">
          <div className="grid gap-4 sm:grid-cols-[160px_1fr_1fr]">
            <div>
              <div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-paper-2 p-3 ring-1 ring-line">
                {edit.logo_url ? <EvImage src={edit.logo_url} alt="" width={140} height={80} className="max-h-full w-auto object-contain" /> : <span className="text-xs text-mute">Sem logo</span>}
              </div>
              <input ref={fileRef} type="file" hidden accept="image/svg+xml,image/png,image/webp,image/jpeg" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                try { const url = await uploadSponsorLogo(f); setEdit((x) => ({ ...x, logo_url: url })); } catch (err) { toast(err instanceof Error ? err.message : "Falha", "bad"); }
              }} />
              <Button type="button" size="sm" variant="secondary" className="mt-2 w-full" onClick={() => fileRef.current?.click()}>Enviar logo</Button>
            </div>
            <div className="space-y-4">
              <Field label="Nome" required error={errors.name}><Input value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="Segmento"><Input value={edit.segment ?? ""} onChange={(e) => setEdit({ ...edit, segment: e.target.value })} /></Field>
            </div>
            <div className="space-y-4">
              <Field label="Site" error={errors.website}><Input value={edit.website ?? ""} onChange={(e) => setEdit({ ...edit, website: e.target.value })} placeholder="https://" /></Field>
              <Field label="Logo (URL)" error={errors.logo_url}><Input value={edit.logo_url ?? ""} onChange={(e) => setEdit({ ...edit, logo_url: e.target.value })} /></Field>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEdit(null)}>Cancelar</Button>
            <Button type="button" disabled={pending} onClick={() => start(async () => {
              const r = await saveSponsor(edit.id ?? null, { name: edit.name, logo_url: edit.logo_url ?? "", website: edit.website ?? "", segment: edit.segment ?? "" });
              if (!r.ok) { setErrors(r.fieldErrors ?? {}); return toast(r.error, "bad"); }
              const saved = { ...r.data!, uses: items.find((i) => i.id === r.data!.id)?.uses ?? 0 };
              setItems((s) => (edit.id ? s.map((i) => (i.id === saved.id ? saved : i)) : [...s, saved].sort((a, b) => a.name.localeCompare(b.name))));
              setEdit(null); toast("Marca salva."); router.refresh();
            })}>{pending ? "Salvando…" : "Salvar"}</Button>
          </div>
        </div>
      ) : null}
      {list.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((s) => (
            <li key={s.id} className="rounded-xl bg-card p-4 ring-1 ring-line">
              <div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-paper p-4">
                {s.logo_url ? <EvImage src={s.logo_url} alt={s.name} width={160} height={80} className="max-h-full w-auto object-contain" /> : <span className="text-sm font-semibold">{s.name}</span>}
              </div>
              <p className="mt-3 truncate text-sm font-medium">{s.name}</p>
              <p className="truncate text-xs text-mute">{s.segment || "—"} · {s.uses} evento(s)</p>
              {canWrite ? (
                <div className="mt-2 flex gap-3 text-xs">
                  <button type="button" className="text-mute hover:text-ink" onClick={() => { setErrors({}); setEdit(s); }}>Editar</button>
                  <button type="button" className="text-mute hover:text-bad" onClick={() => setDel(s)}>Excluir</button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : <Empty title="Nenhuma marca" description="Cadastre marcas uma vez e vincule-as a quantos eventos quiser." />}
      <ConfirmDialog open={!!del} tone="danger" title="Excluir marca?" confirmLabel="Excluir" busy={pending} onClose={() => setDel(null)}
        description="Só é possível excluir marcas sem vínculo com eventos."
        onConfirm={() => del && start(async () => { const r = await deleteSponsor(del.id); if (r.ok) { setItems((s) => s.filter((i) => i.id !== del.id)); setDel(null); toast("Marca excluída."); } else toast(r.error, "bad"); })} />
    </div>
  );
}
