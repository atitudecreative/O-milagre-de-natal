import Image from 'next/image';
import { lines } from '@/lib/format';
import { TrackLink } from './motion';
import { KitRequest } from './forms';
import { H2 } from './ui';

export function MediaKit({ s, whatsapp, autoEmail }: { s: Record<string, string>; whatsapp: string | null; autoEmail: boolean }) {
  const contents = lines(s.media_kit_contents);
  const kitWhats = whatsapp ? whatsapp.replace(/text=[^&]*/, `text=${encodeURIComponent('Olá! Gostaria de receber o mídia kit do Musical de Natal.')}`) : null;
  return (
    <section id="midia-kit" className="relative overflow-hidden bg-papel py-20 sm:py-28">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <div className="card relative aspect-[16/9] -rotate-3 overflow-hidden transition-transform duration-300 ease-out hover:rotate-0">
            <Image src={s.media_kit_cover || '/media/kv-wide.webp'} alt="Capa do mídia kit" fill sizes="(max-width:1024px) 92vw, 640px" className="object-cover" />
          </div>
          <div className="card absolute -bottom-6 -right-2 rotate-6 bg-ouro px-5 py-3 sm:right-6">
            <p className="display text-3xl leading-none">PDF</p>
            <p className="text-[12px] font-bold uppercase">{s.media_kit_version}</p>
          </div>
        </div>
        <div className="lg:col-span-6">
          <H2 className="text-[44px] sm:text-[64px] lg:text-[80px]">Leve o mídia kit.</H2>
          {contents.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {contents.map((c) => (
                <li key={c} className="rounded-full border border-carbon bg-white px-4 py-2 text-[14px] font-bold">
                  {c}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <TrackLink href="/api/midia-kit?origem=secao" event="kit_download" label="secao" className="pill pill-solid h-14 px-8" download>
              Baixar mídia kit
            </TrackLink>
            {kitWhats && (
              <TrackLink href={kitWhats} target="_blank" rel="noopener noreferrer" event="whatsapp_click" label="midia-kit" className="pill pill-ghost h-14 px-8">
                Pedir pelo WhatsApp
              </TrackLink>
            )}
          </div>
          <div className="card mt-8 p-5 sm:p-6">
            <p className="field-label">Prefere receber por e-mail?</p>
            <KitRequest autoEmail={autoEmail} />
          </div>
        </div>
      </div>
    </section>
  );
}
