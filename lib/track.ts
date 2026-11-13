'use client';

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_EVENT: Record<string, string> = {
  sponsor_cta: 'select_promotion',
  tier_interest: 'select_item',
  kit_download: 'file_download',
  kit_request: 'generate_lead',
  lead_submit: 'generate_lead',
  whatsapp_click: 'contact',
  contact_cta: 'contact',
  email_click: 'contact',
};

const PIXEL_EVENT: Record<string, string> = {
  lead_submit: 'Lead',
  kit_request: 'Lead',
  kit_download: 'ViewContent',
  whatsapp_click: 'Contact',
  contact_cta: 'Contact',
  tier_interest: 'ViewContent',
};

/**
 * Evento de conversão: GA4 (gtag), Meta Pixel (fbq) e registro interno do painel.
 * `lead_submit` e `kit_request` são gravados pelo servidor — não duplicamos aqui.
 */
export function track(type: string, label = '') {
  try {
    window.gtag?.('event', GA_EVENT[type] ?? type, { event_category: 'patrocinio', event_label: label, mn_type: type });
    if (PIXEL_EVENT[type]) window.fbq?.('track', PIXEL_EVENT[type], { content_name: label || type });
    else window.fbq?.('trackCustom', type, { label });
    if (type !== 'lead_submit' && type !== 'kit_request') {
      const body = JSON.stringify({ type, label, page: location.pathname + location.hash });
      if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) {
        fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    }
  } catch {
    /* rastreamento nunca deve quebrar a navegação */
  }
}

export function selectTier(name: string) {
  window.dispatchEvent(new CustomEvent('mn:select-tier', { detail: name }));
}
