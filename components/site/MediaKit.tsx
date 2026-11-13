import Image from 'next/image';
import { lines } from '@/lib/format';
import { Reveal, TrackLink } from './motion';
import { KitRequest } from './forms';

export function MediaKit({ s, whatsapp, autoEmail }: { s: Record<string, string>; whatsapp: string | null; autoEmail: boolean }) {
  const contents = lines(s.media_kit_contents);
  const kitWhats = whatsapp
    ? whatsapp.replace(/text=[^&]*/, `text=${encodeURIComponent('Olá! Gostaria de receber o mídia kit do musical O Milagre do Natal.')}`)
    : null;

  return (
    <section id="midia-kit" className="relative overflow-hidden bg-umber py-24 sm:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_20%,rgba(230,188,136,0.14),transparent_70%)]" aria-hidden />
      <div className="wrap relative grid items-center gap-16 lg:grid-cols-12">
        <Reveal className="relative lg:col-span-6" y={50}>
          <div className="relative mx-auto max-w-xl [perspective:1600px]">
            <div className="relative aspect-[16/9] w-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-transform duration-1000 ease-silk [transform:rotateY(-14deg)_rotateX(6deg)] hover:[transform:rotateY(-4deg)_rotateX(2deg)]">
              <Image src={s.media_kit_cover || '/media/kv-wide.webp'} alt="Capa do mídia kit O Milagre do Natal" fill sizes="(max-width:1024px) 90vw, 560px" className="object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-gold/30" />
            </div>
            <div className="absolute -bottom-6 left-6 -z-10 aspect-[16/9] w-[92%] bg-night/60 [transform:rotateY(-14deg)_rotateX(6deg)_translateZ(-40px)]" aria-hidden />
            <p className="mt-10 text-center font-sans text-[11px] uppercase tracking-[0.3em] text-cream/45">PDF · {s.media_kit_version}</p>
          </div>
        </Reveal>

        <div className="lg:col-span-6">
          <Reveal>
            <p className="label flex items-center gap-4">
              <span className="text-cream/40">N° 09</span>
              <span className="h-px w-10 bg-gold/40" aria-hidden />
              Mídia kit
            </p>
            <h2 className="display mt-6 text-[40px] leading-[0.98] text-cream sm:text-6xl">
              A apresentação comercial <em className="text-gold-grad">completa.</em>
            </h2>
          </Reveal>
          {contents.length > 0 && (
            <Reveal delay={0.1}>
              <ol className="mt-10 border-t hairline">
                {contents.map((c, i) => (
                  <li key={c} className="flex items-baseline gap-6 border-b hairline py-4 text-cream/85">
                    <span className="font-sans text-xs text-gold/70">{String(i + 1).padStart(2, '0')}</span>
                    <span className="display text-xl">{c}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
          <Reveal delay={0.15} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <TrackLink href="/api/midia-kit?origem=secao" event="kit_download" label="secao" className="btn btn-gold" download>
              Baixar mídia kit (PDF) <span className="arrow">↓</span>
            </TrackLink>
            {kitWhats && (
              <TrackLink href={kitWhats} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="midia-kit" className="btn btn-ghost">
                Pedir pelo WhatsApp
              </TrackLink>
            )}
          </Reveal>
          <Reveal delay={0.2} className="mt-12 border-t hairline pt-8">
            <p className="field-label mb-4">Prefere receber por e-mail?</p>
            <KitRequest autoEmail={autoEmail} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
