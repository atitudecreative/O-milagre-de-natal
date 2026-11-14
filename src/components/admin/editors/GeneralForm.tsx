"use client";
import { useState } from "react";
import { checkSlug, updateEventBasics } from "@/actions/events";
import { slugify } from "@/lib/format";
import type { EventRow } from "@/lib/types";
import { Panel } from "../ui";
import { Field, Input, Textarea } from "../ui/fields";
import { SaveBar, useSaver } from "./useSaver";

export function GeneralForm({ event, canWrite, siteUrl }: { event: EventRow; canWrite: boolean; siteUrl: string }) {
  const s = useSaver(
    {
      name: event.name, slug: event.slug, tagline: event.tagline ?? "", short_description: event.short_description ?? "", description: event.description ?? "",
      edition_number: event.edition_number ?? "", edition_label: event.edition_label ?? "", starts_on: event.starts_on ?? "", ends_on: event.ends_on ?? "",
      date_label: event.date_label ?? "", venue: event.venue ?? "", city: event.city ?? "", state: event.state ?? "", country: event.country ?? "Brasil",
    } as Record<string, unknown>,
    (v) => updateEventBasics(event.id, v),
  );
  const [slugMsg, setSlugMsg] = useState<string | null>(null);
  const v = s.values as Record<string, string>;
  const input = (name: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Input id={`g-${name}`} value={v[name] ?? ""} onChange={(e) => s.set(name, e.target.value)} disabled={!canWrite} aria-invalid={s.errors[name] ? true : undefined} {...props} />
  );

  return (
    <div className="space-y-6">
      <Panel title="Identificação" description="Nome, endereço público e posicionamento.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome do evento" required htmlFor="g-name" error={s.errors.name} className="sm:col-span-2">{input("name", { maxLength: 120 })}</Field>
          <Field label="Endereço público" htmlFor="g-slug" error={s.errors.slug ?? slugMsg} hint={`${siteUrl}/eventos/${v.slug}`} className="sm:col-span-2">
            <div className="flex">
              <span className="flex items-center rounded-l-lg border border-r-0 border-line bg-paper-2 px-3 text-xs text-mute">/eventos/</span>
              <Input id="g-slug" className="rounded-l-none" value={v.slug} disabled={!canWrite}
                onChange={(e) => s.set("slug", slugify(e.target.value))}
                onBlur={async () => { const r = await checkSlug(v.slug, event.id); setSlugMsg(r.available ? null : `Indisponível. Sugestão: ${r.suggestion}`); }} />
            </div>
          </Field>
          <Field label="Slogan" htmlFor="g-tagline" error={s.errors.tagline} className="sm:col-span-2">{input("tagline", { maxLength: 200 })}</Field>
          <Field label="Descrição curta" hint="Aparece na abertura e no compartilhamento (até 400 caracteres)." htmlFor="g-short" error={s.errors.short_description} className="sm:col-span-2">
            <Textarea id="g-short" rows={3} maxLength={400} value={v.short_description} onChange={(e) => s.set("short_description", e.target.value)} disabled={!canWrite} />
          </Field>
          <Field label="Descrição completa" htmlFor="g-desc" error={s.errors.description} className="sm:col-span-2" hint="Usada na apresentação em PDF.">
            <Textarea id="g-desc" rows={6} maxLength={6000} value={v.description} onChange={(e) => s.set("description", e.target.value)} disabled={!canWrite} />
          </Field>
        </div>
      </Panel>
      <Panel title="Data, local e edição">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Número da edição" htmlFor="g-ed" error={s.errors.edition_number}>{input("edition_number", { type: "number", min: 1, max: 999 })}</Field>
          <Field label="Rótulo da edição" hint="Opcional, ex.: “Edição 2027”" htmlFor="g-edl">{input("edition_label", { maxLength: 60 })}</Field>
          <Field label="Início" htmlFor="g-start" error={s.errors.starts_on}>{input("starts_on", { type: "date" })}</Field>
          <Field label="Término" htmlFor="g-end" error={s.errors.ends_on}>{input("ends_on", { type: "date" })}</Field>
          <Field label="Texto da data" hint="Substitui a data automática, ex.: “Setembro de 2027”" htmlFor="g-dl" className="sm:col-span-2 lg:col-span-4">{input("date_label", { maxLength: 80 })}</Field>
          <Field label="Local" htmlFor="g-venue" className="sm:col-span-2">{input("venue", { maxLength: 160 })}</Field>
          <Field label="Cidade" htmlFor="g-city">{input("city", { maxLength: 80 })}</Field>
          <Field label="UF" htmlFor="g-state">{input("state", { maxLength: 40 })}</Field>
        </div>
      </Panel>
      <SaveBar dirty={s.dirty} pending={s.pending} onSave={s.save} onReset={s.reset} disabled={!canWrite} />
    </div>
  );
}
