import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { LEAD_STATUSES } from '@/lib/schema';
import { formatDateTime, whatsappLink } from '@/lib/format';
import { deleteLeadAction, updateLeadAction } from '../../../actions';
import { ConfirmButton, inputCls, Notice, PageTitle, StatusPill } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/client';

export default async function LeadDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  await requireRole('leads');
  const { id } = await params;
  const sp = await searchParams;
  const l = await (await db()).get('leads', id);
  if (!l) notFound();
  const wa = whatsappLink(String(l.phone), `Olá, ${String(l.name).split(' ')[0]}! Aqui é da equipe do musical O Milagre do Natal. Recebemos seu interesse em patrocinar.`);

  const info: [string, unknown][] = [
    ['Tipo', l.kind === 'midia_kit' ? 'Pedido de mídia kit' : 'Interesse em patrocínio'],
    ['Responsável', l.name],
    ['Empresa', l.company],
    ['E-mail', l.email],
    ['Telefone', l.phone],
    ['Segmento', l.segment],
    ['Cota de interesse', l.tier],
    ['Mensagem', l.message],
    ['Recebido em', formatDateTime(l.created_at)],
    ['Origem', l.source],
    ['UTM', [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(' / ') || '—'],
    ['Referência', l.referrer || 'Acesso direto'],
    ['Página', l.page],
    ['Consentimento LGPD', l.consent_text],
    ['Notificações', l.webhook_status],
  ];

  return (
    <div className="max-w-5xl">
      <a href="/admin/leads" className="text-xs text-cream/50 hover:text-gold">← Empresas interessadas</a>
      <PageTitle title={String(l.company || l.email)} subtitle={<StatusPill status={String(l.status)} />} />
      <Notice ok={sp.ok} />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <dl className="divide-y divide-white/5 rounded-xl border border-white/10">
          {info.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr]">
              <dt className="text-xs uppercase tracking-[0.12em] text-cream/40">{k}</dt>
              <dd className="whitespace-pre-wrap break-words text-sm text-cream/85">{String(v || '—')}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {l.email ? <a href={`mailto:${String(l.email)}`} className="rounded-md border border-white/15 px-3 py-2 text-xs hover:border-gold/60">Responder por e-mail</a> : null}
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/15 px-3 py-2 text-xs hover:border-gold/60">Abrir WhatsApp</a>}
          </div>
          <form action={updateLeadAction.bind(null, l.id)} className="space-y-4 rounded-xl border border-white/10 p-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-cream/60" htmlFor="status">Status do atendimento</label>
              <select id="status" name="status" defaultValue={String(l.status)} className={`${inputCls} [&>option]:bg-ink`}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-cream/60" htmlFor="notes">Anotações internas</label>
              <textarea id="notes" name="notes" rows={6} defaultValue={String(l.notes ?? '')} className={inputCls} />
            </div>
            <SubmitButton>Salvar atendimento</SubmitButton>
          </form>
          <form action={deleteLeadAction.bind(null, l.id)} className="rounded-xl border border-red-400/20 p-5">
            <p className="mb-3 text-xs text-cream/50">Exclusão definitiva (ex.: pedido do titular dos dados, LGPD art. 18).</p>
            <ConfirmButton message="Excluir definitivamente este contato?">Excluir contato</ConfirmButton>
          </form>
        </div>
      </div>
    </div>
  );
}
