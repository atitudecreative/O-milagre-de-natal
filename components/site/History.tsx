import Image from 'next/image';
import type { Row } from '@/lib/schema';
import { cx, dateParts, lines } from '@/lib/format';
import { Accent, ArchPortrait, Edge, Floater, H2, HEX, Tag } from './ui';

const TILT = [-3, 2, -1.5, 2.5];
const ARCH_FILL = ['bg-turquesa', 'bg-ouro', 'bg-cortina', 'bg-pinheiro', 'bg-picadeiro', 'bg-menta'];

/** Linha do tempo das edições: as artes oficiais como impressões coladas, sem recorte. */
export function Editions({ editions }: { editions: Row[] }) {
  if (!editions.length) return null;
  const lastYear = editions[editions.length - 1]?.year;
  return (
    <section id="historia" className="swirl sw-b relative bg-papel py-20 sm:py-28">
      <Edge color={HEX.papel} kind="scallop" />
      <div className="wrap">
        <div className="flex flex-col items-center text-center">
          <Accent>desde 2024</Accent>
          <H2 className="mt-2 max-w-[14ch]">Uma tradição de Natal no Rio.</H2>
          <span className="divisor mt-6 text-pinheiro" aria-hidden />
        </div>
        <ol className="relative mt-16 flex flex-col items-center gap-14 md:flex-row md:items-start md:justify-center md:gap-6">
          {editions.map((e, i) => {
            const current = e.year === lastYear;
            return (
              <li key={e.id} className={cx('relative w-full max-w-[460px] md:w-1/3', i % 2 ? 'md:mt-16' : '')}>
                <figure className="print relative" style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
                  <span className="tape" aria-hidden />
                  {e.image ? (
                    // proporção original da arte (16:9), sem corte
                    <Image src={String(e.image)} alt={`Arte oficial ${String(e.title)}`} width={1600} height={900} sizes="(max-width:768px) 92vw, 30vw" className="h-auto w-full" />
                  ) : null}
                  <figcaption className="flex items-end justify-between gap-3 px-1 pt-3">
                    <span>
                      <span className="serif block text-[44px] leading-none text-pinheiro">{String(e.year)}</span>
                      <span className="display mt-1 block text-[22px] leading-none">{String(e.title)}</span>
                    </span>
                    {current && <Tag color="bg-ouro">Agora</Tag>}
                  </figcaption>
                </figure>
                <div className="mt-5 px-2 text-center md:text-left">
                  <p className="text-[15px] font-bold">{String(e.dates ?? '')}</p>
                  <p className="text-[15px] font-medium text-carbon/70">{String(e.venue ?? '')}</p>
                  {e.highlight ? <p className="mt-2 text-[15px] font-medium leading-snug">{String(e.highlight)}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** A edição 2026: proposta, datas (ingressos) e experiências (janelas em arco). */
export function Edition2026({ s, sessions, experiences }: { s: Record<string, string>; sessions: Row[]; experiences: Row[] }) {
  const expect = lines(s.about_expect);
  return (
    <section id="sobre" className="swirl sw-c relative bg-pessego py-20 sm:py-28" style={{ ['--sw' as string]: '#EDC3A6' }}>
      <Edge color={HEX.pessego} kind="wave" />
      <div className="wrap">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="logotype block w-[min(90vw,560px)] !text-pinheiro" role="img" aria-label={s.event_name} />
            <p className="display mt-8 text-[34px] leading-[0.9] sm:text-[48px]">{s.about_title}</p>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-carbon/80">{s.about_lead}</p>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed text-carbon/70">{s.about_story}</p>
            {expect.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {expect.map((x, i) => (
                  <li key={x} className={cx('rounded-full border border-carbon px-4 py-2 text-[14px] font-bold', ['bg-white', 'bg-ouro', 'bg-menta', 'bg-white'][i % 4])} style={{ transform: `rotate(${[-1.5, 1, -0.5, 1.5][i % 4]}deg)` }}>
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative mx-auto flex h-[380px] w-full max-w-[460px] items-end justify-center gap-3 sm:h-[460px] lg:col-span-5">
            <ArchPortrait src="/media/v2/recortes/arautos.webp" alt="Arautos do musical" fill="bg-ouro" className="h-[92%] w-[50%]" />
            <ArchPortrait src="/media/v2/recortes/maria-jose.webp" alt="Maria e José no presépio" fill="bg-turquesa" fit={0.7} className="h-[70%] w-[42%]" />
          </div>
        </div>

        {/* datas como ingressos picotados, levemente desalinhados */}
        {sessions.length > 0 && (
          <div id="programacao" className="mt-20 flex flex-wrap justify-center gap-4 lg:justify-between">
            {sessions.map((x, i) => {
              const d = dateParts(String(x.date));
              return (
                <div key={x.id} className="w-[47%] lg:w-[23%]" style={{ transform: `rotate(${[-2, 1.5, -1, 2][i % 4]}deg)` }}>
                  <div className={cx('ticket relative rounded-[22px] border border-carbon p-5 sm:p-6', i % 2 ? 'bg-white' : 'bg-ouro')}>
                    <p className="text-[13px] font-bold uppercase tracking-[0.03em]">{d?.weekday}</p>
                    <p className="display mt-1 text-[84px] leading-[0.8] sm:text-[104px]">{d?.day}</p>
                    <p className="serif text-3xl text-pinheiro">{d?.month}</p>
                    <div className="my-4 border-t border-dashed border-carbon/50" />
                    <p className="text-sm font-bold">{String(x.time || '')}</p>
                    {x.status ? <p className="text-sm font-medium opacity-70">{String(x.status)}</p> : null}
                    {x.cta_url ? (
                      <a href={String(x.cta_url)} target="_blank" rel="noopener noreferrer" className="pill pill-solid pill-sm mt-4">
                        Acessar
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* experiências em janelas de arco, em escadinha */}
        {experiences.length > 0 && (
          <ul className="no-scrollbar -mx-4 mt-20 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
            {experiences.map((e, i) => (
              <li key={e.id} className={cx('w-[70vw] shrink-0 snap-start sm:w-[40vw] lg:w-auto', i % 2 ? 'lg:mt-14' : '')}>
                {e.image ? (
                  <div className="arch-frame relative aspect-[3/4] overflow-hidden border border-carbon">
                    <Image src={String(e.image)} alt="" fill sizes="(max-width:1024px) 70vw, 18vw" className="object-cover" />
                  </div>
                ) : null}
                <h3 className="display mt-4 text-[24px] leading-[0.92]">{String(e.title)}</h3>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-carbon/75">{String(e.description)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Convidados em janelas de arco, com o nome em placa. */
export function Guests({ people }: { people: Row[] }) {
  const withPhoto = people.filter((p) => p.photo);
  if (!withPhoto.length) return null;
  const editions = Array.from(new Set(withPhoto.map((p) => String(p.edition || '')).filter(Boolean)));
  // usa o recorte limpo quando existir (mesmo nome de arquivo em /recortes)
  const src = (p: Row) => String(p.photo).replace('/media/v2/adesivos/', '/media/v2/recortes/');
  return (
    <section className="swirl sw-leve relative bg-papel py-20 sm:py-28">
      <Edge color={HEX.papel} kind="scallop" />
      <div className="wrap">
        <div className="flex flex-col items-center text-center">
          <Accent>participações especiais{editions.length ? ` · ${editions.join(' · ')}` : ''}</Accent>
          <H2 className="mt-2 max-w-[15ch]">Gente grande já subiu nesse palco.</H2>
        </div>
        <ul className="mt-14 flex flex-wrap items-end justify-center gap-x-3 gap-y-10 sm:gap-x-5">
          {withPhoto.map((p, i) => (
            <li key={p.id} className={cx('flex w-[45%] flex-col items-center sm:w-[30%] lg:w-[18%]', i % 2 ? 'lg:mb-10' : '')}>
              <ArchPortrait src={src(p)} alt={String(p.name)} fill={ARCH_FILL[i % ARCH_FILL.length]} className="h-[230px] w-full sm:h-[300px]" />
              <p className="serif -mt-5 rounded-full border border-carbon bg-white px-4 py-2 text-center text-[20px] leading-none" style={{ transform: `rotate(${[-3, 2, -2, 3, -1][i % 5]}deg)` }}>
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

/** Mural de quem já patrocinou — palco escuro com cortina e lâmpadas. */
export function PastSponsors({ s, partners }: { s: Record<string, string>; partners: Row[] }) {
  if (!s.past_sponsors_image && !partners.length) return null;
  return (
    <section id="patrocinadores" className="swirl sw-a relative bg-palco pb-24 pt-16 text-papel sm:pb-32" style={{ ['--sw' as string]: '#24160F' }}>
      <Edge color={HEX.palco} kind="curtain" />
      <div className="bulbs absolute inset-x-0 top-2 h-[22px] opacity-90" aria-hidden />
      <div className="wrap pt-8">
        <div className="flex flex-col items-center text-center">
          <p className="serif text-[30px] leading-none text-ouro sm:text-[36px]">edição 2025</p>
          <H2 className="mt-2 max-w-[16ch]">{s.past_title}</H2>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-papel/85">{s.past_text}</p>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          {s.past_master_image && (
            <figure className="relative mx-auto w-[min(100%,560px)] -rotate-1 overflow-hidden rounded-[999px] border border-papel/40">
              <Image src={s.past_master_image} alt="Patrocinador master 2025: Ferreira dos Santos Advogados" width={670} height={130} className="h-auto w-full" />
              <figcaption className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-carbon bg-ouro px-3 py-0.5 text-[11px] font-bold uppercase text-carbon">Master</figcaption>
            </figure>
          )}
          {s.past_sponsors_image && (
            <figure className="relative mt-6 overflow-hidden rounded-[40px] border border-papel/30">
              <Image src={s.past_sponsors_image} alt="Mural com os patrocinadores da edição 2025" width={780} height={310} sizes="(max-width:1024px) 100vw, 1000px" className="h-auto w-full" />
            </figure>
          )}
          {s.past_support_image && (
            <figure className="relative mx-auto mt-6 w-[min(100%,720px)] rotate-1 overflow-hidden rounded-[999px] border border-papel/30">
              <Image src={s.past_support_image} alt="Apoiadores 2025" width={700} height={90} className="h-auto w-full" />
            </figure>
          )}
          {s.past_institutional && <p className="mt-6 text-center text-[13px] font-bold uppercase tracking-[0.03em] text-papel/70">Apoio institucional: {s.past_institutional}</p>}
          <Floater src="/media/v2/recortes/acrobata-aro.webp" r={-8} className="-left-6 -top-24 hidden h-[110px] lg:block" />
        </div>

        {partners.length > 0 && (
          <div className="mt-16 text-center">
            <p className="serif text-3xl text-ouro">já confirmados em 2026</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {partners.map((p) => {
                const inner = p.logo ? (
                  <span className="relative block h-14 w-full">
                    <Image src={String(p.logo)} alt={String(p.name)} fill sizes="200px" unoptimized={/\.svg(\?|$)/i.test(String(p.logo))} className="object-contain" />
                  </span>
                ) : (
                  <span className="display text-xl text-carbon">{String(p.name)}</span>
                );
                const cls = 'flex h-28 w-40 items-center justify-center rounded-full border border-carbon bg-white p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 sm:w-48';
                return p.url ? (
                  <a key={p.id} href={String(p.url)} target="_blank" rel="noopener noreferrer sponsored" className={cls} aria-label={`Site de ${String(p.name)}`}>
                    {inner}
                  </a>
                ) : (
                  <div key={p.id} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
