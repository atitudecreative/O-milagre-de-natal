import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { EvImage } from "@/components/public/EvImage";
import { eventDateLabel } from "@/lib/format";
import type { HeroSettings } from "@/lib/types";

export const revalidate = 300;

async function loadEvents() {
  // Sem Supabase configurado (ex.: build sem variáveis), a página renderiza vazia em vez de quebrar.
  if (!isSupabaseConfigured) return [];
  const { data } = await createPublicClient()
    .from("events")
    .select("id, slug, name, tagline, starts_on, ends_on, date_label, city, state, is_demo, event_sections(type, settings)")
    .eq("status", "published")
    .order("starts_on", { ascending: true });
  return data ?? [];
}

export default async function Home() {
  const events = await loadEvents();

  return (
    <main className="min-h-dvh bg-ink text-paper">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10">
        <span className="font-display text-2xl italic">Palco</span>
        <Link href="/login" className="text-sm text-faint hover:text-paper">Acesso da equipe</Link>
      </header>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-10 md:pt-28">
        <p className="text-xs uppercase tracking-[0.24em] text-faint">Apresentações para patrocinadores</p>
        <h1 className="mt-6 max-w-5xl font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.92]">
          Eventos que merecem marcas <em className="text-faint">à altura.</em>
        </h1>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-10">
        <ul className="border-t border-white/15">
          {(events ?? []).map((e, i) => {
            const hero = (e.event_sections as { type: string; settings: HeroSettings }[]).find((s) => s.type === "hero");
            const img = hero?.settings?.image_desktop;
            return (
              <li key={e.id} className="border-b border-white/15">
                <Link href={`/eventos/${e.slug}`} className="group grid items-center gap-6 py-8 md:grid-cols-12">
                  <span className="text-sm tabular-nums text-faint md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <span className="md:col-span-6">
                    <span className="block font-display text-4xl leading-none transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2 md:text-6xl">{e.name}</span>
                    <span className="mt-2 block text-sm text-faint">
                      {[eventDateLabel(e.starts_on, e.ends_on, e.date_label), [e.city, e.state].filter(Boolean).join(" · ")].filter(Boolean).join(" — ")}
                      {e.is_demo ? " · demonstração" : ""}
                    </span>
                  </span>
                  <span className="relative hidden aspect-[16/9] overflow-hidden rounded-md md:col-span-4 md:col-start-9 md:block">
                    {img ? <EvImage src={img} alt="" fill sizes="30vw" className="object-cover opacity-70 grayscale transition duration-700 group-hover:opacity-100 group-hover:grayscale-0" /> : null}
                  </span>
                </Link>
              </li>
            );
          })}
          {!events?.length ? <li className="py-10 text-faint">Nenhum evento publicado no momento.</li> : null}
        </ul>
      </section>
    </main>
  );
}
