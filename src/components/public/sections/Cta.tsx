import type { CtaSettings, EventBundle, SectionRow } from "@/lib/types";
import { EvImage } from "../EvImage";
import { LeadForm } from "../LeadForm";
import { Reveal } from "../Reveal";
import { TrackedLink } from "../TrackedLink";

export function Cta({ bundle, section, preview }: { bundle: EventBundle; section: SectionRow; preview?: boolean }) {
  const { event, tiers } = bundle;
  const s = (section.settings ?? {}) as CtaSettings;
  const wa = event.whatsapp
    ? `https://wa.me/${event.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse em patrocinar ${event.name}.`)}`
    : null;

  return (
    <section id="interesse" className="relative isolate overflow-hidden">
      {s.background_image ? (
        <div className="absolute inset-0 -z-10">
          <EvImage src={s.background_image} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[var(--ev-bg)]/85" />
        </div>
      ) : null}
      <div className="ev-container ev-section">
        <Reveal>
          {section.eyebrow ? <p className="ev-eyebrow mb-8">{section.eyebrow}</p> : null}
          <h2 className="ev-display max-w-[16ch] text-[clamp(3rem,9vw,9.5rem)]">
            {section.title || "Sua marca precisa estar onde as grandes experiências acontecem."}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-12">
          <Reveal className="md:col-span-4" delay={0.1}>
            {section.body ? <p className="text-lg leading-relaxed text-[var(--ev-muted)]">{section.body}</p> : null}
            <dl className="mt-10 space-y-6 border-t border-[var(--ev-line)] pt-8 text-sm">
              {event.contact_name ? (
                <div>
                  <dt className="ev-micro uppercase tracking-[0.18em]">Fale com</dt>
                  <dd className="mt-1 text-base font-semibold">{event.contact_name}</dd>
                </div>
              ) : null}
              {event.contact_email ? (
                <div>
                  <dt className="ev-micro uppercase tracking-[0.18em]">E-mail</dt>
                  <dd className="mt-1"><a className="ev-link-underline text-base" href={`mailto:${event.contact_email}`}>{event.contact_email}</a></dd>
                </div>
              ) : null}
              {wa ? (
                <div>
                  <dt className="ev-micro uppercase tracking-[0.18em]">WhatsApp</dt>
                  <dd className="mt-1">
                    <TrackedLink href={wa} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="cta_whatsapp" className="ev-link-underline text-base">
                      Conversar agora →
                    </TrackedLink>
                  </dd>
                </div>
              ) : null}
              {event.deck_enabled ? (
                <div>
                  <dt className="ev-micro uppercase tracking-[0.18em]">Apresentação comercial</dt>
                  <dd className="mt-1">
                    <TrackedLink href={`/eventos/${event.slug}/apresentacao.pdf`} event="deck_download" label="deck_pdf" className="ev-link-underline text-base" target="_blank">
                      Baixar PDF →
                    </TrackedLink>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>
          <div className="relative md:col-span-7 md:col-start-6">
            <LeadForm
              eventId={event.id}
              slug={event.slug}
              tiers={tiers.filter((t) => t.enabled)}
              interests={event.form_interests}
              successMessage={event.form_success_message}
              buttonLabel={s.button_label}
              disabled={preview || event.status !== "published"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
