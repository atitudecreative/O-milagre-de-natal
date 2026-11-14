"use client";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { createEvent, duplicateEvent } from "@/actions/events";
import { slugify } from "@/lib/format";
import { Button, Panel, cx } from "../ui";
import { Field, Input, Select, Textarea, Toggle } from "../ui/fields";
import { useToast } from "../ui/toast";

export function NewEventForm({ templates }: { templates: { id: string; name: string }[] }) {
  const [mode, setMode] = useState<"blank" | "copy">("blank");
  const [state, action, pending] = useActionState(createEvent, undefined);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [source, setSource] = useState(templates[0]?.id ?? "");
  const [copyTiers, setCopyTiers] = useState(true);
  const [copyMedia, setCopyMedia] = useState(true);
  const [dupPending, startDup] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const err = state && !state.ok ? state.fieldErrors ?? {} : {};
  const autoSlug = slugTouched ? slug : slugify(name);

  return (
    <div>
      <h1 className="font-display text-5xl leading-none">Vamos começar.</h1>
      <p className="mt-3 text-sm text-mute">Crie do zero ou use outro evento como ponto de partida. Você pode mudar tudo depois.</p>

      <div role="radiogroup" aria-label="Como criar" className="mt-8 grid gap-3 sm:grid-cols-2">
        {([["blank", "Do zero", "Estrutura completa de seções, pronta para preencher."], ["copy", "Duplicar um evento", "Copia identidade, seções e conteúdo — sem leads nem dados comerciais."]] as const).map(([k, t, d]) => (
          <button key={k} type="button" role="radio" aria-checked={mode === k} onClick={() => setMode(k)} disabled={k === "copy" && !templates.length}
            className={cx("rounded-xl p-5 text-left ring-1 transition disabled:opacity-40", mode === k ? "bg-ink text-card ring-ink" : "bg-card ring-line hover:ring-line-strong")}>
            <span className="block text-sm font-semibold">{t}</span>
            <span className={cx("mt-1 block text-xs leading-relaxed", mode === k ? "text-faint" : "text-mute")}>{d}</span>
          </button>
        ))}
      </div>

      {mode === "blank" ? (
        <form action={action} className="mt-8 space-y-6">
          <Panel title="Informações básicas">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome do evento" required htmlFor="n-name" error={err.name} className="sm:col-span-2">
                <Input id="n-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoFocus placeholder="Festival Exemplo 2027" />
              </Field>
              <Field label="Endereço público" htmlFor="n-slug" error={err.slug} hint={`/eventos/${autoSlug || "…"}`} className="sm:col-span-2">
                <Input id="n-slug" name="slug" value={autoSlug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
              </Field>
              <Field label="Slogan" htmlFor="n-tagline" className="sm:col-span-2"><Input id="n-tagline" name="tagline" maxLength={200} /></Field>
              <Field label="Data de início" htmlFor="n-start" error={err.starts_on}><Input id="n-start" name="starts_on" type="date" /></Field>
              <Field label="Data de término" htmlFor="n-end" error={err.ends_on}><Input id="n-end" name="ends_on" type="date" /></Field>
              <Field label="Local" htmlFor="n-venue"><Input id="n-venue" name="venue" maxLength={160} /></Field>
              <div className="grid grid-cols-[1fr_88px] gap-3">
                <Field label="Cidade" htmlFor="n-city"><Input id="n-city" name="city" maxLength={80} /></Field>
                <Field label="UF" htmlFor="n-state"><Input id="n-state" name="state" maxLength={40} /></Field>
              </div>
              <Field label="Número da edição" htmlFor="n-ed" error={err.edition_number}><Input id="n-ed" name="edition_number" type="number" min={1} max={999} /></Field>
              <Field label="Descrição curta" htmlFor="n-desc" className="sm:col-span-2" hint="Até 400 caracteres. Aparece na abertura e no compartilhamento.">
                <Textarea id="n-desc" name="short_description" rows={3} maxLength={400} />
              </Field>
            </div>
          </Panel>
          {state && !state.ok ? <p role="alert" className="text-sm text-bad">{state.error}</p> : null}
          <div className="flex justify-end"><Button type="submit" size="lg" disabled={pending || name.length < 2}>{pending ? "Criando…" : "Criar e seguir para a identidade visual →"}</Button></div>
        </form>
      ) : (
        <div className="mt-8 space-y-6">
          <Panel title="Duplicar evento">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Evento de origem" className="sm:col-span-2">
                <Select value={source} onChange={(e) => setSource(e.target.value)}>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </Field>
              <Field label="Nome do novo evento" required className="sm:col-span-2"><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
              <Toggle label="Copiar cotas" description="Estrutura e valores, com vendas zeradas." checked={copyTiers} onChange={setCopyTiers} />
              <Toggle label="Reutilizar mídias" description="Fotos e vídeos da origem na nova biblioteca." checked={copyMedia} onChange={setCopyMedia} />
            </div>
            <p className="mt-5 rounded-lg bg-paper px-3 py-2 text-xs text-mute ring-1 ring-line">Nunca são copiados: leads, histórico de contatos, acessos, patrocinadores vinculados, vendas de cotas e IDs de rastreamento.</p>
          </Panel>
          <div className="flex justify-end">
            <Button type="button" size="lg" disabled={dupPending || name.length < 2 || !source}
              onClick={() => startDup(async () => {
                const r = await duplicateEvent(source, { name, copyTiers, copyMedia });
                if (!r.ok) return toast(r.error, "bad");
                toast("Evento criado a partir da cópia.");
                router.push(`/admin/eventos/${r.data!.id}/assistente/2`);
              })}>
              {dupPending ? "Duplicando…" : "Duplicar e continuar →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
