"use client";
import { updateEventContact } from "@/actions/events";
import type { EventRow, LinkItem, SocialLink } from "@/lib/types";
import { Button, Panel } from "../ui";
import { Field, Input, Textarea, Toggle } from "../ui/fields";
import { SaveBar, useSaver } from "./useSaver";

function Pairs({ items, onChange, a, b, disabled }: { items: Record<string, string>[]; onChange: (v: Record<string, string>[]) => void; a: { key: string; label: string }; b: { key: string; label: string }; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input aria-label={a.label} placeholder={a.label} value={it[a.key] ?? ""} onChange={(e) => onChange(items.map((x, k) => (k === i ? { ...x, [a.key]: e.target.value } : x)))} className="w-40" disabled={disabled} />
          <Input aria-label={b.label} placeholder={b.label} value={it[b.key] ?? ""} onChange={(e) => onChange(items.map((x, k) => (k === i ? { ...x, [b.key]: e.target.value } : x)))} disabled={disabled} />
          {!disabled ? <Button type="button" variant="ghost" size="sm" className="h-10" aria-label="Remover" onClick={() => onChange(items.filter((_, k) => k !== i))}>✕</Button> : null}
        </div>
      ))}
      {!disabled ? <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...items, { [a.key]: "", [b.key]: "" }])}>+ Adicionar</Button> : null}
    </div>
  );
}

export function ContactForm({ event, canWrite }: { event: EventRow; canWrite: boolean }) {
  const s = useSaver(
    {
      organizer_name: event.organizer_name ?? "", organizer_document: event.organizer_document ?? "", organizer_about: event.organizer_about ?? "",
      contact_name: event.contact_name ?? "", contact_email: event.contact_email ?? "", contact_phone: event.contact_phone ?? "", whatsapp: event.whatsapp ?? "",
      privacy_contact_email: event.privacy_contact_email ?? "", form_interests: event.form_interests.join("\n"), form_success_message: event.form_success_message ?? "",
      deck_enabled: event.deck_enabled, social_links: (event.social_links as SocialLink[]) ?? [], footer_links: (event.footer_links as LinkItem[]) ?? [],
    } as Record<string, unknown>,
    (v) => updateEventContact(event.id, v),
  );
  const v = s.values as Record<string, string>;
  const inp = (name: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Input id={`c-${name}`} value={v[name] ?? ""} onChange={(e) => s.set(name, e.target.value)} disabled={!canWrite} aria-invalid={s.errors[name] ? true : undefined} {...props} />
  );
  return (
    <div className="space-y-6">
      <Panel title="Organização" description="Exibida no rodapé e na política de privacidade do evento.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Razão social / organizador" htmlFor="c-organizer_name">{inp("organizer_name")}</Field>
          <Field label="CNPJ" htmlFor="c-organizer_document">{inp("organizer_document")}</Field>
          <Field label="Sobre a organização" htmlFor="c-about" className="sm:col-span-2"><Textarea id="c-about" rows={3} value={v.organizer_about} onChange={(e) => s.set("organizer_about", e.target.value)} disabled={!canWrite} maxLength={1200} /></Field>
        </div>
      </Panel>
      <Panel title="Contato comercial">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Responsável" htmlFor="c-contact_name">{inp("contact_name")}</Field>
          <Field label="E-mail" htmlFor="c-contact_email" error={s.errors.contact_email}>{inp("contact_email", { type: "email" })}</Field>
          <Field label="Telefone" htmlFor="c-contact_phone">{inp("contact_phone")}</Field>
          <Field label="WhatsApp" hint="Com DDI e DDD, só números: 5581999999999" htmlFor="c-whatsapp" error={s.errors.whatsapp}>{inp("whatsapp", { inputMode: "numeric" })}</Field>
          <Field label="E-mail do encarregado de dados (LGPD)" hint="Canal para solicitações de titulares." htmlFor="c-privacy" error={s.errors.privacy_contact_email} className="sm:col-span-2">{inp("privacy_contact_email", { type: "email", id: "c-privacy" })}</Field>
        </div>
      </Panel>
      <Panel title="Formulário de interesse" description="Campos fixos: nome, empresa, cargo, e-mail, telefone, segmento, interesse, cota e mensagem.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Opções de interesse comercial" hint="Uma por linha." error={s.errors.form_interests}>
            <Textarea rows={6} value={v.form_interests} onChange={(e) => s.set("form_interests", e.target.value)} disabled={!canWrite} />
          </Field>
          <div className="space-y-5">
            <Field label="Mensagem após o envio" htmlFor="c-success"><Textarea id="c-success" rows={3} value={v.form_success_message} onChange={(e) => s.set("form_success_message", e.target.value)} disabled={!canWrite} maxLength={400} /></Field>
            <Toggle label="Apresentação em PDF" description="Exibe o link “Baixar PDF” na página." checked={Boolean(s.values.deck_enabled)} onChange={(x) => s.set("deck_enabled", x)} disabled={!canWrite} />
          </div>
        </div>
      </Panel>
      <Panel title="Redes sociais e links do rodapé">
        <div className="grid gap-8 lg:grid-cols-2">
          <Field label="Redes sociais" error={s.errors.social_links}>
            <Pairs items={s.values.social_links as Record<string, string>[]} onChange={(x) => s.set("social_links", x)} a={{ key: "network", label: "Rede" }} b={{ key: "url", label: "https://…" }} disabled={!canWrite} />
          </Field>
          <Field label="Links institucionais" error={s.errors.footer_links}>
            <Pairs items={s.values.footer_links as Record<string, string>[]} onChange={(x) => s.set("footer_links", x)} a={{ key: "label", label: "Texto" }} b={{ key: "url", label: "https://… ou mailto:" }} disabled={!canWrite} />
          </Field>
        </div>
      </Panel>
      <SaveBar dirty={s.dirty} pending={s.pending} onSave={s.save} onReset={s.reset} disabled={!canWrite} />
    </div>
  );
}
