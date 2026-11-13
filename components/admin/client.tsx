'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

export function ConfirmButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={className ?? 'inline-flex items-center rounded-md border border-red-400/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10'}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function SubmitButton({ children, pending }: { children: React.ReactNode; pending?: string }) {
  const { pending: p } = useFormStatus();
  return (
    <button type="submit" disabled={p} className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-night transition hover:bg-champagne disabled:opacity-60">
      {p ? pending ?? 'Salvando…' : children}
    </button>
  );
}

export function LoginForm({ action }: { action: (prev: { error?: string } | undefined, f: FormData) => Promise<{ error?: string }> }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const cls = 'w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-cream focus:border-gold/70 focus:outline-none focus:ring-2 focus:ring-gold/20';
  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-cream/60">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={cls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-cream/60">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={cls} />
      </div>
      {state?.error && <p className="text-sm text-red-300" role="alert">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-md bg-gold py-3 text-sm font-semibold text-night transition hover:bg-champagne disabled:opacity-60">
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
