import Image from 'next/image';
import type { Row } from '@/lib/schema';
import { lines } from '@/lib/format';
import { Reveal, TrackLink } from './motion';
import { SectionHead } from './SectionHead';

export function Partners({ partners, organizers }: { partners: Row[]; organizers: string }) {
  const groups = Array.from(new Set(partners.map((p) => String(p.category || 'Parceiros'))));
  const credits = lines(organizers).map((l) => {
    const [role, ...name] = l.split('|');
    return { role: role.trim(), name: name.join('|').trim() };
  });

  return (
    <section id="parceiros" className="relative bg-ink py-24 sm:py-32">
      <div className="wrap">
        <SectionHead n="08" label="Marcas parceiras" title={<>Quem faz este <em className="text-gold-grad">Natal acontecer.</em></>} />

        {credits.length > 0 && (
          <Reveal className="mt-14 grid gap-px bg-cream/10 sm:grid-cols-3">
            {credits.map((c) => (
              <div key={c.role + c.name} className="bg-ink py-6 sm:px-8 sm:first:pl-0">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-cream/40">{c.role}</p>
                <p className="display mt-2 text-2xl text-cream">{c.name}</p>
              </div>
            ))}
          </Reveal>
        )}

        {partners.length > 0 ? (
          <div className="mt-16 space-y-14">
            {groups.map((g) => (
              <div key={g}>
                <Reveal>
                  <p className="label">{g}</p>
                </Reveal>
                <div className="mt-6 grid grid-cols-2 gap-px bg-cream/10 sm:grid-cols-3 lg:grid-cols-5">
                  {partners
                    .filter((p) => String(p.category || 'Parceiros') === g)
                    .map((p, i) => {
                      const inner = p.logo ? (
                        <span className="relative block h-14 w-full">
                          <Image src={String(p.logo)} alt={String(p.name)} fill sizes="200px" unoptimized={/\.svg(\?|$)/i.test(String(p.logo))} className="object-contain opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0" />
                        </span>
                      ) : (
                        <span className="display text-xl text-cream/80 group-hover:text-gold">{String(p.name)}</span>
                      );
                      return (
                        <Reveal key={p.id} delay={(i % 5) * 0.05} className="bg-ink">
                          {p.url ? (
                            <a href={String(p.url)} target="_blank" rel="noopener noreferrer sponsored" className="group flex h-32 items-center justify-center p-6" aria-label={`Site de ${String(p.name)}`}>
                              {inner}
                            </a>
                          ) : (
                            <div className="group flex h-32 items-center justify-center p-6">{inner}</div>
                          )}
                        </Reveal>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Reveal className="mt-16 grid items-center gap-8 border border-dashed border-gold/30 p-10 sm:p-14 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="display text-3xl leading-tight text-cream sm:text-4xl">Este espaço está reservado para as marcas que vão fazer parte desta história.</p>
              <p className="mt-4 max-w-xl text-cream/55">As marcas confirmadas aparecerão aqui, com link para seus sites, organizadas por categoria de parceria.</p>
            </div>
            <TrackLink href="#contato" event="sponsor_cta" label="parceiros-vazio" className="btn btn-gold">
              Quero minha marca aqui <span className="arrow">→</span>
            </TrackLink>
          </Reveal>
        )}
      </div>
    </section>
  );
}
