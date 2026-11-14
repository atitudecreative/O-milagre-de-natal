"use client";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track } from "@/lib/tracking/client";
import type { AnalyticsEventName } from "@/lib/types";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEventName;
  label?: string;
  tierId?: string;
  children: ReactNode;
};

/** Link que registra o clique (CTA, WhatsApp, download) e opcionalmente pré-seleciona uma cota. */
export function TrackedLink({ event, label, tierId, onClick, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, label);
        if (tierId || label) {
          window.dispatchEvent(new CustomEvent("ev:cta", { detail: { tierId, origin: label } }));
        }
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
