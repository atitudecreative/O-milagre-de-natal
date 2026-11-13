import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { can, getSessionUser } from '@/lib/auth';
import { COLLECTIONS, ROLE_LABEL } from '@/lib/schema';
import { logoutAction } from '../actions';

export const metadata: Metadata = { title: 'Painel — O Milagre do Natal', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const link = 'block rounded-md px-3 py-2 text-sm text-cream/70 transition hover:bg-white/5 hover:text-cream';
  const group = 'mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/35';

  return (
    <div className="min-h-screen bg-[#0c0b0e] text-cream lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-ink lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <details className="group lg:open" open>
          <summary className="flex cursor-pointer items-center justify-between px-5 py-5 lg:cursor-default">
            <a href="/admin" className="logotype block w-32" aria-label="Painel" />
            <span className="text-xs text-cream/40 lg:hidden">Menu ▾</span>
          </summary>
          <nav className="px-3 pb-8">
            <a href="/admin" className={link}>Visão geral</a>
            {can(user, 'leads') && (
              <>
                <p className={group}>Comercial</p>
                <a href="/admin/leads" className={link}>Empresas interessadas</a>
                <a href="/admin/leads?tipo=midia_kit" className={link}>Pedidos de mídia kit</a>
              </>
            )}
            {can(user, 'content') && (
              <>
                <p className={group}>Conteúdo do site</p>
                <a href="/admin/configuracoes" className={link}>Textos, contato e SEO</a>
                <a href="/admin/configuracoes?grupo=midiakit" className={link}>Mídia kit (PDF)</a>
                {COLLECTIONS.map((c) => (
                  <a key={c.key} href={`/admin/conteudo/${c.key}`} className={link}>
                    {c.label}
                  </a>
                ))}
              </>
            )}
            <p className={group}>Conta</p>
            {can(user, 'users') && <a href="/admin/usuarios" className={link}>Usuários e acessos</a>}
            <a href="/admin/conta" className={link}>Minha senha</a>
            <a href="/" target="_blank" className={link}>Ver site ↗</a>
            <div className="mt-6 border-t border-white/10 px-3 pt-4">
              <p className="text-sm text-cream">{user.name}</p>
              <p className="text-xs text-cream/40">{ROLE_LABEL[user.role]}</p>
              <form action={logoutAction} className="mt-3">
                <button className="text-xs text-cream/50 underline-offset-4 hover:text-gold hover:underline">Sair</button>
              </form>
            </div>
          </nav>
        </details>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-10 sm:py-10">{children}</main>
    </div>
  );
}
