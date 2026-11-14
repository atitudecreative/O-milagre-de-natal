"use client";
import { updateSection } from "@/actions/events";
import type { MediaRow, SectionRow } from "@/lib/types";
import { SECTION_LABEL } from "@/lib/labels";
import { Button, Panel } from "../ui";
import { Field, Input, Select, Textarea, Toggle } from "../ui/fields";
import { ImageField } from "../media/ImageField";
import { SaveBar, useSaver } from "./useSaver";

export type SettingField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "toggle" | "select" | "image" | "video" | "range" | "items";
  options?: { value: string; label: string }[];
  hint?: string;
  folder?: string;
  min?: number;
  max?: number;
  step?: number;
  span?: 2;
};

type Item = { title: string; description?: string; image_url?: string | null };

export function SectionForm({ eventId, section, fields = [], media, canWrite, text = true, title, description, textLabels }: {
  eventId: string;
  section: SectionRow;
  fields?: SettingField[];
  media: MediaRow[];
  canWrite: boolean;
  text?: boolean;
  title?: string;
  description?: string;
  textLabels?: { eyebrow?: string; title?: string; body?: string };
}) {
  const s = useSaver(
    { id: section.id, enabled: section.enabled, eyebrow: section.eyebrow ?? "", title: section.title ?? "", body: section.body ?? "", settings: (section.settings ?? {}) as Record<string, unknown> },
    (v) => updateSection(eventId, v),
  );
  const settings = s.values.settings as Record<string, unknown>;
  const setSetting = (k: string, v: unknown) => s.set("settings", { ...settings, [k]: v });

  function render(f: SettingField) {
    const v = settings[f.name];
    const id = `s-${section.type}-${f.name}`;
    switch (f.type) {
      case "toggle":
        return <div key={f.name} className={f.span ? "sm:col-span-2" : ""}><Toggle label={f.label} description={f.hint} checked={Boolean(v ?? false)} onChange={(x) => setSetting(f.name, x)} disabled={!canWrite} /></div>;
      case "image":
      case "video":
        return (
          <Field key={f.name} label={f.label} hint={f.hint} className={f.span ? "sm:col-span-2" : ""}>
            <ImageField value={(v as string) ?? null} onChange={(u) => setSetting(f.name, u)} eventId={eventId} media={media} kind={f.type} folder={f.folder} disabled={!canWrite} />
          </Field>
        );
      case "select":
        return (
          <Field key={f.name} label={f.label} hint={f.hint} htmlFor={id} className={f.span ? "sm:col-span-2" : ""}>
            <Select id={id} value={String(v ?? f.options?.[0]?.value ?? "")} onChange={(e) => setSetting(f.name, e.target.value)} disabled={!canWrite}>
              {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>
        );
      case "range":
        return (
          <Field key={f.name} label={`${f.label}: ${Math.round(Number(v ?? 0) * 100)}%`} hint={f.hint} className={f.span ? "sm:col-span-2" : ""}>
            <input type="range" min={f.min ?? 0} max={f.max ?? 1} step={f.step ?? 0.05} value={Number(v ?? 0)} onChange={(e) => setSetting(f.name, Number(e.target.value))} disabled={!canWrite} className="w-full accent-ink" />
          </Field>
        );
      case "textarea":
        return (
          <Field key={f.name} label={f.label} hint={f.hint} htmlFor={id} className={f.span ? "sm:col-span-2" : ""}>
            <Textarea id={id} rows={3} value={String(v ?? "")} onChange={(e) => setSetting(f.name, e.target.value)} disabled={!canWrite} />
          </Field>
        );
      case "items": {
        const items = (Array.isArray(v) ? v : []) as Item[];
        const update = (next: Item[]) => setSetting(f.name, next);
        return (
          <div key={f.name} className="space-y-3 sm:col-span-2">
            <p className="text-xs font-medium text-ink-2">{f.label}</p>
            {items.map((it, i) => (
              <div key={i} className="grid gap-3 rounded-lg bg-paper p-4 ring-1 ring-line sm:grid-cols-[1fr_200px]">
                <div className="space-y-3">
                  <Input placeholder="Título" value={it.title} onChange={(e) => update(items.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} disabled={!canWrite} />
                  <Textarea rows={3} placeholder="Descrição" value={it.description ?? ""} onChange={(e) => update(items.map((x, k) => (k === i ? { ...x, description: e.target.value } : x)))} disabled={!canWrite} />
                  {canWrite ? (
                    <div className="flex gap-1">
                      <Button type="button" size="sm" variant="ghost" disabled={i === 0} onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; update(n); }}>▲</Button>
                      <Button type="button" size="sm" variant="ghost" disabled={i === items.length - 1} onClick={() => { const n = [...items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; update(n); }}>▼</Button>
                      <Button type="button" size="sm" variant="ghost" className="text-bad" onClick={() => update(items.filter((_, k) => k !== i))}>Remover</Button>
                    </div>
                  ) : null}
                </div>
                <ImageField value={it.image_url ?? null} onChange={(u) => update(items.map((x, k) => (k === i ? { ...x, image_url: u } : x)))} eventId={eventId} media={media} disabled={!canWrite} />
              </div>
            ))}
            {canWrite ? <Button type="button" size="sm" variant="secondary" onClick={() => update([...items, { title: "", description: "" }])}>+ Adicionar item</Button> : null}
          </div>
        );
      }
      default:
        return (
          <Field key={f.name} label={f.label} hint={f.hint} htmlFor={id} className={f.span ? "sm:col-span-2" : ""}>
            <Input id={id} value={String(v ?? "")} onChange={(e) => setSetting(f.name, e.target.value)} disabled={!canWrite} />
          </Field>
        );
    }
  }

  return (
    <div>
      <Panel title={title ?? SECTION_LABEL[section.type]} description={description}
        actions={section.type !== "hero" ? <Toggle label="Exibir" checked={s.values.enabled as boolean} onChange={(x) => s.set("enabled", x)} disabled={!canWrite} /> : null}>
        <div className="grid gap-5 sm:grid-cols-2">
          {text ? (
            <>
              <Field label={textLabels?.eyebrow ?? "Chamada (sobretítulo)"} htmlFor={`e-${section.id}`}>
                <Input id={`e-${section.id}`} value={String(s.values.eyebrow)} onChange={(e) => s.set("eyebrow", e.target.value)} maxLength={80} disabled={!canWrite} />
              </Field>
              <Field label={textLabels?.title ?? "Título"} htmlFor={`t-${section.id}`} className="sm:col-span-2">
                <Textarea id={`t-${section.id}`} rows={2} value={String(s.values.title)} onChange={(e) => s.set("title", e.target.value)} maxLength={240} disabled={!canWrite} />
              </Field>
              <Field label={textLabels?.body ?? "Texto de apoio"} htmlFor={`b-${section.id}`} className="sm:col-span-2">
                <Textarea id={`b-${section.id}`} rows={3} value={String(s.values.body)} onChange={(e) => s.set("body", e.target.value)} maxLength={4000} disabled={!canWrite} />
              </Field>
            </>
          ) : null}
          {fields.map(render)}
        </div>
      </Panel>
      <SaveBar dirty={s.dirty} pending={s.pending} onSave={s.save} onReset={s.reset} disabled={!canWrite} />
    </div>
  );
}
