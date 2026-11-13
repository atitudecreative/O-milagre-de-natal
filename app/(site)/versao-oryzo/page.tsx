import type { Metadata } from 'next';
import Image from 'next/image';
import { getSiteData } from '@/lib/content';
import { brl, compactNumber, dateParts, lines, pairs, whatsappLink } from '@/lib/format';
import { placementsFrom } from '@/lib/placements';
import { SEGMENTS, type Row } from '@/lib/schema';
import { TrackLink, TierInterestButton } from '@/components/site/motion';
import { KitRequest, LeadForm } from '@/components/site/forms';
import { Nav, SideLabel } from '@/components/oryzo/Chrome';
import { Stage } from '@/components/oryzo/Stage';
import { BrandReveal } from '@/components/oryzo/BrandReveal';
import { DarkGallery } from '@/components/oryzo/Gallery';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getSiteData();
  return {
    title: `${s.seo_title} · versão escura`,
    description: s.seo_description,
    alternates: { canonical: '/' },
    robots: { index: false, follow: true },
  };
}

function metricText(m: Row) {
  const v = m.value as number | null;
  if (v === null || v === undefined) return 'EM BREVE';
  const c = m.compact ? compactNumber(v) : { value: v, unit: '' };
  const n = c.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return `${m.prefix ?? ''}${n}${c.unit ? ` ${c.unit.toUpperCase()}` : ''}${m.suffix ? ` ${m.suffix}` : ''}`;
}

/** Seção "void": título à esquerda, objeto 3D centralizado, texto à direita. */
function Reveal({
  id,
  heading,
  body,
  children,
  stage,
}: {
  id?: string;
  heading: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
  stage: React.ReactNode;
}) {
  return (
    <section id={id} className="o-dash relative grid min-h-[100svh] items-center gap-[18px] border-t px-[18px] py-24 sm:px-6 lg:grid-cols-[1fr_1.3fr_1fr] lg:py-0">
      <div className="self-center">{heading}</div>
      <div className="relative h-[46svh] lg:h-[86svh]">{stage}</div>
      <div className="self-center">
        {body}
        {children}
      </div>
    </section>
  );
}

export default async function VersaoOryzo() {
  const d = await getSiteData();
  const s = d.settings;
  const whatsapp = whatsappLink(s.whatsapp_number, s.whatsapp_message);
  const [lead, ...others] = d.metrics;
  const featured = d.tiers.find((t) => t.highlight) ?? d.tiers[0];
  const min = Math.min(...d.tiers.map((t) => Number(t.price) || Infinity));

  return (
    <div className="oryzo min-h-screen">
      <Nav wordmark={`${s.event_name}`} />
      <SideLabel text={`${s.event_kicker} — Edição ${s.event_edition} — ${s.event_dates_label}`} />

      <main>
        {/* HERO — o logotipo como artefato, flutuando no escuro */}
        <section id="topo" className="relative min-h-[100svh] overflow-hidden px-[18px] pt-24 sm:px-6">
          <div className="absolute inset-0">
            <Stage
              kind="logo"
              className="absolute inset-0"
              fallback={
                <div className="flex h-full items-center justify-center">
                  <span className="logotype block w-[min(80vw,760px)] !text-[#E2A65A]" />
                </div>
              }
            />
          </div>
          <div className="relative max-w-[640px]">
            <p className="o-label">{s.event_kicker} · Barra da Tijuca · Rio de Janeiro</p>
            <h1 className="o-display mt-3">
              {s.event_name}
              <span className="sr-only"> — {s.event_edition}</span>
            </h1>
          </div>

          <div className="absolute inset-x-[18px] bottom-6 flex flex-col gap-3 sm:inset-x-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[440px] rounded-[12px] bg-bark/70 p-6 backdrop-blur-md">
              <p className="o-sub">
                {s.event_dates_label} {s.event_edition}. {s.venue_name}.
              </p>
              <div className="o-dash my-4 border-t" />
              <p className="o-text text-warm/85">{s.hero_headline} {s.hero_text}</p>
              <TrackLink href="#contato" event="sponsor_cta" label="oryzo-hero" className="o-btn mt-5">
                Quero patrocinar
              </TrackLink>
            </div>
            <TrackLink href="/api/midia-kit?origem=oryzo-hero" event="kit_download" label="oryzo-hero" className="group hidden w-[260px] overflow-hidden rounded-[12px] border border-cork sm:block">
              <span className="relative block aspect-[16/9]">
                <Image src={s.media_kit_cover || '/media/kv-wide.webp'} alt="" fill sizes="260px" className="o-grade object-cover" />
              </span>
              <span className="flex items-center justify-between bg-walnut px-3 py-2">
                <span className="o-label">Mídia kit {s.event_edition}</span>
                <span className="o-label transition-transform duration-200 group-hover:translate-y-0.5">↓ PDF</span>
              </span>
            </TrackLink>
          </div>
        </section>

        {/* Faixa fotográfica */}
        <div className="relative aspect-[16/7] w-full sm:aspect-[16/5]">
          <Image src="/media/v2/palco-confete.webp" alt="Palco do Musical de Natal com luz e chuva de papel" fill sizes="100vw" className="o-grade object-cover" />
        </div>

        {/* O MUSICAL */}
        <Reveal
          id="sobre"
          heading={<h2 className="o-heading max-w-[12ch]">Não é só um musical.</h2>}
          stage={<Stage kind="hat" className="absolute inset-0" />}
          body={<p className="o-body">{s.about_lead}</p>}
        >
          <ul className="mt-8">
            {lines(s.about_expect).map((x) => (
              <li key={x} className="o-dash o-label border-t py-3">
                {x}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* NÚMEROS — o número é o objeto */}
        {lead && (
          <Reveal
            id="numeros"
            heading={
              <div>
                <h2 className="o-heading max-w-[13ch]">{String(lead.label)}.</h2>
                {lead.note ? <p className="o-micro mt-4 text-brasa">Fonte: {String(lead.note)}</p> : null}
              </div>
            }
            stage={<Stage kind="text" text={metricText(lead)} className="absolute inset-0" fallback={<p className="o-display flex h-full items-center justify-center text-[18vw]">{metricText(lead)}</p>} />}
          >
            <ul>
              {others.map((m) => (
                <li key={m.id} className="o-dash grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-t py-4">
                  <span className="o-heading tabular">{metricText(m)}</span>
                  <span>
                    <span className="o-label block">{String(m.label)}</span>
                    {m.status === 'demo' ? (
                      <span className="o-micro mt-1 block text-brasa">Demonstrativo</span>
                    ) : m.note ? (
                      <span className="o-micro mt-1 block text-driftwood">{String(m.note)}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* EDIÇÕES */}
        {d.editions.length > 0 && (
          <section id="historia" className="o-dash border-t">
            <div className="px-[18px] py-16 sm:px-6">
              <h2 className="o-heading max-w-[16ch]">Uma tradição de Natal no Rio.</h2>
            </div>
            <div className="grid gap-[2px] md:grid-cols-3">
              {d.editions.map((e) => (
                <article key={e.id}>
                  {e.image ? (
                    <div className="relative aspect-[16/10]">
                      <Image src={String(e.image)} alt={`Arte oficial ${String(e.title)}`} fill sizes="(max-width:768px) 100vw, 33vw" className="o-grade object-cover" />
                    </div>
                  ) : null}
                  <div className="px-[18px] pb-12 pt-6 sm:px-6">
                    <p className="o-display">{String(e.year)}</p>
                    <p className="o-sub mt-3">{String(e.title)}</p>
                    <div className="o-dash my-4 border-t" />
                    <p className="o-label">{String(e.dates ?? '')}</p>
                    <p className="o-label text-warm/60">{String(e.venue ?? '')}</p>
                    {e.highlight ? <p className="o-text mt-4 text-warm/80">{String(e.highlight)}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <DarkGallery items={d.gallery} />

        {/* PROGRAMAÇÃO 2026 */}
        {d.sessions.length > 0 && (
          <section id="programacao" className="o-dash border-t px-[18px] py-24 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-3">
              <h2 className="o-heading max-w-[12ch]">{s.event_name}, {s.event_edition}.</h2>
              <p className="o-body lg:col-span-2 lg:max-w-[34ch]">{s.about_story}</p>
            </div>
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4">
              {d.sessions.map((x) => {
                const p = dateParts(String(x.date));
                return (
                  <div key={x.id} className="o-dash border-l px-4 py-2 first:border-l-0 first:pl-0 [&:nth-child(3)]:border-l-0 [&:nth-child(3)]:pl-0 lg:[&:nth-child(3)]:border-l lg:[&:nth-child(3)]:pl-4">
                    <p className="o-label text-warm/60">{p?.weekday}</p>
                    <p className="o-display mt-2">
                      {p?.day} {p?.month}
                    </p>
                    <p className="o-label mt-4">{String(x.time ?? '')}</p>
                    {x.status ? <p className="o-micro mt-1 text-brasa">{String(x.status)}</p> : null}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CONVIDADOS */}
        {d.people.length > 0 && (
          <section className="o-dash grid gap-[18px] border-t lg:grid-cols-2">
            <div className="relative min-h-[50svh]">
              <Image src="/media/v2/kv-2025-convidados.webp" alt="Participações especiais da edição 2025" fill sizes="(max-width:1024px) 100vw, 50vw" className="o-grade object-cover" />
            </div>
            <div className="flex flex-col justify-center px-[18px] py-16 sm:px-6">
              <p className="o-label text-warm/60">Já subiram nesse palco</p>
              <ul className="mt-6">
                {d.people.map((p) => (
                  <li key={p.id} className="o-dash flex items-baseline justify-between gap-4 border-t py-3">
                    <span className="o-heading">{String(p.name)}</span>
                    <span className="o-micro text-driftwood">{String(p.edition ?? '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* PATROCINADORES 2025 */}
        {s.past_sponsors_image && (
          <section id="patrocinadores" className="o-dash border-t px-[18px] py-24 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-3">
              <h2 className="o-heading max-w-[14ch]">{s.past_title}</h2>
              <p className="o-body lg:col-span-2 lg:max-w-[36ch]">{s.past_text}</p>
            </div>
            <div className="mt-14 grid gap-[2px] lg:grid-cols-2">
              {s.past_master_image && <Image src={s.past_master_image} alt="Patrocinador master 2025" width={670} height={130} className="h-auto w-full" />}
              {s.past_support_image && <Image src={s.past_support_image} alt="Apoiadores 2025" width={700} height={90} className="h-auto w-full" />}
              <Image src={s.past_sponsors_image} alt="Mural com os patrocinadores da edição 2025" width={780} height={310} sizes="100vw" className="h-auto w-full lg:col-span-2" />
            </div>
            {s.past_institutional && <p className="o-micro mt-4 text-brasa">Apoio institucional — {s.past_institutional}</p>}
          </section>
        )}

        <BrandReveal placements={placementsFrom(d.tiers)} />

        {/* POR QUE PATROCINAR */}
        <section id="patrocinio" className="o-dash border-t px-[18px] py-24 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <h2 className="o-heading max-w-[12ch]">Por que patrocinar.</h2>
            <p className="o-body lg:col-span-2 lg:max-w-[36ch]">{s.sponsor_statement}</p>
          </div>
          <ol className="mt-16 grid gap-x-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {d.reasons.map((r, i) => (
              <li key={r.id} className="o-dash border-t py-6">
                <p className="o-micro text-driftwood">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="o-sub mt-3">{String(r.title)}</h3>
                <p className="o-text mt-3 text-warm/75">{String(r.description)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* PÚBLICO */}
        {d.audience.length > 0 && (
          <section id="publico" className="o-dash border-t px-[18px] py-24 sm:px-6">
            <h2 className="o-heading max-w-[14ch]">Quem sua marca vai encontrar.</h2>
            <div className="mt-14 grid gap-x-[18px] gap-y-10 md:grid-cols-3">
              {d.audience.map((a) => (
                <div key={a.id} className="o-dash border-t pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="o-sub">{String(a.title)}</h3>
                    {a.status === 'demo' && <span className="o-micro text-brasa">Demonstrativo</span>}
                  </div>
                  {a.kind === 'fact' ? (
                    <p className="o-text mt-3 text-warm/80">{String(a.text)}</p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {pairs(a.data).map((p) => (
                        <li key={p.label}>
                          <div className="o-label flex justify-between">
                            <span>{p.label}</span>
                            <span className="tabular">{p.value}%</span>
                          </div>
                          <div className="mt-1.5 h-[3px] w-full bg-cork">
                            <div className="h-full bg-warm" style={{ width: `${p.value}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {a.note && a.kind !== 'fact' ? <p className="o-micro mt-4 text-driftwood">{String(a.note)}</p> : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COTAS — o ingresso como objeto */}
        <Reveal
          id="cotas"
          heading={
            <div>
              <h2 className="o-heading">Cotas.</h2>
              {Number.isFinite(min) && <p className="o-sub mt-4">A partir de {brl(min)}</p>}
            </div>
          }
          stage={<Stage kind="ticket" className="absolute inset-0" />}
          body={featured ? <p className="o-body">A cota {String(featured.name)} reúne a maior exposição do musical, com área VIP, backstage e conteúdo gravado com a sua marca.</p> : null}
        />
        <section className="grid gap-[18px] px-[18px] pb-24 sm:px-6 md:grid-cols-2 xl:grid-cols-4">
          {d.tiers.map((t) => {
            const isFeat = t.id === featured?.id;
            const p = t.price as number | null;
            return (
              <article key={t.id} className={`flex flex-col rounded-[12px] border p-6 ${isFeat ? 'border-bark bg-bark' : 'border-cork'}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="o-heading">{String(t.name)}</h3>
                  {t.slots !== null && t.slots !== undefined && <span className="o-micro text-brasa">{Number(t.slots)} vagas</span>}
                </div>
                <p className="o-sub mt-3">{p ? brl(p) : String(t.price_label || 'Sob consulta')}</p>
                <div className="o-dash my-5 border-t" />
                <ul className="flex-1 space-y-2">
                  {[...lines(t.benefits), ...lines(t.deliverables)].map((b) => (
                    <li key={b} className="o-text !text-[15px] text-warm/85">
                      — {b}
                    </li>
                  ))}
                </ul>
                <TierInterestButton tier={String(t.name)} className={`${isFeat ? 'o-btn !bg-walnut hover:!bg-[#1d130b]' : 'o-ghost'} mt-6 self-start`}>
                  Tenho interesse
                </TierInterestButton>
              </article>
            );
          })}
          {s.sponsor_disclaimer && <p className="o-micro text-driftwood md:col-span-2 xl:col-span-4">* {s.sponsor_disclaimer}</p>}
        </section>

        {/* MÍDIA KIT */}
        <section id="midia-kit" className="o-dash grid gap-10 border-t px-[18px] py-24 sm:px-6 lg:grid-cols-3">
          <h2 className="o-heading">Mídia kit.</h2>
          <div className="lg:col-span-2">
            <ul>
              {lines(s.media_kit_contents).map((c) => (
                <li key={c} className="o-dash o-label border-t py-3">
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackLink href="/api/midia-kit?origem=oryzo" event="kit_download" label="oryzo" className="o-btn">
                Baixar PDF
              </TrackLink>
              {whatsapp && (
                <TrackLink href={whatsapp} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="oryzo-kit" className="o-ghost">
                  Pedir pelo WhatsApp
                </TrackLink>
              )}
            </div>
            <div className="mt-12 max-w-xl">
              <p className="field-label">Ou receba por e-mail</p>
              <KitRequest autoEmail={!!process.env.RESEND_API_KEY} />
            </div>
          </div>
        </section>

        {/* CONTATO */}
        <section id="contato" className="o-dash grid gap-10 border-t px-[18px] py-24 sm:px-6 lg:grid-cols-3">
          <div>
            <h2 className="o-heading">Vamos conversar.</h2>
            <p className="o-text mt-6 max-w-sm text-warm/75">A equipe comercial retorna com disponibilidade das cotas, prazos e próximos passos.</p>
            {s.contact_email && (
              <TrackLink href={`mailto:${s.contact_email}`} event="email_click" label="oryzo" className="o-link mt-6 inline-block">
                {s.contact_email}
              </TrackLink>
            )}
          </div>
          <div className="lg:col-span-2">
            <LeadForm tiers={d.tiers.map((t) => String(t.name))} segments={SEGMENTS} whatsapp={whatsapp} />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="o-dash grid gap-10 border-t px-[18px] py-24 sm:px-6 lg:grid-cols-3">
          <h2 className="o-heading">Perguntas.</h2>
          <div className="lg:col-span-2">
            {d.faqs.map((f) => (
              <details key={f.id} className="o-dash group border-t">
                <summary className="flex cursor-pointer items-baseline justify-between gap-6 py-4">
                  <span className="o-label !text-[14px]">{String(f.question)}</span>
                  <span className="o-label transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="o-text max-w-2xl pb-6 text-warm/75">{String(f.answer)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FECHAMENTO */}
        <Reveal
          heading={<h2 className="o-display max-w-[12ch]">{s.final_cta_title}</h2>}
          stage={<Stage kind="star" className="absolute inset-0" />}
          body={<p className="o-body">{s.final_cta_text}</p>}
        >
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackLink href="#contato" event="sponsor_cta" label="oryzo-final" className="o-btn">
              Quero ser patrocinador
            </TrackLink>
            <TrackLink href={whatsapp ?? '#contato'} target={whatsapp ? '_blank' : undefined} rel={whatsapp ? 'noopener noreferrer' : undefined} event="contact_cta" label="oryzo-final" className="o-ghost">
              Fale com a equipe
            </TrackLink>
          </div>
        </Reveal>
      </main>

      <footer className="o-dash flex flex-col gap-3 border-t px-[18px] py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="o-micro text-brasa">Realização — {s.producer}</p>
        <p className="o-micro text-warm/60">
          {s.venue_address} · {s.venue_city}
        </p>
        <p className="o-micro text-warm/60">
          © {new Date().getFullYear()} {s.legal_name || s.producer} ·{' '}
          <a href="/privacidade" className="underline underline-offset-2">
            Privacidade
          </a>{' '}
          ·{' '}
          <a href="/" className="underline underline-offset-2">
            Versão clara
          </a>
        </p>
      </footer>
    </div>
  );
}
