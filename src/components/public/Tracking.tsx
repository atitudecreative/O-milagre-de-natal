"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { configureTracking, track } from "@/lib/tracking/client";

type Props = {
  eventId: string;
  slug: string;
  metaPixelId?: string | null;
  gaId?: string | null;
  gtmId?: string | null;
  enabled: boolean;
};

const KEY = (slug: string) => `ev_consent_${slug}`;

/**
 * Carrega pixels/tags do evento SOMENTE com consentimento (LGPD) e somente
 * se os IDs estiverem configurados no painel para este evento.
 */
export function Tracking({ eventId, slug, metaPixelId, gaId, gtmId, enabled }: Props) {
  const hasExternal = Boolean(metaPixelId || gaId || gtmId);
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY(slug));
    } catch {}
    const value = stored === "granted" || stored === "denied" ? stored : null;
    /* eslint-disable react-hooks/set-state-in-effect -- leitura única do armazenamento local */
    setConsent(value);
    setShowBanner(enabled && hasExternal && value === null);
    /* eslint-enable react-hooks/set-state-in-effect */
    configureTracking({ eventId, enabled: enabled && hasExternal, consent: value === "granted" });
    track("page_view", undefined, { onceKey: `pv:${eventId}` });

    const open = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.("[data-consent-open]")) setShowBanner(true);
    };
    document.addEventListener("click", open);
    return () => document.removeEventListener("click", open);
  }, [eventId, slug, enabled, hasExternal]);

  function decide(v: "granted" | "denied") {
    try {
      localStorage.setItem(KEY(slug), v);
    } catch {}
    setConsent(v);
    setShowBanner(false);
    configureTracking({ consent: v === "granted" });
  }

  const load = enabled && consent === "granted";

  return (
    <>
      {load && gtmId ? (
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script>
      ) : null}
      {load && gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}</Script>
        </>
      ) : null}
      {load && metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>
      ) : null}

      {showBanner ? (
        <div role="dialog" aria-live="polite" aria-label="Preferências de cookies" className="fixed bottom-20 left-3 right-3 z-[70] max-w-md rounded-[var(--ev-radius)] border border-[var(--ev-line-strong)] bg-[var(--ev-bg)] p-5 text-sm shadow-2xl sm:bottom-5 sm:left-5 sm:right-auto animate-[rise_0.7s_var(--ease-out-expo)_both]">
          <p className="font-semibold">Cookies e medição</p>
          <p className="mt-2 leading-relaxed text-[var(--ev-muted)]">
            Usamos ferramentas de medição de terceiros para entender o interesse nesta apresentação. Elas só são ativadas com sua autorização.{" "}
            <a href={`/eventos/${slug}/privacidade`} className="underline underline-offset-4">Saiba mais</a>.
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => decide("granted")} className="ev-btn !min-h-10 flex-1 !px-4 !text-[0.7rem]">Aceitar</button>
            <button type="button" onClick={() => decide("denied")} className="ev-btn ev-btn-ghost !min-h-10 flex-1 !px-4 !text-[0.7rem]">Recusar</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
