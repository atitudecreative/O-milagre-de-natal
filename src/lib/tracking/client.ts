"use client";
import type { AnalyticsEventName } from "@/lib/types";

/**
 * Rastreamento do lado do cliente.
 * - Repassa para GTM/GA4/Meta Pixel apenas se o evento tiver os IDs configurados
 *   E o visitante tiver consentido (LGPD).
 * - A conversão (form_submit) só dispara quando o formulário válido abre o WhatsApp/e-mail.
 */
type Config = { eventId: string; enabled: boolean; consent: boolean };
const cfg: Config = { eventId: "", enabled: false, consent: false };
const once = new Set<string>();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function configureTracking(next: Partial<Config>) {
  Object.assign(cfg, next);
}

const EXTERNAL: Record<AnalyticsEventName, { ga: string; fb?: string; fbCustom?: string }> = {
  page_view: { ga: "page_view" },
  cta_click: { ga: "cta_click", fbCustom: "CTAClick" },
  tiers_view: { ga: "view_sponsorship_tiers", fb: "ViewContent" },
  form_start: { ga: "form_start", fbCustom: "FormStart" },
  form_submit: { ga: "generate_lead", fb: "Lead" },
  whatsapp_click: { ga: "whatsapp_click", fb: "Contact" },
  deck_download: { ga: "file_download", fbCustom: "DeckDownload" },
};

export function track(name: AnalyticsEventName, label?: string, opts: { onceKey?: string } = {}) {
  if (!cfg.eventId) return;
  if (opts.onceKey) {
    if (once.has(opts.onceKey)) return;
    once.add(opts.onceKey);
  }
  if (!cfg.enabled || !cfg.consent || name === "page_view") return;
  const map = EXTERNAL[name];
  window.dataLayer?.push({ event: map.ga, event_label: label });
  window.gtag?.("event", map.ga, { event_label: label });
  if (window.fbq) {
    if (map.fb) window.fbq("track", map.fb, { content_name: label });
    else if (map.fbCustom) window.fbq("trackCustom", map.fbCustom, { content_name: label });
  }
}
