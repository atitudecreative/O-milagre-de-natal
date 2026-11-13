import Image from 'next/image';
import { lines } from '@/lib/format';
import { TrackLink } from './motion';
import { KitRequest } from './forms';
import { Accent, Edge, H2, HEX } from './ui';

export function MediaKit({ s, whatsapp, autoEmail }: { s: Record<string, string>; whatsapp: string | null; autoEmail: boolean }) {
  const contents = lines(s.media_kit_contents);
  const kitWhats = whatsapp ? whatsapp.replace(/text=[^&]*/, `text=${encodeURIComponent('Olá! Gostaria de receber o mídia kit do Musical de Natal.')}`) : null;
  return (
    <section id="midia-kit" className="swirl sw-a relative bg-papel py-20 sm:py-28">
      <Edge color={HEX.papel} kind="scallop" />
      <div className="wrap grid items-center gap-12 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <figure className="print relative -rotate-3">
            <span className="tape" aria-hidden />
            <Image src={s.media_kit_cover || '/media/kv-wide.webp'} alt="Capa do mídia kit" width={1600} height={900} sizes="(max-width:1024px) 92vw, 640px" className="h-auto w-full" />
          </figure>
          <div className="absolute -bottom-8 -right-2 flex h-28 w-28 rotate-12 flex-col items-center justify-center rounded-full border border-carbon bg-ouro text-center sm:right-6">
            <p className="display text-3xl leading-none">PDF</p>
            <p className="text-[12px] font-bold uppercase">{s.media_kit_version}</p>
          </div>
        </div>
        <div className="lg:col-span-6">
          <Accent>apresentação comercial</Accent>
          <H2 className="mt-2 text-[44px] sm:text-[64px] lg:text-[80px]">Leve o mídia kit.</H2>
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
          <div className="mt-8 rounded-[32px] border border-carbon bg-white p-6">
            <p className="field-label">Prefere receber por e-mail?</p>
            <KitRequest autoEmail={autoEmail} />
          </div>
        </div>
      </div>
    </section>
  );
}
