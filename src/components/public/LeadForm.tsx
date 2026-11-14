"use client";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TierRow } from "@/lib/types";
import { FREE_EMAIL_DOMAINS, SEGMENTS } from "@/lib/validation/lead";
import { configureTracking, firstReferrer, track, utm } from "@/lib/tracking/client";

type Props = {
  eventId: string;
  slug: string;
  tiers: Pick<TierRow, "id" | "name" | "quantity_total" | "quantity_sold">[];
  interests: string[];
  successMessage?: string | null;
  disabled?: boolean;
  buttonLabel?: string;
};

type Errors = Partial<Record<string, string>>;

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 13);
  if (d.startsWith("55") && d.length > 11) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function LeadForm({ eventId, slug, tiers, interests, successMessage, disabled, buttonLabel }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [tierId, setTierId] = useState("");
  const [origin, setOrigin] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const started = useRef(false);
  const mountedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
    configureTracking({ eventId });
    const onCta = (e: Event) => {
      const d = (e as CustomEvent<{ tierId?: string; origin?: string }>).detail;
      if (d?.tierId) setTierId(d.tierId);
      if (d?.origin) setOrigin(d.origin);
    };
    window.addEventListener("ev:cta", onCta);
    return () => window.removeEventListener("ev:cta", onCta);
  }, [eventId]);

  const availableTiers = useMemo(
    () => tiers.filter((t) => t.quantity_total == null || t.quantity_sold < t.quantity_total),
    [tiers],
  );
  const freeEmail = useMemo(() => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain ? FREE_EMAIL_DOMAINS.includes(domain) : false;
  }, [email]);

  function onFirstInteraction() {
    if (started.current) return;
    started.current = true;
    track("form_start", origin);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    const fd = new FormData(e.currentTarget);
    const u = utm();
    const payload = {
      event_id: eventId,
      tier_id: tierId || undefined,
      full_name: String(fd.get("full_name") ?? ""),
      company: String(fd.get("company") ?? ""),
      job_title: String(fd.get("job_title") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      segment: String(fd.get("segment") ?? ""),
      interest: String(fd.get("interest") ?? ""),
      message: String(fd.get("message") ?? ""),
      consent: fd.get("consent") === "on",
      marketing_opt_in: fd.get("marketing_opt_in") === "on",
      website: String(fd.get("website") ?? ""),
      elapsed_ms: Date.now() - mountedAt.current,
      turnstile_token: String(fd.get("cf-turnstile-response") ?? "") || undefined,
      cta_origin: origin,
      referrer: firstReferrer() || undefined,
      landing_path: window.location.pathname + window.location.search,
      ...u,
    };

    // Validação imediata no cliente (o servidor valida de novo).
    const next: Errors = {};
    if (payload.full_name.trim().length < 3) next.full_name = "Informe seu nome completo.";
    if (payload.company.trim().length < 2) next.company = "Informe a empresa.";
    if (payload.job_title.trim().length < 2) next.job_title = "Informe seu cargo.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email.trim())) next.email = "Informe um e-mail válido.";
    if (payload.phone.replace(/\D/g, "").length < 10) next.phone = "Informe um telefone com DDD.";
    if (!payload.segment) next.segment = "Selecione o segmento.";
    if (!payload.interest) next.interest = "Selecione o interesse.";
    if (!payload.consent) next.consent = "É preciso concordar com a política de privacidade.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }

    setState("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Errors };
      if (!res.ok || !json.ok) {
        setErrors(json.fieldErrors ?? {});
        setServerError(json.error ?? "Não foi possível enviar agora. Tente novamente em instantes.");
        setState("error");
        return;
      }
      // Conversão só após confirmação real do servidor.
      track("form_submit", tierId ? tiers.find((t) => t.id === tierId)?.name : origin);
      setState("done");
    } catch {
      setServerError("Falha de conexão. Verifique sua internet e tente novamente.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="animate-[rise_0.9s_var(--ease-out-expo)_both] py-10">
        <p className="ev-eyebrow mb-6">Recebemos seu contato</p>
        <p className="ev-display text-[clamp(2.4rem,5vw,4.4rem)]">Obrigado.</p>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--ev-muted)]">
          {successMessage || "Nossa equipe comercial vai analisar seu interesse e retornar em até 2 dias úteis."}
        </p>
      </div>
    );
  }

  const field = (name: string) => ({
    name,
    id: `lf-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `lf-${name}-err` : undefined,
    onFocus: onFirstInteraction,
  });
  const err = (name: string) =>
    errors[name] ? (
      <p id={`lf-${name}-err`} className="mt-1.5 text-xs text-[#ff8a8a]">
        {errors[name]}
      </p>
    ) : null;
  const label = (name: string, text: string, required = true) => (
    <label htmlFor={`lf-${name}`} className="ev-micro block uppercase tracking-[0.18em]">
      {text}
      {required ? <span aria-hidden> *</span> : null}
    </label>
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2" aria-describedby="lf-required">
      {/* honeypot — invisível para pessoas */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="sm:col-span-2">
        {label("full_name", "Nome completo")}
        <input {...field("full_name")} className="ev-input" autoComplete="name" required maxLength={120} />
        {err("full_name")}
      </div>
      <div>
        {label("company", "Empresa")}
        <input {...field("company")} className="ev-input" autoComplete="organization" required maxLength={160} />
        {err("company")}
      </div>
      <div>
        {label("job_title", "Cargo")}
        <input {...field("job_title")} className="ev-input" autoComplete="organization-title" required maxLength={120} />
        {err("job_title")}
      </div>
      <div>
        {label("email", "E-mail corporativo")}
        <input {...field("email")} className="ev-input" type="email" inputMode="email" autoComplete="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} />
        {err("email")}
        {!errors.email && freeEmail ? <p className="ev-micro mt-1.5">Se possível, use o e-mail da empresa — agiliza o retorno.</p> : null}
      </div>
      <div>
        {label("phone", "Telefone / WhatsApp")}
        <input {...field("phone")} className="ev-input" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
        {err("phone")}
      </div>
      <div>
        {label("segment", "Segmento de atuação")}
        <select {...field("segment")} className="ev-input" defaultValue="" required>
          <option value="" disabled>Selecione</option>
          {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        {err("segment")}
      </div>
      <div>
        {label("interest", "Interesse comercial")}
        <select {...field("interest")} className="ev-input" defaultValue="" required>
          <option value="" disabled>Selecione</option>
          {interests.map((s) => <option key={s}>{s}</option>)}
        </select>
        {err("interest")}
      </div>
      {availableTiers.length ? (
        <div className="sm:col-span-2">
          {label("tier_id", "Cota desejada", false)}
          <select {...field("tier_id")} className="ev-input" value={tierId} onChange={(e) => setTierId(e.target.value)}>
            <option value="">Ainda não sei — quero conversar</option>
            {availableTiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      ) : null}
      <div className="sm:col-span-2">
        {label("message", "Mensagem", false)}
        <textarea {...field("message")} className="ev-input min-h-[7rem] resize-y" maxLength={3000} placeholder="Conte um pouco sobre os objetivos da sua marca" />
      </div>

      <div className="space-y-3 sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" name="consent" id="lf-consent" className="mt-1 h-4 w-4 shrink-0 accent-[var(--ev-accent)]" aria-invalid={errors.consent ? true : undefined} onFocus={onFirstInteraction} />
          <span>
            Concordo com o tratamento dos meus dados para contato comercial sobre este evento, conforme a{" "}
            <a href={`/eventos/${slug}/privacidade`} target="_blank" className="underline underline-offset-4">política de privacidade</a>. *
          </span>
        </label>
        {err("consent")}
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[var(--ev-muted)]">
          <input type="checkbox" name="marketing_opt_in" className="mt-1 h-4 w-4 shrink-0 accent-[var(--ev-accent)]" />
          <span>Quero receber novidades sobre outros projetos da organização (opcional).</span>
        </label>
      </div>

      {TURNSTILE_SITE_KEY && !disabled ? (
        <div className="sm:col-span-2">
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" data-language="pt-br" />
        </div>
      ) : null}

      {serverError ? (
        <p role="alert" className="text-sm text-[#ff8a8a] sm:col-span-2">{serverError}</p>
      ) : null}

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p id="lf-required" className="ev-micro">* Campos obrigatórios</p>
        <button type="submit" className="ev-btn w-full sm:w-auto" disabled={state === "sending" || disabled}>
          {state === "sending" ? "Enviando…" : buttonLabel || "Enviar interesse"}
          <span className="ev-btn-arrow" aria-hidden>→</span>
        </button>
      </div>
      {disabled ? <p className="ev-micro sm:col-span-2">Pré-visualização: o envio fica disponível após a publicação.</p> : null}
    </form>
  );
}
