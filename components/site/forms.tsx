'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Script from 'next/script';
import { cx } from '@/lib/format';
import { track } from '@/lib/track';

type Attribution = { utm_source?: string; utm_medium?: string; utm_campaign?: string; referrer?: string; page?: string };

function useAttribution() {
  const ref = useRef<Attribution>({});
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('mn_attr');
      if (stored) {
        ref.current = JSON.parse(stored);
      } else {
        const q = new URLSearchParams(location.search);
        ref.current = {
          utm_source: q.get('utm_source') ?? undefined,
          utm_medium: q.get('utm_medium') ?? undefined,
          utm_campaign: q.get('utm_campaign') ?? undefined,
          referrer: document.referrer || undefined,
        };
        sessionStorage.setItem('mn_attr', JSON.stringify(ref.current));
      }
    } catch {
      /* navegação privada */
    }
  }, []);
  return () => ({ ...ref.current, page: location.pathname });
}

const TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function Turnstile() {
  if (!TURNSTILE) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile mt-6" data-sitekey={TURNSTILE} data-theme="dark" />
    </>
  );
}

async function submit(payload: Record<string, unknown>) {
  const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
  return { ok: res.ok && data.ok, ...data };
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 13);
  if (d.startsWith('55') && d.length > 11) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-2 text-xs font-bold text-cortina" role="alert">{msg}</p> : null;
}

/* ------------------------------------------------------------------ */

export function LeadForm({ tiers, segments, whatsapp }: { tiers: string[]; segments: string[]; whatsapp: string | null }) {
  const [tier, setTier] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const startedAt = useRef(Date.now());
  const attr = useAttribution();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('cota');
    if (q) setTier(tiers.find((t) => t.toLowerCase() === q.toLowerCase()) ?? '');
    const on = (e: Event) => setTier((e as CustomEvent<string>).detail);
    window.addEventListener('mn:select-tier', on);
    return () => window.removeEventListener('mn:select-tier', on);
  }, [tiers]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    setError('');
    setFieldErrors({});
    const res = await submit({
      kind: 'patrocinio',
      name: String(f.get('name') ?? ''),
      company: String(f.get('company') ?? ''),
      email: String(f.get('email') ?? ''),
      phone: String(f.get('phone') ?? ''),
      segment: String(f.get('segment') ?? ''),
      tier: String(f.get('tier') ?? ''),
      message: String(f.get('message') ?? ''),
      consent: f.get('consent') === 'on',
      website: f.get('website'),
      turnstileToken: f.get('cf-turnstile-response') ?? undefined,
      startedAt: startedAt.current,
      ...attr(),
    }).catch(() => ({ ok: false, error: 'Falha de conexão. Verifique sua internet e tente novamente.', fieldErrors: {} }));
    if (res.ok) {
      setState('done');
      track('lead_submit', String(f.get('tier') ?? ''));
    } else {
      setState('idle');
      setError(res.error ?? 'Não foi possível enviar.');
      setFieldErrors(res.fieldErrors ?? {});
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === 'done' ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[480px] flex-col items-start justify-center rounded-card bg-menta p-8 sm:p-12"
            role="status"
          >
            <motion.svg viewBox="0 0 52 52" className="h-16 w-16 text-carbon" initial="a" animate="b">
              <motion.circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" variants={{ a: { pathLength: 0 }, b: { pathLength: 1 } }} transition={{ duration: 1 }} />
              <motion.path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="2" variants={{ a: { pathLength: 0 }, b: { pathLength: 1 } }} transition={{ duration: 0.6, delay: 0.8 }} />
            </motion.svg>
            <h3 className="display mt-8 text-5xl sm:text-6xl">Recebemos o seu interesse.</h3>
            <p className="mt-4 max-w-md text-lg font-medium text-carbon/80">
              Obrigado! A equipe comercial do musical vai analisar sua solicitação e retornar pelo e-mail ou telefone informado.
            </p>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', 'pos-envio')} className="pill pill-ghost mt-8 h-12">
                Adiantar a conversa pelo WhatsApp
              </a>
            )}
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} noValidate className="grid gap-x-8 gap-y-8 sm:grid-cols-2" exit={{ opacity: 0 }}>
            <div>
              <label htmlFor="lf-name" className="field-label">Nome do responsável *</label>
              <input id="lf-name" name="name" required autoComplete="name" className="field" aria-invalid={!!fieldErrors.name} />
              <Err msg={fieldErrors.name} />
            </div>
            <div>
              <label htmlFor="lf-company" className="field-label">Empresa *</label>
              <input id="lf-company" name="company" required autoComplete="organization" className="field" aria-invalid={!!fieldErrors.company} />
              <Err msg={fieldErrors.company} />
            </div>
            <div>
              <label htmlFor="lf-email" className="field-label">E-mail corporativo *</label>
              <input id="lf-email" name="email" type="email" required autoComplete="email" inputMode="email" className="field" aria-invalid={!!fieldErrors.email} />
              <Err msg={fieldErrors.email} />
            </div>
            <div>
              <label htmlFor="lf-phone" className="field-label">Telefone / WhatsApp *</label>
              <input
                id="lf-phone"
                name="phone"
                required
                autoComplete="tel"
                inputMode="tel"
                className="field"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(21) 99999-9999"
                aria-invalid={!!fieldErrors.phone}
              />
              <Err msg={fieldErrors.phone} />
            </div>
            <div>
              <label htmlFor="lf-segment" className="field-label">Segmento da empresa *</label>
              <select id="lf-segment" name="segment" required defaultValue="" className="field appearance-none bg-[length:12px] bg-[right_center] bg-no-repeat [&>option]:bg-white" aria-invalid={!!fieldErrors.segment}>
                <option value="" disabled>Selecione</option>
                {segments.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <Err msg={fieldErrors.segment} />
            </div>
            <div>
              <label htmlFor="lf-tier" className="field-label">Cota de interesse *</label>
              <select id="lf-tier" name="tier" required value={tier} onChange={(e) => setTier(e.target.value)} className="field appearance-none [&>option]:bg-white" aria-invalid={!!fieldErrors.tier}>
                <option value="" disabled>Selecione</option>
                {tiers.map((t) => (
                  <option key={t}>{t}</option>
                ))}
                <option>Ainda não sei — quero conversar</option>
              </select>
              <Err msg={fieldErrors.tier} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lf-message" className="field-label">Mensagem adicional</label>
              <textarea id="lf-message" name="message" rows={3} maxLength={2000} className="field resize-none" placeholder="Conte um pouco sobre os objetivos da sua marca" />
            </div>

            {/* honeypot */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
              <label>
                Site <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-4 text-[15px] font-medium leading-relaxed text-carbon/75">
                <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[#0B0B0B]" aria-invalid={!!fieldErrors.consent} />
                <span>
                  Autorizo o uso dos meus dados para contato comercial sobre o patrocínio do musical, conforme a{' '}
                  <a href="/privacidade" target="_blank" className="font-bold underline underline-offset-4">Política de Privacidade</a> (LGPD).
                </span>
              </label>
              <Err msg={fieldErrors.consent} />
              <Turnstile />
            </div>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" disabled={state === 'sending'} className={cx('pill pill-solid h-14 px-8', state === 'sending' && 'opacity-70')}>
                {state === 'sending' ? 'Enviando…' : 'Enviar interesse'} 
              </button>
              {error && <p className="text-sm font-bold text-cortina" role="alert">{error}</p>}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function KitRequest({ autoEmail }: { autoEmail: boolean }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());
  const attr = useAttribution();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    setError('');
    const res = await submit({
      kind: 'midia_kit',
      email: String(f.get('email') ?? ''),
      name: String(f.get('name') ?? ''),
      consent: f.get('consent') === 'on',
      website: f.get('website'),
      turnstileToken: f.get('cf-turnstile-response') ?? undefined,
      startedAt: startedAt.current,
      ...attr(),
    }).catch(() => ({ ok: false, error: 'Falha de conexão.', fieldErrors: {} }));
    if (res.ok) {
      setState('done');
      track('kit_request', 'email');
    } else {
      setState('idle');
      setError(Object.values((res.fieldErrors ?? {}) as Record<string, string>)[0] ?? res.error ?? 'Não foi possível enviar.');
    }
  }

  if (state === 'done') {
    return (
      <p className="rounded-2xl bg-menta px-4 py-3 text-[15px] font-bold" role="status">
        {autoEmail ? 'Pronto! O link do mídia kit foi enviado para o seu e-mail.' : 'Pedido registrado! Nossa equipe enviará o mídia kit para o seu e-mail.'}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
        <input name="name" aria-label="Seu nome" placeholder="Seu nome" autoComplete="name" className="field" />
        <input name="email" type="email" required aria-label="E-mail corporativo" placeholder="E-mail corporativo" autoComplete="email" className="field" />
      </div>
      <div className="absolute -left-[9999px]" aria-hidden>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 text-[13px] font-medium leading-relaxed text-carbon/70">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#0B0B0B]" />
        <span>
          Autorizo o envio do material e contato comercial, conforme a <a href="/privacidade" target="_blank" className="font-bold underline underline-offset-2">Política de Privacidade</a>.
        </span>
      </label>
      <Turnstile />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === 'sending'} className="pill pill-ghost h-12">
          {state === 'sending' ? 'Enviando…' : 'Receber por e-mail'}
        </button>
        {error && <p className="text-xs font-bold text-cortina" role="alert">{error}</p>}
      </div>
    </form>
  );
}
