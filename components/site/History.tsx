import Image from 'next/image';
import type { Row } from '@/lib/schema';
import { cx, dateParts, lines } from '@/lib/format';
import { H2, STICKER_BG, Sticker, Tag } from './ui';

const TILT = [-2.2, 1.6, -1.1, 2];

/** Linha do tempo das edições (2024 → 2026). */
export function Editions({ editions }: { editions: Row[] }) {
  if (!editions.length) return null;
  const lastYear = editions[editions.length - 1]?.year;
  return (
    <section id="historia" className="relative overflow-hidden bg-papel py-20 sm:py-28">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <H2 className="max-w-[12ch]">Uma tradição de Natal no Rio.</H2>
          <p className="max-w-sm text-lg font-medium leading-snug text-carbon/75">Cada ano, uma história nova, um palco maior e mais marcas junto com a gente.</p>
        </div>
        <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-5">
          {editions.map((e, i) => {
            const current = e.year === lastYear;
            return (
              <article
                key={e.id}
                className={cx('card relative flex flex-col overflow-hidden p-3 pb-6 transition-transform duration-300 ease-out hover:!rotate-0', STICKER_BG[String(e.color)] ?? 'bg-white')}
                style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}
              >
                {e.image ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-carbon">
                    <Image src={String(e.image)} alt={`Arte oficial ${String(e.title)}`} fill sizes="(max-width:768px) 92vw, 30vw" className="object-cover" />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col px-3 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="display text-[84px] leading-[0.8] lg:text-[104px]">{String(e.year)}</p>
                    {current && <Tag color="bg-white text-carbon">Agora</Tag>}
                  </div>
                  <h3 className="display mt-3 text-[30px] leading-[0.9]">{String(e.title)}</h3>
                  <p className="mt-4 text-[15px] font-bold">{String(e.dates ?? '')}</p>
                  <p className="text-[15px] font-medium opacity-80">{String(e.venue ?? '')}</p>
                  {e.highlight ? <p className="mt-4 text-[15px] font-medium leading-snug">{String(e.highlight)}</p> : null}
                </div>
              </article>
            );
          })}
          <Sticker src="/media/v2/adesivos/acrobata-seda-dir.webp" r={10} className="-top-16 left-[28%] hidden h-[150px] md:block" />
        </div>
      </div>
    </section>
  );
}

/** A edição 2026: proposta, datas e experiências. */
export function Edition2026({ s, sessions, experiences }: { s: Record<string, string>; sessions: Row[]; experiences: Row[] }) {
  const expect = lines(s.about_expect);
  return (
    <section id="sobre" className="relative overflow-hidden border-y border-carbon bg-pessego py-20 sm:py-28">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="logotype block w-[min(90vw,560px)] !text-carbon" role="img" aria-label={s.event_name} />
            <p className="display mt-8 text-[34px] leading-[0.9] sm:text-[48px]">{s.about_title}</p>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-carbon/80">{s.about_lead}</p>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed text-carbon/70">{s.about_story}</p>
            {expect.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {expect.map((x, i) => (
                  <li key={x} className={cx('rounded-full border border-carbon px-4 py-2 text-[14px] font-bold', ['bg-white', 'bg-ouro', 'bg-menta', 'bg-white'][i % 4])}>
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative min-h-[360px] lg:col-span-5">
            <Sticker src="/media/v2/adesivos/elenco-presepio.webp" r={-5} className="right-[8%] top-0 h-[260px] sm:h-[340px]" />
            <Sticker src="/media/v2/adesivos/maria-jose.webp" r={6} className="bottom-0 left-[6%] h-[180px] sm:h-[230px]" />
          </div>
        </div>

        {/* datas como canhotos de ingresso */}
        {sessions.length > 0 && (
          <div id="programacao" className="mt-16 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sessions.map((x, i) => {
              const d = dateParts(String(x.date));
              return (
                <div key={x.id} className={cx('card relative overflow-hidden p-5 sm:p-6', i % 2 ? 'bg-white' : 'bg-ouro')}>
                  <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-carbon bg-pessego" aria-hidden />
                  <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-carbon bg-pessego" aria-hidden />
                  <p className="text-[13px] font-bold uppercase tracking-[0.03em]">{d?.weekday}</p>
                  <p className="display mt-1 text-[88px] leading-[0.8] sm:text-[110px]">{d?.day}</p>
                  <p className="display text-2xl">{d?.month}</p>
                  <p className="mt-4 text-sm font-bold">{String(x.time || '')}</p>
                  {x.status ? <p className="text-sm font-medium opacity-70">{String(x.status)}</p> : null}
                  {x.cta_url ? (
                    <a href={String(x.cta_url)} target="_blank" rel="noopener noreferrer" className="pill pill-solid pill-sm mt-4">
                      Acessar
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* experiências */}
        {experiences.length > 0 && (
          <div className="no-scrollbar -mx-4 mt-16 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
            {experiences.map((e) => (
              <article key={e.id} className="card w-[78vw] shrink-0 snap-start overflow-hidden sm:w-[46vw] lg:w-auto">
                {e.image ? (
                  <div className="relative aspect-[4/3] border-b border-carbon">
                    <Image src={String(e.image)} alt="" fill sizes="(max-width:1024px) 78vw, 18vw" className="object-cover" />
                  </div>
                ) : null}
                <div className="p-5">
                  <h3 className="display text-[24px] leading-[0.92]">{String(e.title)}</h3>
                  <p className="mt-3 text-[14px] font-medium leading-relaxed text-carbon/75">{String(e.description)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Convidados e elenco como adesivos. */
export function Guests({ people }: { people: Row[] }) {
  const withPhoto = people.filter((p) => p.photo);
  if (!withPhoto.length) return null;
  const tilt = [-6, 4, -3, 7, -5, 3];
  const editions = Array.from(new Set(withPhoto.map((p) => String(p.edition || '')).filter(Boolean)));
  return (
    <section className="relative overflow-hidden bg-papel py-20 sm:py-28">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <H2 className="max-w-[13ch]">Gente grande já subiu nesse palco.</H2>
          {editions.length > 0 && <p className="text-lg font-bold">Participações especiais · {editions.join(' · ')}</p>}
        </div>
        <ul className="mt-14 flex flex-wrap items-end justify-center gap-x-1 gap-y-10 sm:gap-x-4">
          {withPhoto.map((p, i) => (
            <li key={p.id} className="relative flex w-[46%] flex-col items-center sm:w-[30%] lg:w-[17%]">
              <div className="relative h-[200px] w-full sm:h-[270px]">
                <Sticker src={String(p.photo)} alt={String(p.name)} r={tilt[i % tilt.length]} className="bottom-0 left-1/2 h-full -translate-x-1/2" />
              </div>
              <p
                className={cx('relative -mt-4 rounded-full border border-carbon px-4 py-2 text-center text-[14px] font-bold', ['bg-ouro', 'bg-white', 'bg-cortina text-white', 'bg-turquesa text-white', 'bg-picadeiro'][i % 5])}
                style={{ transform: `rotate(${-tilt[i % tilt.length] / 2}deg)` }}
              >
                {p.link ? (
                  <a href={String(p.link)} target="_blank" rel="noopener noreferrer">
                    {String(p.name)}
                  </a>
                ) : (
                  String(p.name)
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Mural de quem já patrocinou — prova social. */
export function PastSponsors({ s, partners }: { s: Record<string, string>; partners: Row[] }) {
  if (!s.past_sponsors_image && !partners.length) return null;
  return (
    <section id="patrocinadores" className="relative overflow-hidden bg-palco py-20 text-papel sm:py-28">
      <div className="bulbs absolute inset-x-0 top-0 h-[22px] opacity-90" aria-hidden />
      <div className="bulbs absolute inset-x-0 bottom-0 h-[22px] opacity-90" aria-hidden />
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <H2 className="lg:col-span-7">{s.past_title}</H2>
          <div className="lg:col-span-5">
            <p className="text-lg font-medium leading-relaxed text-papel/85">{s.past_text}</p>
            {s.past_institutional && (
              <p className="mt-4 inline-flex rounded-full border border-papel/60 px-4 py-2 text-[13px] font-bold uppercase tracking-[0.03em]">
                Apoio institucional: {s.past_institutional}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 grid items-start gap-3 lg:grid-cols-12">
          {s.past_master_image && (
            <figure className="relative overflow-hidden rounded-card border border-papel/30 lg:col-span-5">
              <Image src={s.past_master_image} alt="Patrocinador master 2025: Ferreira dos Santos Advogados" width={670} height={130} className="h-auto w-full" />
              <figcaption className="absolute left-3 top-3 rounded-full border border-carbon bg-ouro px-3 py-1 text-[12px] font-bold uppercase text-carbon">Master 2025</figcaption>
            </figure>
          )}
          {s.past_support_image && (
            <figure className="relative overflow-hidden rounded-card border border-papel/30 lg:col-span-7">
              <Image src={s.past_support_image} alt="Apoiadores 2025: Visit Rio, Melodia 97.5, Amorio2, AMA, Cidade Jardim e Chico Sande" width={700} height={90} className="h-auto w-full" />
              <figcaption className="absolute left-3 top-3 rounded-full border border-carbon bg-white px-3 py-1 text-[12px] font-bold uppercase text-carbon">Apoio 2025</figcaption>
            </figure>
          )}
          {s.past_sponsors_image && (
            <figure className="relative overflow-hidden rounded-card border border-papel/30 lg:col-span-12">
              <Image src={s.past_sponsors_image} alt="Mural com os 33 patrocinadores da edição 2025" width={780} height={310} sizes="(max-width:1024px) 100vw, 1300px" className="h-auto w-full" />
              <figcaption className="absolute left-3 top-3 rounded-full border border-carbon bg-white px-3 py-1 text-[12px] font-bold uppercase text-carbon">Patrocinadores 2025</figcaption>
            </figure>
          )}
        </div>

        {partners.length > 0 && (
          <div className="mt-14">
            <p className="display text-3xl">Já confirmados em 2026</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {partners.map((p) => {
                const inner = p.logo ? (
                  <span className="relative block h-14 w-full">
                    <Image src={String(p.logo)} alt={String(p.name)} fill sizes="200px" unoptimized={/\.svg(\?|$)/i.test(String(p.logo))} className="object-contain" />
                  </span>
                ) : (
                  <span className="display text-xl text-carbon">{String(p.name)}</span>
                );
                return p.url ? (
                  <a key={p.id} href={String(p.url)} target="_blank" rel="noopener noreferrer sponsored" className="card flex h-28 items-center justify-center p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5" aria-label={`Site de ${String(p.name)}`}>
                    {inner}
                  </a>
                ) : (
                  <div key={p.id} className="card flex h-28 items-center justify-center p-5">{inner}</div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
