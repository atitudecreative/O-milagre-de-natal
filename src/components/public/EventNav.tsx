"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EvImage } from "./EvImage";
import { TrackedLink } from "./TrackedLink";

type Item = { href: string; label: string };

export function EventNav({ name, logo, items, lightAfterHero = false }: { name: string; logo: string | null; items: Item[]; lightAfterHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const el = document.getElementById("interesse");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      setPastHero(y > window.innerHeight * 0.8);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-[var(--ev-fg)] focus:px-4 focus:py-2 focus:text-[var(--ev-bg)]">
        Pular para o conteúdo
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter] duration-500 ease-[var(--ease-out-expo)] ${
          hidden && !open ? "-translate-y-full" : ""
        } ${lightAfterHero && pastHero && !open ? "ev-nav-light" : scrolled ? "bg-[color-mix(in_srgb,var(--ev-bg)_82%,transparent)] backdrop-blur-xl" : ""}`}
      >
        <div className="ev-container flex h-16 items-center justify-between gap-6 md:h-20">
          <a href="#inicio" className="flex min-w-0 items-center gap-3" aria-label={`${name} — início`}>
            {logo ? (
              <EvImage src={logo} alt="" width={160} height={48} className="ev-nav-logo h-8 w-auto max-w-[140px] object-contain md:h-10" priority />
            ) : (
              <span className="ev-display truncate text-xl">{name}</span>
            )}
          </a>
          <nav aria-label="Seções" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.8rem] font-medium">
              {items.map((i) => (
                <li key={i.href}>
                  <a href={i.href} className="ev-link-underline text-[var(--ev-fg)]/80 hover:text-[var(--ev-fg)]">{i.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <TrackedLink href="#interesse" event="cta_click" label="nav_patrocinar" className="ev-btn hidden !min-h-12 !px-6 !text-[0.8rem] sm:inline-flex">
              Patrocinar
            </TrackedLink>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-[var(--ev-radius)] border border-[var(--ev-line-strong)] lg:hidden"
              aria-expanded={open}
              aria-controls="ev-menu"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-4 w-7">
                <span className={`absolute left-0 top-0 h-0.5 w-7 bg-current transition-transform duration-500 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-7 bg-current transition-transform duration-500 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="ev-menu"
            className="fixed inset-0 z-40 flex flex-col bg-[var(--ev-bg)] pt-20 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Menu" className="ev-container flex-1 overflow-y-auto">
              <ul className="border-t border-[var(--ev-line)]">
                {items.map((i, k) => (
                  <motion.li key={i.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + k * 0.04 }} className="border-b border-[var(--ev-line)]">
                    <a href={i.href} onClick={() => setOpen(false)} className="ev-display flex items-baseline justify-between py-4 text-4xl">
                      {i.label}
                      <span className="text-sm tabular-nums text-[var(--ev-subtle)]">{String(k + 1).padStart(2, "0")}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="ev-container py-6">
              <TrackedLink href="#interesse" event="cta_click" label="menu_patrocinar" className="ev-btn w-full" onClick={() => setOpen(false)}>
                Quero ser patrocinador <span aria-hidden>→</span>
              </TrackedLink>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Barra de conversão fixa no celular */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur-xl transition-transform ${lightAfterHero ? "ev-bar-light" : "border-[var(--ev-line)] bg-[color-mix(in_srgb,var(--ev-bg)_90%,transparent)]"} duration-500 ease-[var(--ease-out-expo)] sm:hidden ${
          pastHero && !open && !atForm ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <TrackedLink href="#interesse" event="cta_click" label="mobile_bar" className="ev-btn w-full">
          Quero ser patrocinador {lightAfterHero ? null : <span aria-hidden>→</span>}
        </TrackedLink>
      </div>
    </>
  );
}
