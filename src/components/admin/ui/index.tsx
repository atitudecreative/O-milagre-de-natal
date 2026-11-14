import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
const VARIANT: Record<Variant, string> = {
  primary: "bg-ink text-card hover:bg-ink-2",
  secondary: "bg-card text-ink ring-1 ring-inset ring-line hover:ring-line-strong",
  ghost: "text-ink-2 hover:bg-paper-2",
  danger: "bg-bad text-white hover:opacity-90",
};
const SIZE = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-sm" };

export function buttonClass(variant: Variant = "primary", size: keyof typeof SIZE = "md") {
  return cx(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,box-shadow,opacity] duration-200 disabled:pointer-events-none disabled:opacity-50",
    VARIANT[variant],
    SIZE[size],
  );
}

export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZE }) {
  return <button {...rest} className={cx(buttonClass(variant, size), className)} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof SIZE }) {
  return <Link {...rest} className={cx(buttonClass(variant, size), className)} />;
}

export function PageHeader({ title, eyebrow, description, actions }: { title: ReactNode; eyebrow?: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-mute">{eyebrow}</p> : null}
        <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mute">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({ title, description, actions, children, className, padded = true }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cx("rounded-xl bg-card ring-1 ring-line", className)}>
      {title || actions ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title ? <h2 className="text-sm font-semibold">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-xs leading-relaxed text-mute">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

const TONE = {
  neutral: "bg-paper-2 text-ink-2",
  ok: "bg-[#e3f0e7] text-ok",
  warn: "bg-[#f6ecd9] text-warn",
  bad: "bg-[#f5e0dd] text-bad",
  info: "bg-[#e2e9f8] text-info",
  ink: "bg-ink text-card",
};
export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof TONE; children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", TONE[tone], className)}>{children}</span>;
}

export function StatusDot({ tone }: { tone: "ok" | "warn" | "bad" | "neutral" | "info" }) {
  const c = { ok: "bg-ok", warn: "bg-warn", bad: "bg-bad", neutral: "bg-faint", info: "bg-info" }[tone];
  return <span className={cx("inline-block h-1.5 w-1.5 rounded-full", c)} />;
}

export function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-display text-2xl">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-mute">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) {
  return (
    <div className={cx("rounded-xl p-5 ring-1", accent ? "bg-ink text-card ring-ink" : "bg-card ring-line")}>
      <p className={cx("text-xs", accent ? "text-faint" : "text-mute")}>{label}</p>
      <p className="mt-3 font-display text-4xl leading-none tabular-nums">{value}</p>
      {hint ? <p className={cx("mt-2 text-xs", accent ? "text-faint" : "text-mute")}>{hint}</p> : null}
    </div>
  );
}
