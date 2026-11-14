"use client";
import { updateIntegrations } from "@/actions/events";
import type { IntegrationRow } from "@/lib/types";
import { Panel } from "../ui";
import { Field, Input, Textarea, Toggle } from "../ui/fields";
import { SaveBar, useSaver } from "./useSaver";

export function IntegrationsForm({ eventId, integrations, canWrite }: { eventId: string; integrations: IntegrationRow | null; canWrite: boolean }) {
  const s = useSaver(
    {
      meta_pixel_id: integrations?.meta_pixel_id ?? "",
      ga_measurement_id: integrations?.ga_measurement_id ?? "",
      gtm_id: integrations?.gtm_id ?? "",
      tracking_enabled: integrations?.tracking_enabled ?? true,
      notify_emails: (integrations?.notify_emails ?? []).join("\n"),
    } as Record<string, unknown>,
    (v) => updateIntegrations(eventId, v),
  );
  const v = s.values as Record<string, string>;
  return (
    <div className="space-y-6">
      <Panel title="Ferramentas de medição" description="Configuração exclusiva deste evento. Os scripts só carregam depois que o visitante aceita os cookies (LGPD).">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Meta Pixel ID" hint="Somente números." error={s.errors.meta_pixel_id}><Input value={v.meta_pixel_id} onChange={(e) => s.set("meta_pixel_id", e.target.value)} disabled={!canWrite} placeholder="123456789012345" /></Field>
          <Field label="Google Analytics 4" hint="Measurement ID" error={s.errors.ga_measurement_id}><Input value={v.ga_measurement_id} onChange={(e) => s.set("ga_measurement_id", e.target.value)} disabled={!canWrite} placeholder="G-XXXXXXXXXX" /></Field>
          <Field label="Google Tag Manager" hint="Container ID" error={s.errors.gtm_id}><Input value={v.gtm_id} onChange={(e) => s.set("gtm_id", e.target.value)} disabled={!canWrite} placeholder="GTM-XXXXXXX" /></Field>
        </div>
        <div className="mt-5 border-t border-line pt-5">
          <Toggle label="Rastreamento externo ativo" description="Desligue para pausar Pixel/GA/GTM sem apagar os IDs. O registro interno de acessos continua." checked={Boolean(s.values.tracking_enabled)} onChange={(x) => s.set("tracking_enabled", x)} disabled={!canWrite} />
        </div>
      </Panel>
      <Panel title="Eventos registrados">
        <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {[
            ["Visualização da página", "page_view · PageView"],
            ["Clique no CTA", "cta_click · CTAClick"],
            ["Visualização das cotas", "view_sponsorship_tiers · ViewContent"],
            ["Início do formulário", "form_start · FormStart"],
            ["Envio do formulário (confirmado pelo servidor)", "generate_lead · Lead"],
            ["Clique no WhatsApp", "whatsapp_click · Contact"],
            ["Download da apresentação", "file_download · DeckDownload"],
          ].map(([a, b]) => (
            <li key={a} className="flex justify-between gap-4 border-b border-line py-2"><span>{a}</span><code className="text-xs text-mute">{b}</code></li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-mute">A conversão “Lead” só é disparada depois que o servidor confirma o registro do contato — nunca no clique do botão.</p>
      </Panel>
      <Panel title="Notificações de novos leads" description="Requer RESEND_API_KEY configurada no servidor. Sem ela, os leads aparecem apenas no painel.">
        <Field label="E-mails que recebem avisos" hint="Um por linha." error={s.errors.notify_emails}>
          <Textarea rows={3} value={v.notify_emails} onChange={(e) => s.set("notify_emails", e.target.value)} disabled={!canWrite} />
        </Field>
      </Panel>
      <SaveBar dirty={s.dirty} pending={s.pending} onSave={s.save} onReset={s.reset} disabled={!canWrite} />
    </div>
  );
}
