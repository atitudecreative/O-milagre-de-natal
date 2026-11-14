import Link from "next/link";
import { cx } from "../ui";
import { WIZARD_STEPS } from "./steps";

export function WizardSteps({ current, eventId }: { current: number; eventId?: string }) {
  return (
    <nav aria-label="Etapas de criação" className="mb-10">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-mute">Novo evento · etapa {current} de {WIZARD_STEPS.length}</p>
      <ol className="grid grid-cols-6 gap-1.5">
        {WIZARD_STEPS.map((s) => {
          const state = s.n < current ? "done" : s.n === current ? "current" : "todo";
          const content = (
            <>
              <span className={cx("block h-1 rounded-full", state === "todo" ? "bg-line" : "bg-ink")} />
              <span className={cx("mt-2 hidden text-xs md:block", state === "current" ? "font-medium text-ink" : "text-mute")}>{s.label}</span>
            </>
          );
          return (
            <li key={s.n} aria-current={state === "current" ? "step" : undefined}>
              {eventId && s.n > 1 ? <Link href={`/admin/eventos/${eventId}/assistente/${s.n}`} className="block">{content}</Link> : content}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm font-medium md:hidden">{WIZARD_STEPS[current - 1]?.label}</p>
    </nav>
  );
}
