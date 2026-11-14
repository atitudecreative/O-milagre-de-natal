import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getEditorData } from "@/lib/data/editor";
import { EditorPanel } from "@/components/admin/editors/EditorPanel";
import { WizardSteps } from "@/components/admin/wizard/WizardSteps";
import { WIZARD_STEPS } from "@/components/admin/wizard/steps";
import { EDITOR_TABS } from "@/components/admin/editors/tabs";
import { buttonClass, cx } from "@/components/admin/ui";

/** Assistente de criação: etapas 2–6 reutilizam os mesmos editores do evento. */
export default async function WizardStep({ params, searchParams }: PageProps<"/admin/eventos/[id]/assistente/[etapa]">) {
  const { id, etapa } = await params;
  const sp = await searchParams;
  const n = Number(etapa);
  const step = WIZARD_STEPS.find((s) => s.n === n);
  if (!step || n < 2) notFound();
  const session = await requireStaff();
  const data = await getEditorData(id);
  const tab = typeof sp.aba === "string" && step.tabs.includes(sp.aba) ? sp.aba : step.tabs[0];
  const next = WIZARD_STEPS.find((s) => s.n === n + 1);

  return (
    <div>
      <WizardSteps current={n} eventId={id} />
      {step.tabs.length > 1 ? (
        <div className="mb-8 flex gap-1 overflow-x-auto adm-scroll">
          {step.tabs.map((t) => (
            <Link key={t} href={`/admin/eventos/${id}/assistente/${n}?aba=${t}`} aria-current={t === tab ? "page" : undefined}
              className={cx("shrink-0 rounded-full px-3.5 py-1.5 text-sm", t === tab ? "bg-ink text-card" : "text-ink-2 ring-1 ring-line hover:bg-paper-2")}>
              {EDITOR_TABS.find((x) => x.slug === t)?.label}
            </Link>
          ))}
        </div>
      ) : null}
      <EditorPanel tab={tab} bundle={data.bundle} integrations={data.integrations} sponsorOptions={data.sponsorOptions} session={session} />
      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <Link href={n > 2 ? `/admin/eventos/${id}/assistente/${n - 1}` : `/admin/eventos/${id}/geral`} className={buttonClass("ghost")}>← Voltar</Link>
        {next ? <Link href={`/admin/eventos/${id}/assistente/${next.n}`} className={buttonClass("primary")}>Próxima etapa: {next.label} →</Link> : <Link href={`/admin/eventos/${id}/geral`} className={buttonClass("secondary")}>Concluir e ir para o editor</Link>}
      </div>
    </div>
  );
}
