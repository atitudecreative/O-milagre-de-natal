"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/actions/auth";
import { cx } from "./ui";
import { ToastProvider } from "./ui/toast";
import { LeadNotifier } from "./LeadNotifier";

type Item = { href: string; label: string; badge?: number; exact?: boolean };

function NavList({ items, onNavigate }: { items: Item[]; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <ul className="space-y-0.5">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path === i.href || path.startsWith(`${i.href}/`);
        return (
          <li key={i.href}>
            <Link
              href={i.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-ink text-card" : "text-ink-2 hover:bg-paper-2",
              )}
            >
              {i.label}
              {i.badge ? (
                <span className={cx("min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold tabular-nums", active ? "bg-card text-ink" : "bg-ink text-card")}>{i.badge}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({ items, user, children, canSeeLeads, newLeads }: { items: Item[]; user: { name: string; email: string; role: string }; children: ReactNode; canSeeLeads: boolean; newLeads: number }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fecha o menu ao navegar
  useEffect(() => setOpen(false), [path]);

  const brand = (
    <Link href="/admin" className="flex items-baseline gap-2">
      <span className="font-display text-3xl italic leading-none">Palco</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-mute">painel</span>
    </Link>
  );
  const footer = (
    <div className="border-t border-line pt-4">
      <Link href="/admin/conta" className="block rounded-lg px-3 py-2 hover:bg-paper-2">
        <span className="block truncate text-sm font-medium">{user.name || user.email}</span>
        <span className="block truncate text-xs text-mute">{user.role}</span>
      </Link>
      <form action={signOut}>
        <button type="submit" className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-mute hover:bg-paper-2 hover:text-ink">Sair</button>
      </form>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-paper text-ink">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col justify-between border-r border-line bg-paper px-3 py-6 lg:flex">
          <div>
            <div className="mb-10 px-3">{brand}</div>
            <nav aria-label="Principal"><NavList items={items} /></nav>
          </div>
          {footer}
        </aside>

        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
          {brand}
          <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-paper-2">
            <span className="block h-3 w-5 border-y border-ink" />
          </button>
        </header>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-[fade_0.2s_ease_both]" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 right-0 flex w-[min(86vw,320px)] flex-col justify-between bg-paper p-4 shadow-2xl animate-[rise_0.4s_var(--ease-out-expo)_both]">
              <div>
                <div className="mb-8 flex items-center justify-between px-3">{brand}<button type="button" onClick={() => setOpen(false)} className="text-sm text-mute">Fechar</button></div>
                <NavList items={items} onNavigate={() => setOpen(false)} />
              </div>
              {footer}
            </div>
          </div>
        ) : null}

        <main className="lg:pl-60">
          <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-10">{children}</div>
        </main>
        {canSeeLeads ? <LeadNotifier initial={newLeads} /> : null}
      </div>
    </ToastProvider>
  );
}
