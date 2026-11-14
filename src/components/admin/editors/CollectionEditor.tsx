"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCollectionItem, reorderCollection, saveCollectionItem } from "@/actions/content";
import type { MediaRow } from "@/lib/types";
import { Button, Empty, cx } from "../ui";
import { Field, Input, Select, Textarea, Toggle } from "../ui/fields";
import { useToast } from "../ui/toast";
import { ConfirmDialog } from "../ui/confirm";
import { ImageField } from "../media/ImageField";
import { CONFIGS, type Config, type ConfigKey, type FieldDef, type Row } from "./configs";

type Props = {
  config: ConfigKey;
  eventId: string;
  items: Row[];
  media: MediaRow[];
  canWrite: boolean;
  /** Perfil comercial: só pode atualizar vendas (cotas). */
  salesOnly?: boolean;
  options?: Record<string, { value: string; label: string }[]>;
};

function toForm(row: Row, fields: FieldDef[], defaults: Row = {}) {
  // Campos sem controle visível (ex.: tipo do indicador) vêm dos valores padrão.
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(defaults)) if (!fields.some((f) => f.name === k)) out[k] = row[k] ?? defaults[k];
  for (const f of fields) {
    const v = row[f.name];
    if (f.type === "lines") out[f.name] = Array.isArray(v) ? v.join("\n") : (v ?? "");
    else if (f.type === "toggle") out[f.name] = Boolean(v);
    else if (f.type === "datapoints") out[f.name] = Array.isArray(v) ? v : [];
    else out[f.name] = v ?? "";
  }
  return out;
}

export function CollectionEditor({ config, eventId, items: initial, media, canWrite, salesOnly, options = {} }: Props) {
  const cfg: Config = CONFIGS[config];
  const [items, setItems] = useState<Row[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function open(row: Row | null) {
    setErrors({});
    if (row) {
      setOpenId(row.id as string);
      setDraft(toForm(row, cfg.fields, cfg.defaults));
    } else {
      setOpenId("new");
      setDraft(toForm({ ...cfg.defaults }, cfg.fields, cfg.defaults));
    }
  }

  function save() {
    if (!draft) return;
    start(async () => {
      const id = openId === "new" ? null : openId;
      const res = await saveCollectionItem(cfg.table, eventId, id, draft);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast(res.error, "bad");
        return;
      }
      toast(res.message ?? "Salvo.");
      const saved: Row = { ...(items.find((i) => i.id === id) ?? {}), ...draft, id: res.data!.id };
      for (const f of cfg.fields) if (f.type === "lines") saved[f.name] = String(draft[f.name] ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      setItems((s) => (id ? s.map((i) => (i.id === id ? saved : i)) : [...s, saved]));
      setOpenId(null);
      setDraft(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    start(async () => {
      const res = await deleteCollectionItem(cfg.table, eventId, id);
      if (!res.ok) return toast(res.error, "bad");
      setItems((s) => s.filter((i) => i.id !== id));
      setConfirmDelete(null);
      setOpenId(null);
      toast("Removido.");
      router.refresh();
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    start(async () => {
      const res = await reorderCollection(cfg.table, eventId, next.map((i) => i.id as string));
      if (!res.ok) toast(res.error, "bad");
    });
  }

  const set = (name: string, value: unknown) => setDraft((d) => ({ ...(d ?? {}), [name]: value }));

  function renderField(f: FieldDef) {
    if (!draft) return null;
    if (f.showIf && !f.showIf(draft)) return null;
    const disabled = !canWrite && !(salesOnly && cfg.salesFields?.includes(f.name));
    const v = draft[f.name];
    const id = `f-${config}-${f.name}`;
    const opts = f.options ?? options[f.name] ?? [];
    const common = { id, disabled, "aria-invalid": errors[f.name] ? true : undefined } as const;
    let control: React.ReactNode;
    switch (f.type) {
      case "textarea":
        control = <Textarea {...common} rows={f.rows ?? 3} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} maxLength={f.max} />;
        break;
      case "lines":
        control = <Textarea {...common} rows={f.rows ?? 5} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder ?? "Um item por linha"} />;
        break;
      case "number":
        control = <Input {...common} type="number" inputMode="decimal" step={f.step ?? "any"} value={v === null || v === undefined ? "" : String(v)} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />;
        break;
      case "select":
        control = (
          <Select {...common} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>
            {f.placeholder ? <option value="">{f.placeholder}</option> : null}
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        );
        break;
      case "toggle":
        return (
          <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
            <Toggle label={f.label} description={f.hint} checked={Boolean(v)} onChange={(x) => set(f.name, x)} disabled={disabled} />
          </div>
        );
      case "image":
        control = <ImageField value={(v as string) || null} onChange={(url) => set(f.name, url ?? "")} eventId={eventId} media={media} folder={f.folder} aspect={f.aspect} disabled={disabled} />;
        break;
      case "datapoints":
        control = <DataPoints value={(v as { label: string; value: number | string; code?: string }[]) ?? []} onChange={(x) => set(f.name, x)} disabled={disabled} unit={String(draft.unit ?? "")} withCode={draft.chart_type === "map"} />;
        break;
      default:
        control = <Input {...common} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} maxLength={f.max} />;
    }
    return (
      <Field key={f.name} label={f.label} hint={f.hint} error={errors[f.name]} htmlFor={id} required={f.required} className={f.span === 2 ? "sm:col-span-2" : ""}>
        {control}
      </Field>
    );
  }

  const form = draft ? (
    <div className="border-t border-line bg-paper/60 p-4 md:p-5">
      {cfg.formNote ? <p className="mb-4 rounded-lg bg-card px-3 py-2 text-xs leading-relaxed text-mute ring-1 ring-line">{cfg.formNote(draft)}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">{cfg.fields.map(renderField)}</div>
      {Object.entries(errors).filter(([k, m]) => m && !cfg.fields.some((f) => f.name === k)).map(([k, m]) => <p key={k} className="mt-3 text-xs text-bad">{m}</p>)}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        {openId !== "new" && canWrite ? (
          <Button type="button" variant="ghost" size="sm" className="text-bad" onClick={() => setConfirmDelete(openId)}>Remover</Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => { setOpenId(null); setDraft(null); }}>Cancelar</Button>
          {canWrite || salesOnly ? <Button type="button" size="sm" onClick={save} disabled={pending}>{pending ? "Salvando…" : openId === "new" ? "Adicionar" : "Salvar"}</Button> : null}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      {cfg.intro ? <p className="mb-4 max-w-3xl text-sm leading-relaxed text-mute">{cfg.intro}</p> : null}
      {items.length === 0 && openId !== "new" ? (
        <Empty title={cfg.emptyTitle} description={cfg.emptyText} action={canWrite ? <Button type="button" onClick={() => open(null)}>{cfg.addLabel}</Button> : null} />
      ) : (
        <ul className="overflow-hidden rounded-xl bg-card ring-1 ring-line">
          {items.map((row, i) => (
            <li key={row.id as string} className={cx("border-b border-line last:border-0", openId === row.id && "bg-card")}>
              <div className="flex items-center gap-3 px-4 py-3">
                {canWrite ? (
                  <div className="flex flex-col">
                    <button type="button" aria-label="Mover para cima" disabled={i === 0 || pending} onClick={() => move(i, -1)} className="h-5 w-6 text-xs text-mute hover:text-ink disabled:opacity-25">▲</button>
                    <button type="button" aria-label="Mover para baixo" disabled={i === items.length - 1 || pending} onClick={() => move(i, 1)} className="h-5 w-6 text-xs text-mute hover:text-ink disabled:opacity-25">▼</button>
                  </div>
                ) : null}
                <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => (openId === row.id ? (setOpenId(null), setDraft(null)) : open(row))} aria-expanded={openId === row.id}>
                  {cfg.thumb?.(row) ? <span className="h-10 w-14 shrink-0 rounded bg-paper-2 bg-cover bg-center" style={{ backgroundImage: `url(${cfg.thumb(row)})` }} /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{cfg.title(row, options)}</span>
                    {cfg.subtitle ? <span className="block truncate text-xs text-mute">{cfg.subtitle(row, options)}</span> : null}
                  </span>
                  {cfg.badge?.(row) ? <span className="hidden shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-[11px] text-ink-2 sm:inline">{cfg.badge(row)}</span> : null}
                  <span className="shrink-0 text-xs text-mute">{openId === row.id ? "Fechar" : canWrite || salesOnly ? "Editar" : "Ver"}</span>
                </button>
              </div>
              {openId === row.id ? form : null}
            </li>
          ))}
          {openId === "new" ? <li className="border-t border-line">{form}</li> : null}
        </ul>
      )}
      {canWrite && items.length > 0 && openId !== "new" ? (
        <Button type="button" variant="secondary" className="mt-3" onClick={() => open(null)}>{cfg.addLabel}</Button>
      ) : null}
      <ConfirmDialog open={!!confirmDelete} tone="danger" title="Remover item?" confirmLabel="Remover" busy={pending} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && remove(confirmDelete)} description="Essa ação não pode ser desfeita." />
    </div>
  );
}

function DataPoints({ value, onChange, disabled, unit, withCode }: { value: { label: string; value: number | string; code?: string }[]; onChange: (v: { label: string; value: number | string; code?: string }[]) => void; disabled?: boolean; unit: string; withCode: boolean }) {
  const total = value.reduce((a, d) => a + (Number(d.value) || 0), 0);
  return (
    <div className="space-y-2">
      {value.map((d, i) => (
        <div key={i} className="flex gap-2">
          <Input aria-label="Rótulo" placeholder={withCode ? "UF (ex.: SP)" : "Rótulo (ex.: 18–24)"} value={d.label} disabled={disabled} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, label: e.target.value, ...(withCode ? { code: e.target.value.toUpperCase().slice(0, 2) } : {}) } : x)))} />
          <Input aria-label="Valor" type="number" step="any" className="w-28" placeholder="Valor" value={String(d.value ?? "")} disabled={disabled} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} />
          {!disabled ? <Button type="button" variant="ghost" size="sm" aria-label="Remover linha" onClick={() => onChange(value.filter((_, k) => k !== i))} className="h-10">✕</Button> : null}
        </div>
      ))}
      {!disabled ? <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...value, { label: "", value: "" }])}>+ Linha</Button> : null}
      {unit === "%" && value.length ? <p className={cx("text-xs", Math.abs(total - 100) > 0.5 ? "text-warn" : "text-mute")}>Soma: {total.toFixed(1)}%{Math.abs(total - 100) > 0.5 ? " — confira se deveria totalizar 100%" : ""}</p> : null}
    </div>
  );
}
