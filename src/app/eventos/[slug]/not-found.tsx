import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-end gap-6 bg-ink p-8 text-paper md:p-16">
      <p className="text-xs uppercase tracking-[0.22em] text-faint">Erro 404</p>
      <h1 className="font-display text-6xl leading-none md:text-8xl">Este evento não está disponível.</h1>
      <p className="max-w-md text-faint">O endereço pode ter mudado ou a apresentação ainda não foi publicada.</p>
      <Link href="/" className="border-b border-paper/40 pb-1 text-sm hover:border-paper">Voltar ao início</Link>
    </main>
  );
}
