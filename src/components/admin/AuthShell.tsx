import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-paper md:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-card md:flex md:flex-col md:justify-between">
        <Link href="/" className="font-display text-3xl italic">Palco</Link>
        <div>
          <p className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-[0.92]">
            Cada evento,<br />uma apresentação <em className="text-faint">inesquecível.</em>
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-faint">Plataforma interna de apresentações comerciais e captação de patrocínios.</p>
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div aria-hidden className="pointer-events-none absolute -right-8 top-[42%] h-[20rem] w-[20rem] rounded-full border border-white/10" />
      </section>
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-12 block font-display text-3xl italic md:hidden">Palco</Link>
          <h1 className="font-display text-5xl leading-none">{title}</h1>
          {subtitle ? <p className="mt-3 text-sm text-mute">{subtitle}</p> : null}
          <div className="mt-10">{children}</div>
        </div>
      </section>
    </main>
  );
}
