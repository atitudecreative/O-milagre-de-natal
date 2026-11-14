"use client";
import { updateSeo } from "@/actions/events";
import type { EventRow, MediaRow } from "@/lib/types";
import { EvImage } from "@/components/public/EvImage";
import { Panel } from "../ui";
import { Field, Input, Textarea, Toggle } from "../ui/fields";
import { ImageField } from "../media/ImageField";
import { SaveBar, useSaver } from "./useSaver";

export function SeoForm({ event, media, canWrite, siteUrl, fallbackImage }: { event: EventRow; media: MediaRow[]; canWrite: boolean; siteUrl: string; fallbackImage?: string | null }) {
  const s = useSaver({ seo_title: event.seo_title ?? "", seo_description: event.seo_description ?? "", og_image_url: event.og_image_url ?? "", noindex: event.noindex } as Record<string, unknown>, (v) => updateSeo(event.id, v));
  const v = s.values as Record<string, string>;
  const title = v.seo_title || `${event.name} — Patrocínio e oportunidades para marcas`;
  const desc = v.seo_description || event.short_description || "";
  const img = v.og_image_url || fallbackImage;
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <Panel title="Mecanismos de busca">
          <div className="space-y-5">
            <Field label={`Título (${v.seo_title.length}/70)`} hint="Vazio = nome do evento + “Patrocínio e oportunidades para marcas”." error={s.errors.seo_title}>
              <Input value={v.seo_title} maxLength={70} onChange={(e) => s.set("seo_title", e.target.value)} disabled={!canWrite} />
            </Field>
            <Field label={`Descrição (${v.seo_description.length}/200)`} hint="Vazio = descrição curta do evento." error={s.errors.seo_description}>
              <Textarea rows={3} value={v.seo_description} maxLength={200} onChange={(e) => s.set("seo_description", e.target.value)} disabled={!canWrite} />
            </Field>
            <Toggle label="Ocultar dos buscadores (noindex)" description="Útil para apresentações enviadas apenas por link." checked={Boolean(s.values.noindex)} onChange={(x) => s.set("noindex", x)} disabled={!canWrite} />
          </div>
        </Panel>
        <Panel title="Imagem de compartilhamento" description="1200×630 px. Vazio = imagem gerada automaticamente com a identidade do evento.">
          <ImageField value={v.og_image_url || null} onChange={(u) => s.set("og_image_url", u ?? "")} eventId={event.id} media={media} aspect="aspect-[1200/630]" disabled={!canWrite} />
        </Panel>
        <SaveBar dirty={s.dirty} pending={s.pending} onSave={s.save} onReset={s.reset} disabled={!canWrite} />
      </div>
      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <div>
          <p className="mb-2 text-xs font-medium text-mute">Google</p>
          <div className="rounded-xl bg-card p-4 ring-1 ring-line">
            <p className="truncate text-xs text-ok">{siteUrl.replace(/^https?:\/\//, "")} › eventos › {event.slug}</p>
            <p className="mt-1 line-clamp-1 text-lg text-info">{title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-mute">{desc}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-mute">WhatsApp / LinkedIn</p>
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-line">
            <div className="relative aspect-[1200/630] bg-paper-2">
              {img ? <EvImage src={img} alt="" fill sizes="380px" className="object-cover" /> : <EvImage src={`/eventos/${event.slug}/opengraph-image`} alt="" fill sizes="380px" className="object-cover" unoptimized />}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold">{title}</p>
              <p className="line-clamp-2 text-xs text-mute">{desc}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
