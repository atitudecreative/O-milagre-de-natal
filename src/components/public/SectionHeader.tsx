import { Reveal } from "./Reveal";

export function SectionHeader({ index, eyebrow, title, body, align = "left", className = "" }: {
  index?: number;
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
  align?: "left" | "split";
  className?: string;
}) {
  const idx = index != null ? String(index).padStart(2, "0") : null;
  if (align === "split") {
    return (
      <header className={`grid gap-8 md:grid-cols-12 md:gap-10 ${className}`}>
        <Reveal className="md:col-span-7">
          {eyebrow ? (
            <p className="ev-eyebrow mb-6 flex items-center gap-3">
              {idx ? <span className="tabular-nums text-[var(--ev-accent)]">{idx}</span> : null}
              <span className="h-px w-8 bg-[var(--ev-line-strong)]" />
              {eyebrow}
            </p>
          ) : null}
          {title ? <h2 className="ev-display text-[clamp(2.4rem,6.4vw,6.2rem)]">{title}</h2> : null}
        </Reveal>
        {body ? (
          <Reveal className="md:col-span-4 md:col-start-9 md:self-end" delay={0.15}>
            <p className="text-base leading-relaxed text-[var(--ev-muted)] md:text-lg">{body}</p>
          </Reveal>
        ) : null}
      </header>
    );
  }
  return (
    <header className={`max-w-4xl ${className}`}>
      <Reveal>
        {eyebrow ? (
          <p className="ev-eyebrow mb-6 flex items-center gap-3">
            {idx ? <span className="tabular-nums text-[var(--ev-accent)]">{idx}</span> : null}
            <span className="h-px w-8 bg-[var(--ev-line-strong)]" />
            {eyebrow}
          </p>
        ) : null}
        {title ? <h2 className="ev-display text-[clamp(2.4rem,6.4vw,6.2rem)]">{title}</h2> : null}
        {body ? <p className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--ev-muted)] md:text-lg">{body}</p> : null}
      </Reveal>
    </header>
  );
}

export function SourceNote({ source, period }: { source?: string | null; period?: string | null }) {
  if (!source && !period) return null;
  return (
    <p className="ev-micro mt-3">
      {source ? <>Fonte: {source}</> : null}
      {source && period ? " · " : null}
      {period}
    </p>
  );
}
