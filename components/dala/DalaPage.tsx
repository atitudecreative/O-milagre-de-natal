import Image from 'next/image';
import { getSiteData, siteUrl } from '@/lib/content';
import { brl, compactNumber, dateParts, lines, pairs, whatsappLink } from '@/lib/format';
import { placementsFrom } from '@/lib/placements';
import { SEGMENTS, type Row } from '@/lib/schema';
import { TierInterestButton, TrackLink } from '@/components/site/motion';
import { KitRequest, LeadForm } from '@/components/site/forms';
import { Constellation } from './Constellation';
import { BrandField, DalaNav, Portraits } from './client';

type Side = 'left' | 'right' | 'center';

function metricText(m: Row) {
  const v = m.value as number | null;
  if (v === null || v === undefined) return 'Em breve';
  const c = m.compact ? compactNumber(v) : { value: v, unit: '' };
  return `${m.prefix ?? ''}${c.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${c.unit ? ` ${c.unit}` : ''}${m.suffix ? ` ${m.suffix}` : ''}`;
}

/**
 * Bloco em duas colunas: o texto ocupa um lado e o outro fica vazio para a
 * constelação (que fica fixa ao fundo e se posiciona nesse lado).
 */
function Block({
  id,
  shape,
  text,
  side = 'right',
  children,
  className = '',
}: {
  id?: string;
  shape: string;
  text?: string;
  side?: Side;
  children: React.ReactNode;
  className?: string;
}) {
  const content = <div className="relative">{children}</div>;
  return (
    <section id={id} data-shape={shape} data-text={text} data-side={side} className={`relative mx-auto grid min-h-[100svh] max-w-[1280px] items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-[120px] ${className}`}>
      {side === 'left' ? (
        <>
          <div className="hidden lg:block" aria-hidden />
          {content}
        </>
      ) : (
        content
      )}
    </section>
  );
}

/** Seção larga (sem figura): a constelação se dispersa ao fundo. */
function Wide({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} data-shape="scatter" className={`relative mx-auto max-w-[1280px] px-6 py-24 lg:py-[120px] ${className}`}>
      {children}
    </section>
  );
}

export async function DalaPage() {
  const d = await getSiteData();
  const s = d.settings;
  const whatsapp = whatsappLink(s.whatsapp_number, s.whatsapp_message);
  const [lead, ...metrics] = d.metrics;
  const featured = d.tiers.find((t) => t.highlight) ?? d.tiers[0];
  const min = Math.min(...d.tiers.map((t) => Number(t.price) || Infinity));
  const placements = placementsFrom(d.tiers);
  const guests = d.people
    .filter((p) => p.photo)
    .map((p) => ({
      id: p.id,
      name: String(p.name),
      role: `${String(p.role || 'Participação especial')}${p.edition ? ` · ${String(p.edition).split('·')[0].trim()}` : ''}`,
      photo: String(p.photo).replace('/media/v2/adesivos/', '/media/v2/recortes/'),
      link: p.link ? String(p.link) : undefined,
    }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${s.event_kicker} ${s.event_name}`,
    description: s.seo_description,
    startDate: s.event_start_date,
    endDate: s.event_end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [`${siteUrl()}${s.og_image || '/media/og.jpg'}`],
    location: {
      '@type': 'Place',
      name: s.venue_name,
      address: { '@type': 'PostalAddress', streetAddress: s.venue_address, addressLocality: 'Rio de Janeiro', addressRegion: 'RJ', addressCountry: 'BR' },
    },
    organizer: { '@type': 'Organization', name: s.producer, url: siteUrl() },
  };

  return (
    <div className="dala relative min-h-screen overflow-x-clip">
      <Constellation />
      <DalaNav />

      <main className="relative z-10">
        {/* HERO — a constelação forma o logotipo */}
        <Block id="topo" shape="logo" side="right" className="pt-32">
          <p className="d-label">
            {s.event_kicker} · {s.event_dates_label} · Barra da Tijuca
          </p>
          <h1 className="d-display mt-6 max-w-[11ch]">
            <span className="sr-only">
              {s.event_name} {s.event_edition}.{' '}
            </span>
            {s.hero_headline}
          </h1>
          <p className="d-body mt-8 max-w-[480px]">{s.hero_text}</p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <TrackLink href="#contato" event="sponsor_cta" label="dala-hero" className="d-btn">
              Quero patrocinar
            </TrackLink>
            <TrackLink href="/api/midia-kit?origem=dala-hero" event="kit_download" label="dala-hero" className="d-link">
              Baixar mídia kit
            </TrackLink>
          </div>
        </Block>

        {/* NÚMEROS — a constelação vira o número */}
        {lead && (
          <Block id="numeros" shape="text" text={metricText(lead)} side="left">
            <p className="d-label">Um sucesso que só cresce</p>
            <h2 className="d-h1 mt-6">
              {metricText(lead)} {String(lead.label)}.
            </h2>
            {lead.note ? <p className="d-caption mt-4">Fonte: {String(lead.note)}</p> : null}
            <dl className="mt-14 space-y-8">
              {metrics.map((m) => (
                <div key={m.id} className="grid grid-cols-[minmax(0,auto)_1fr] items-baseline gap-x-6">
                  <dt className="d-h2 tabular whitespace-nowrap">{metricText(m)}</dt>
                  <dd>
                    <span className="d-body block !text-white">{String(m.label)}</span>
                    {m.status === 'demo' ? <span className="d-caption !text-[#ffb829]">Demonstrativo</span> : m.note ? <span className="d-caption">{String(m.note)}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {/* O MUSICAL — estrela de oito pontas (vitral 2026) */}
        <Block id="musical" shape="star" side="right">
          <p className="d-label">{s.event_name} · {s.event_edition}</p>
          <h2 className="d-h1 mt-6">{s.about_title}</h2>
          <p className="d-body mt-8 max-w-[520px]">{s.about_lead}</p>
          <p className="d-body mt-4 max-w-[520px] !text-[#bdbdbd]">{s.about_story}</p>
          {d.sessions.length > 0 && (
            <div className="mt-12">
              <p className="d-label">Datas</p>
              <p className="d-h1 mt-3 tabular">
                {d.sessions.map((x) => dateParts(String(x.date))?.day).join(' · ')}
                <span className="text-[#9a9a9a]"> dez</span>
              </p>
              <p className="d-caption mt-2">{String(d.sessions[0]?.time || '')} · {s.venue_name}</p>
            </div>
          )}
        </Block>

        {/* EXPERIÊNCIAS — texto puro, zigue-zague */}
        {d.experiences.length > 0 && (
          <Wide>
            <p className="d-label">O que o público vive</p>
            <ol className="mt-10 grid gap-x-16 gap-y-14 md:grid-cols-2">
              {d.experiences.map((e, i) => (
                <li key={e.id} className={i % 2 ? 'md:translate-y-20' : ''}>
                  <p className="d-caption !text-[#8052ff]">{String(e.kicker || '').toUpperCase()}</p>
                  <h3 className="d-h2 mt-3">{String(e.title)}</h3>
                  <p className="d-body mt-4 max-w-[460px] !text-[#bdbdbd]">{String(e.description)}</p>
                </li>
              ))}
            </ol>
          </Wide>
        )}

        {/* EDIÇÕES — árvore */}
        {d.editions.length > 0 && (
          <Block id="edicoes" shape="tree" side="left">
            <p className="d-label">Desde 2024</p>
            <h2 className="d-h1 mt-6">Uma tradição de Natal no Rio.</h2>
            <ol className="mt-14 space-y-12">
              {d.editions.map((e) => (
                <li key={e.id} className="grid grid-cols-[auto_1fr] items-baseline gap-x-6">
                  <span className="d-h2 tabular text-[#9a9a9a]">{String(e.year)}</span>
                  <span>
                    <span className="d-h3 block">{String(e.title)}</span>
                    <span className="d-caption mt-1 block">
                      {String(e.dates ?? '')} · {String(e.venue ?? '')}
                    </span>
                    {e.highlight ? <span className="d-body mt-3 block max-w-[440px] !text-[#bdbdbd]">{String(e.highlight)}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {/* CONVIDADOS — retratos */}
        {guests.length > 0 && (
          <Wide>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
              <h2 className="d-h1">Gente grande já subiu nesse palco.</h2>
              <p className="d-body max-w-[460px] !text-[#bdbdbd] lg:justify-self-end">Participações especiais da edição 2025, no Parque Olímpico da Barra.</p>
            </div>
            <div className="mt-14">
              <Portraits people={guests} />
            </div>
          </Wide>
        )}

        {/* QUEM JÁ PATROCINOU */}
        {s.past_sponsors_image && (
          <Wide id="patrocinadores">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="d-label">Edição 2025</p>
                <h2 className="d-h1 mt-6">{s.past_title}</h2>
              </div>
              <div className="lg:pt-14">
                <p className="d-body max-w-[480px]">{s.past_text}</p>
                {s.past_institutional && <p className="d-caption mt-4">Apoio institucional: {s.past_institutional}</p>}
              </div>
            </div>
            <div className="mt-14 overflow-hidden rounded-[24px]">
              <Image src={s.past_sponsors_image} alt="Mural com os patrocinadores da edição 2025" width={780} height={310} sizes="(max-width:1280px) 100vw, 1232px" className="h-auto w-full" />
            </div>
          </Wide>
        )}

        {/* SUA MARCA — a constelação forma o nome digitado */}
        <Block id="sua-marca" shape="brand" side="right">
          <p className="d-label">Experimente</p>
          <h2 className="d-h1 mt-6">Veja sua marca ganhar forma.</h2>
          <p className="d-body mt-8 max-w-[460px]">Digite o nome da sua empresa. É assim que ela entra no Natal da cidade: no telão, nas comunicações e na área VIP.</p>
          <div className="mt-10 max-w-[520px]">
            <BrandField />
          </div>
          <dl className="mt-10 max-w-[520px] space-y-3">
            {[
              ['Telão de LED', placements.led],
              ['Área e credencial VIP', placements.vip],
              ['Materiais oficiais e stand', placements.materiais],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-baseline justify-between gap-6">
                <dt className="d-body !text-white">{k as string}</dt>
                <dd className="d-caption whitespace-nowrap !text-[#ffb829]">{(v as string[]).length ? (v as string[]).join(' · ') : 'Sob consulta'}</dd>
              </div>
            ))}
          </dl>
        </Block>

        {/* POR QUE PATROCINAR */}
        <Wide id="patrocinio">
          <div className="grid gap-8 lg:grid-cols-2">
            <h2 className="d-h1">Sua marca no centro do palco.</h2>
            <p className="d-body max-w-[480px] lg:pt-4">{s.sponsor_statement}</p>
          </div>
          <ol className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {d.reasons.map((r, i) => (
              <li key={r.id}>
                <p className="d-caption !text-[#ffb829]">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="d-h3 mt-3">{String(r.title)}</h3>
                <p className="d-body mt-3 !text-[#bdbdbd]">{String(r.description)}</p>
              </li>
            ))}
          </ol>
        </Wide>

        {/* PÚBLICO — a constelação escreve "Famílias" */}
        {d.audience.length > 0 && (
          <Block id="publico" shape="text" text="Famílias" side="left">
            <p className="d-label">O público</p>
            <h2 className="d-h1 mt-6">Quem sua marca vai encontrar.</h2>
            <div className="mt-12 space-y-10">
              {d.audience.map((a) => (
                <div key={a.id}>
                  <div className="flex items-baseline gap-3">
                    <h3 className="d-h3">{String(a.title)}</h3>
                    {a.status === 'demo' && <span className="d-caption !text-[#ffb829]">Demonstrativo</span>}
                  </div>
                  {a.kind === 'fact' ? (
                    <p className="d-body mt-2 max-w-[480px] !text-[#bdbdbd]">{String(a.text)}</p>
                  ) : (
                    <ul className="mt-4 max-w-[480px] space-y-3">
                      {pairs(a.data).map((p) => (
                        <li key={p.label}>
                          <div className="flex justify-between text-[15px] font-light">
                            <span>{p.label}</span>
                            <span className="tabular">{p.value}%</span>
                          </div>
                          <div className="mt-1.5 h-[2px] w-full bg-white/10">
                            <div className="h-full bg-white" style={{ width: `${p.value}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* COTAS — ingresso */}
        <Block id="cotas" shape="ticket" side="right">
          <p className="d-label">Cotas de patrocínio{Number.isFinite(min) ? ` · a partir de ${brl(min)}` : ''}</p>
          <h2 className="d-h1 mt-6">Escolha seu lugar.</h2>
          <ol className="mt-12 space-y-14">
            {d.tiers.map((t) => {
              const p = t.price as number | null;
              const isFeat = t.id === featured?.id;
              return (
                <li key={t.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h3 className="d-h2">{String(t.name)}</h3>
                    <p className="d-h3 !text-[#ffb829]">{p ? brl(p) : String(t.price_label || 'Sob consulta')}</p>
                  </div>
                  <p className="d-body mt-3 !text-[#bdbdbd]">{[...lines(t.benefits), ...lines(t.deliverables)].join(' · ')}</p>
                  <div className="mt-5">
                    <TierInterestButton tier={String(t.name)} className={isFeat ? 'd-btn' : 'd-link'}>
                      Tenho interesse{t.slots !== null && t.slots !== undefined ? ` · ${Number(t.slots)} vagas` : ''}
                    </TierInterestButton>
                  </div>
                </li>
              );
            })}
          </ol>
          {s.sponsor_disclaimer && <p className="d-caption mt-10 max-w-[520px]">{s.sponsor_disclaimer}</p>}
        </Block>

        {/* MÍDIA KIT */}
        <Wide id="midia-kit">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="d-label">Apresentação comercial</p>
              <h2 className="d-h1 mt-6">Leve o mídia kit.</h2>
              <ul className="mt-8 space-y-2">
                {lines(s.media_kit_contents).map((c) => (
                  <li key={c} className="d-body !text-[#bdbdbd]">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pt-20">
              <div className="flex flex-wrap items-center gap-8">
                <TrackLink href="/api/midia-kit?origem=dala" event="kit_download" label="dala" className="d-btn">
                  Baixar PDF
                </TrackLink>
                {whatsapp && (
                  <TrackLink href={whatsapp} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="dala-kit" className="d-link">
                    Pedir pelo WhatsApp
                  </TrackLink>
                )}
              </div>
              <div className="mt-12 max-w-[520px]">
                <p className="d-label">Ou receba por e-mail</p>
                <div className="mt-4">
                  <KitRequest autoEmail={!!process.env.RESEND_API_KEY} />
                </div>
              </div>
            </div>
          </div>
        </Wide>

        {/* CONTATO — logotipo */}
        <Block id="contato" shape="logo" side="left">
          <p className="d-label">Fale com a gente</p>
          <h2 className="d-h1 mt-6">Vamos conversar?</h2>
          <p className="d-body mt-6 max-w-[460px] !text-[#bdbdbd]">A equipe comercial retorna com disponibilidade das cotas, prazos e próximos passos.</p>
          <div className="mt-12">
            <LeadForm tiers={d.tiers.map((t) => String(t.name))} segments={SEGMENTS} whatsapp={whatsapp} />
          </div>
        </Block>

        {/* FAQ */}
        <Wide id="faq">
          <div className="grid gap-12 lg:grid-cols-2">
            <h2 className="d-h1">Perguntas frequentes.</h2>
            <div className="space-y-2">
              {d.faqs.map((f) => (
                <details key={f.id} className="group py-4">
                  <summary className="flex cursor-pointer items-baseline justify-between gap-6">
                    <span className="d-h3 transition-colors group-hover:text-[#ffb829]">{String(f.question)}</span>
                    <span className="text-[24px] font-light text-[#9a9a9a] transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="d-body mt-4 max-w-[560px] !text-[#bdbdbd]">{String(f.answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </Wide>

        {/* FECHAMENTO — estrela */}
        <Block shape="star" side="right">
          <h2 className="d-display max-w-[10ch]">{s.final_cta_title}</h2>
          <p className="d-body mt-8 max-w-[460px]">{s.final_cta_text}</p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <TrackLink href="#contato" event="sponsor_cta" label="dala-final" className="d-btn">
              Quero ser patrocinador
            </TrackLink>
            <TrackLink
              href={whatsapp ?? (s.contact_email ? `mailto:${s.contact_email}` : '#contato')}
              target={whatsapp ? '_blank' : undefined}
              rel={whatsapp ? 'noopener noreferrer' : undefined}
              event="contact_cta"
              label="dala-final"
              className="d-link"
            >
              Fale com a equipe
            </TrackLink>
          </div>
        </Block>
      </main>

      <footer className="relative z-10 mx-auto max-w-[1280px] px-6 pb-28 pt-12 sm:pb-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="logotype block w-[220px] !text-white" role="img" aria-label={s.event_name} />
            <p className="d-caption mt-4 max-w-[380px]">{s.footer_text}</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <a href={s.venue_map_url || '#'} target="_blank" rel="noopener noreferrer" className="d-nav">
              {s.venue_name}
            </a>
            {s.contact_email && (
              <a href={`mailto:${s.contact_email}`} className="d-nav">
                {s.contact_email}
              </a>
            )}
            {s.instagram_url && (
              <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="d-nav">
                Instagram
              </a>
            )}
            <a href="/privacidade" className="d-nav">
              Privacidade
            </a>
          </div>
        </div>
        <p className="d-caption mt-10">
          © {new Date().getFullYear()} {s.legal_name || s.producer}
          {s.legal_document ? ` · CNPJ ${s.legal_document}` : ''}. Realização: {s.producer}.
        </p>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  );
}
