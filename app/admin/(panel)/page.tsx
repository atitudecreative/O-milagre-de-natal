import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { can, getSessionUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { PageTitle, StatusPill } from '@/components/admin/ui';

const EVENT_LABEL: Record<string, string> = {
  lead_submit: 'Formulários de patrocínio enviados',
  kit_request: 'Pedidos de mídia kit por e-mail',
  kit_download: 'Cliques em baixar mídia kit',
  kit_download_server: 'Downloads do PDF (servidor)',
  sponsor_cta: 'Cliques em "Seja patrocinador"',
  tier_interest: 'Cliques em "Tenho interesse"',
  whatsapp_click: 'Cliques no WhatsApp',
  contact_cta: 'Cliques em "Fale com a equipe"',
  email_click: 'Cliques no e-mail',
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const sp = await searchParams;
  const d = await db();
  const settings = await d.getSettings();
  const events = await d.countBy('events', 'type');
  const showLeads = can(user, 'leads');
  const leads = showLeads ? await d.list('leads', { orderBy: 'created_at', desc: true, limit: 8 }) : [];
  const byStatus = showLeads ? await d.countBy('leads', 'status') : {};
  const total = showLeads ? await d.count('leads') : 0;
  const tierInterest = showLeads ? await d.countBy('leads', 'tier') : {};
  const demo = (await d.list('metrics')).filter((m) => m.status === 'demo' && m.visible).length + (await d.list('audience')).filter((m) => m.status === 'demo' && m.visible).length;

  const checklist = [
    { ok: !!settings.whatsapp_number, label: 'Número de WhatsApp comercial', href: '/admin/configuracoes?grupo=contato' },
    { ok: !!settings.contact_email, label: 'E-mail comercial', href: '/admin/configuracoes?grupo=contato' },
    { ok: !!settings.instagram_url, label: 'Redes sociais oficiais', href: '/admin/configuracoes?grupo=contato' },
    { ok: !!settings.privacy_email && !!settings.legal_document, label: 'CNPJ e e-mail do encarregado (LGPD)', href: '/admin/configuracoes?grupo=institucional' },
    { ok: !!settings.ga4_id || !!process.env.NEXT_PUBLIC_GA4_ID, label: 'Google Analytics 4', href: '/admin/configuracoes?grupo=seo' },
    { ok: demo === 0, label: demo ? `${demo} indicador(es) demonstrativo(s) aguardando dado real` : 'Indicadores com dados reais', href: '/admin/conteudo/metrics' },
    { ok: !!process.env.RESEND_API_KEY, label: 'Envio de e-mail (RESEND_API_KEY)', href: '#' },
    { ok: !!process.env.CRM_WEBHOOK_URL, label: 'Integração com CRM (CRM_WEBHOOK_URL)', href: '#' },
  ];

  return (
    <div>
      {sp.erro === 'permissao' && <p className="mb-6 rounded-md border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Seu perfil não tem acesso a essa área.</p>}
      <PageTitle title={`Olá, ${user.name.split(' ')[0]}.`} subtitle="Resumo da captação comercial e do conteúdo do site." />

      {showLeads && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Contatos recebidos', total],
            ['Novos (sem retorno)', byStatus.novo ?? 0],
            ['Em negociação', (byStatus.negociacao ?? 0) + (byStatus.proposta ?? 0)],
            ['Fechados', byStatus.fechado ?? 0],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-cream/45">{k}</p>
              <p className="display mt-2 text-4xl text-cream">{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-3">
        {showLeads && (
          <section className="rounded-xl border border-white/10 bg-white/[0.02] xl:col-span-2">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold">Últimos contatos</h2>
              <a href="/admin/leads" className="text-xs text-gold hover:underline">Ver todos →</a>
            </div>
            {leads.length ? (
              <ul className="divide-y divide-white/5">
                {leads.map((l) => (
                  <li key={l.id}>
                    <a href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-white/[0.03]">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-cream">{String(l.company || l.email)}</span>
                        <span className="block truncate text-xs text-cream/45">
                          {l.kind === 'midia_kit' ? 'Pedido de mídia kit' : `Cota: ${String(l.tier)}`} · {formatDateTime(l.created_at)}
                        </span>
                      </span>
                      <StatusPill status={String(l.status)} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-cream/40">Nenhum contato ainda. Os envios do formulário aparecerão aqui.</p>
            )}
          </section>
        )}

        <section className="rounded-xl border border-white/10 bg-white/[0.02]">
          <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold">Conversões registradas</h2>
          <ul className="divide-y divide-white/5 text-sm">
            {Object.entries(EVENT_LABEL).map(([k, label]) => (
              <li key={k} className="flex justify-between gap-4 px-5 py-2.5">
                <span className="text-cream/65">{label}</span>
                <span className="tabular-nums text-cream">{events[k] ?? 0}</span>
              </li>
            ))}
          </ul>
        </section>

        {showLeads && Object.keys(tierInterest).length > 0 && (
          <section className="rounded-xl border border-white/10 bg-white/[0.02]">
            <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold">Interesse por cota</h2>
            <ul className="divide-y divide-white/5 text-sm">
              {Object.entries(tierInterest)
                .filter(([k]) => k)
                .map(([k, v]) => (
                  <li key={k} className="flex justify-between px-5 py-2.5">
                    <span className="text-cream/65">{k}</span>
                    <span className="tabular-nums">{v}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-white/10 bg-white/[0.02] xl:col-span-2">
          <h2 className="border-b border-white/10 px-5 py-4 text-sm font-semibold">Checklist de publicação</h2>
          <ul className="divide-y divide-white/5 text-sm">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-3 px-5 py-2.5">
                <span className={c.ok ? 'text-emerald-300' : 'text-amber-300'}>{c.ok ? '●' : '○'}</span>
                {c.href !== '#' && can(user, 'content') ? (
                  <a href={c.href} className="text-cream/75 hover:text-gold">{c.label}</a>
                ) : (
                  <span className="text-cream/75">{c.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
