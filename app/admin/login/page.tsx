import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { loginAction } from '../actions';
import { LoginForm } from '@/components/admin/client';

export const metadata: Metadata = { title: 'Entrar — Painel O Milagre do Natal', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function Login() {
  if (await getSessionUser()) redirect('/admin');
  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-5">
      <div className="w-full max-w-sm">
        <span className="logotype mx-auto block w-56" role="img" aria-label="O Milagre do Natal" />
        <p className="mt-6 text-center text-xs uppercase tracking-[0.24em] text-cream/45">Painel administrativo</p>
        <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-7">
          <LoginForm action={loginAction} />
        </div>
        <p className="mt-6 text-center text-xs text-cream/35">
          <a href="/" className="hover:text-gold">← Voltar ao site</a>
        </p>
      </div>
    </main>
  );
}
