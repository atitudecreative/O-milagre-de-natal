"use client";
import type { AnalyticsEventName } from "@/lib/types";

/**
 * Rastreamento do lado do cliente.
 * - Sempre registra no analytics interno (primeira parte, sem cookies).
 * - Repassa para GTM/GA4/Meta Pixel apenas se o evento tiver os IDs configurados
 *   E o visitante tiver consentido (LGPD).
 * - Conversões (form_submit) só são disparadas após confirmação do servidor.
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

export function sessionId() {
  try {
    let id = sessionStorage.getItem("ev_sid");
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
      sessionStorage.setItem("ev_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

type Utm = { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string };

export function utm(): Utm {
  try {
    const stored = sessionStorage.getItem("ev_utm");
    const params = new URLSearchParams(window.location.search);
    const fresh = {
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
      utm_content: params.get("utm_content") ?? undefined,
    };
    if (fresh.utm_source || fresh.utm_campaign) {
      sessionStorage.setItem("ev_utm", JSON.stringify(fresh));
      return fresh;
    }
    return stored ? (JSON.parse(stored) as typeof fresh) : fresh;
  } catch {
    return {};
  }
}

export function firstReferrer() {
  try {
    const stored = sessionStorage.getItem("ev_ref");
    if (stored !== null) return stored;
    const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
    sessionStorage.setItem("ev_ref", ref);
    return ref;
  } catch {
    return "";
  }
}

function device(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1100 ? "tablet" : "desktop";
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
  const u = utm();
  const payload = JSON.stringify({
    event_id: cfg.eventId,
    name,
    label: label?.slice(0, 120),
    session_id: sessionId(),
    path: window.location.pathname,
    referrer: firstReferrer(),
    device: device(),
    utm_source: u.utm_source,
    utm_medium: u.utm_medium,
    utm_campaign: u.utm_campaign,
  });
  try {
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/track", blob)) {
      void fetch("/api/track", { method: "POST", body: payload, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {
    /* rastreamento nunca deve quebrar a página */
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
