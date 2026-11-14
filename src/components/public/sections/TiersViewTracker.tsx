"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/tracking/client";

/** Registra "visualização das cotas" quando a seção fica realmente visível. */
export function TiersViewTracker() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track("tiers_view", undefined, { onceKey: "tiers_view" });
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <span ref={ref} hidden />;
}
