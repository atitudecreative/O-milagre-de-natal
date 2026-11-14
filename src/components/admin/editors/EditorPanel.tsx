import Link from "next/link";
import { notFound } from "next/navigation";
import type { Session } from "@/lib/auth";
import type { EventBundle, IntegrationRow, SectionType, HeroSettings } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/env";
import { formatInt } from "@/lib/format";
import { Panel, Stat, buttonClass } from "../ui";
import { AreaChart, BarList } from "@/components/charts/AdminCharts";
import { GeneralForm } from "./GeneralForm";
import { BrandingEditor } from "./BrandingEditor";
import { SectionsManager } from "./SectionsManager";
import { SectionForm } from "./SectionForm";
import { CollectionEditor } from "./CollectionEditor";
import { ContactForm } from "./ContactForm";
import { SeoForm } from "./SeoForm";
import { IntegrationsForm } from "./IntegrationsForm";
import { MediaLibrary } from "../media/MediaLibrary";
import { ReviewList, reviewChecks } from "./Review";
import { PublishButton } from "./PublishButton";
import * as F from "./sectionFields";
import type { Row } from "./configs";

type Props = {
  tab: string;
  bundle: EventBundle;
  integrations: IntegrationRow | null;
  sponsorOptions: { id: string; name: string }[];
  session: Session;
};

function H({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-3xl leading-none">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mute">{description}</p> : null}
    </div>
  );
}

/** Renderiza a aba do editor (usado pelo editor e pelo assistente de criação). */
export async function EditorPanel({ tab, bundle, integrations, sponsorOptions, session }: Props) {
  const { event, media } = bundle;
  const canWrite = session.can("events.write");
  const sec = (t: SectionType) => bundle.sections.find((s) => s.type === t);
  const rows = (x: unknown[]) => x as Row[];
  const common = { eventId: event.id, media, canWrite };

  switch (tab) {
    case "geral":
      return (<><H title="Informações gerais" description="Dados básicos que alimentam a abertura, o rodapé, o SEO e o PDF." /><GeneralForm event={event} canWrite={canWrite} siteUrl={siteUrl()} /></>);
    case "identidade":
      return (<><H title="Identidade visual" description="Cada evento tem sua própria paleta, tipografia e elementos gráficos. A pré-visualização atualiza em tempo real." /><BrandingEditor event={event} branding={bundle.branding} media={media} canWrite={canWrite} /></>);
    case "secoes": {
      const counts: Partial<Record<SectionType, number>> = {
        metrics: bundle.metrics.filter((m) => m.kind === "actual").length,
        grandeur: bundle.media.filter((m) => m.in_gallery).length,
        audience: bundle.audience.length,
        results: bundle.results.length,
        opportunities: bundle.opportunities.filter((o) => o.enabled).length,
        tiers: bundle.tiers.filter((t) => t.enabled).length,
        sponsors: bundle.sponsors.length,
        next_edition: bundle.metrics.filter((m) => m.kind === "projection").length + (((sec("next_edition")?.settings as { items?: unknown[] })?.items?.length) ?? 0),
      };
      return (
        <>
          <H title="Seções e ordem" description="Todas as páginas usam a mesma arquitetura; aqui você decide o que aparece e em que ordem." />
          <SectionsManager eventId={event.id} sections={bundle.sections} counts={counts} canWrite={canWrite} />
          <div className="mt-6 space-y-6">
            <SectionForm {...common} section={sec("metrics")!} fields={F.METRICS_FIELDS} />
            <SectionForm {...common} section={sec("opportunities")!} />
            <SectionForm {...common} section={sec("tiers")!} fields={F.TIERS_FIELDS} />
            <SectionForm {...common} section={sec("sponsors")!} fields={F.SPONSORS_FIELDS} />
            <SectionForm {...common} section={sec("footer")!} fields={F.FOOTER_FIELDS} text={false} />
          </div>
        </>
      );
    }
    case "abertura":
      return (
        <>
          <H title="Abertura" description="A primeira dobra: imagem ou vídeo, título monumental e os dois botões de ação." />
          <SectionForm {...common} section={sec("hero")!} fields={F.HERO_FIELDS} textLabels={{ eyebrow: "Chamada (não exibida)", title: "Título (vazio = nome do evento)", body: "Observação interna (não exibida)" }} />
        </>
      );
    case "indicadores":
      return (
        <>
          <H title="Indicadores" description="O evento em números. Cadastre apenas dados reais, com fonte e período de apuração." />
          <CollectionEditor config="metrics" eventId={event.id} items={rows(bundle.metrics.filter((m) => m.kind === "actual"))} media={media} canWrite={canWrite} />
          <div className="mt-8"><SectionForm {...common} section={sec("metrics")!} fields={F.METRICS_FIELDS} /></div>
        </>
      );
    case "galeria":
      return (
        <>
          <H title="Galeria e vídeos" description="Fotos marcadas como “galeria” compõem o layout editorial. A primeira em destaque abre em tela cheia." />
          <SectionForm {...common} section={sec("grandeur")!} fields={F.GRANDEUR_FIELDS} />
          <Panel title="Fotos da galeria" className="mt-6" description={`${media.filter((m) => m.in_gallery).length} fotos marcadas. Gerencie na biblioteca: marque “Exibir na galeria”, defina destaque, legendas e textos alternativos.`}>
            <Link href={`/admin/eventos/${event.id}/midia`} className={buttonClass("secondary", "sm")}>Abrir biblioteca de mídia</Link>
          </Panel>
          <div className="mt-8">
            <H title="Depoimentos" />
            <CollectionEditor config="testimonials" eventId={event.id} items={rows(bundle.testimonials)} media={media} canWrite={canWrite} />
          </div>
        </>
      );
    case "publico":
      return (
        <>
          <H title="Público" description="Perfil do público com gráficos de barras, rosca, indicadores ou mapa por estado." />
          <CollectionEditor config="audience" eventId={event.id} items={rows(bundle.audience)} media={media} canWrite={canWrite} />
          <div className="mt-8"><SectionForm {...common} section={sec("audience")!} fields={F.AUDIENCE_FIELDS} /></div>
        </>
      );
    case "resultados":
      return (
        <>
          <H title="Resultados da última edição" description="Informe o valor anterior para gerar automaticamente o comparativo e o crescimento entre edições. Fotos da pasta “Ativações de marca” aparecem nesta seção." />
          <CollectionEditor config="results" eventId={event.id} items={rows(bundle.results)} media={media} canWrite={canWrite} />
          <div className="mt-8"><SectionForm {...common} section={sec("results")!} fields={F.RESULTS_FIELDS} /></div>
        </>
      );
    case "proxima-edicao":
      return (
        <>
          <H title="Próxima edição" description="Expectativas e novidades. Tudo aqui é exibido como projeção, visualmente separado dos resultados históricos." />
          <CollectionEditor config="projections" eventId={event.id} items={rows(bundle.metrics.filter((m) => m.kind === "projection"))} media={media} canWrite={canWrite} />
          <div className="mt-8"><SectionForm {...common} section={sec("next_edition")!} fields={F.NEXT_FIELDS} /></div>
        </>
      );
    case "oportunidades":
      return (<><H title="Oportunidades para marcas" description="Formatos de associação de marca, cada um com descrição, imagem e contrapartidas." /><CollectionEditor config="opportunities" eventId={event.id} items={rows(bundle.opportunities)} media={media} canWrite={canWrite} /></>);
    case "cotas":
      return (
        <>
          <H title="Cotas de patrocínio" description={session.can("events.write") ? "Quantas cotas forem necessárias. Oculte valores para negociação sob consulta." : "Seu perfil pode atualizar a quantidade comercializada de cada cota."} />
          <CollectionEditor config="tiers" eventId={event.id} items={rows(bundle.tiers)} media={media} canWrite={canWrite} salesOnly={!canWrite && session.can("tiers.sales")} />
        </>
      );
    case "patrocinadores":
      return (
        <>
          <H title="Patrocinadores e parceiros" description="Vincule marcas da biblioteca global a este evento. Cases e depoimentos de marcas reforçam a credibilidade." />
          <CollectionEditor config="sponsors" eventId={event.id} items={rows(bundle.sponsors)} media={media} canWrite={canWrite} options={{ sponsor_id: sponsorOptions.map((s) => ({ value: s.id, label: s.name })) }} />
          <p className="mt-4 text-xs text-mute"><Link href="/admin/marcas" className="underline-offset-4 hover:underline">Gerenciar biblioteca de marcas →</Link></p>
        </>
      );
    case "contatos":
      return (
        <>
          <H title="Contatos e formulário" description="Dados de contato, organização (LGPD), opções do formulário e links do rodapé." />
          <ContactForm event={event} canWrite={canWrite} />
          <div className="mt-8"><SectionForm {...common} section={sec("cta")!} fields={F.CTA_FIELDS} title="Chamada final" /></div>
        </>
      );
    case "midia":
      return (<><H title="Biblioteca de mídia" description="Arquivos deste evento. Imagens enviadas são redimensionadas e convertidas para WebP; a página entrega AVIF/WebP no tamanho de cada tela." /><MediaLibrary eventId={event.id} initial={media} canWrite={session.can("media.write")} /></>);
    case "seo": {
      const hero = (sec("hero")?.settings ?? {}) as HeroSettings;
      return (<><H title="SEO e compartilhamento" /><SeoForm event={event} media={media} canWrite={canWrite} siteUrl={siteUrl()} fallbackImage={hero.image_desktop} /></>);
    }
    case "rastreamento":
      return (<><H title="Rastreamento" description="Cada evento tem seus próprios IDs de medição." /><IntegrationsForm eventId={event.id} integrations={integrations} canWrite={session.can("integrations.write")} /></>);
    case "desempenho":
      return <Performance eventId={event.id} />;
    case "publicar": {
      const checks = reviewChecks(bundle);
      const missing = checks.filter((c) => !c.ok && c.level === "required").length;
      return (
        <>
          <H title="Revisar e publicar" description="Confira os itens essenciais, visualize a página e publique. O endereço público é gerado a partir do slug." />
          <Panel className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-mute">Endereço público</p>
                <p className="mt-1 break-all font-mono text-sm">{siteUrl()}/eventos/{event.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`/preview/${event.id}`} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>Pré-visualizar ↗</a>
                {session.can("events.publish") ? <PublishButton eventId={event.id} slug={event.slug} status={event.status} issues={missing} /> : null}
              </div>
            </div>
          </Panel>
          <ReviewList eventId={event.id} checks={checks} />
        </>
      );
    }
    default:
      notFound();
  }
}

async function Performance({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("event_funnel", { p_event: eventId, p_days: 30 });
  const f = (data ?? {}) as { counts?: Record<string, number>; sessions?: number; by_day?: { day: string; views: number; leads: number }[]; sources?: { source: string; views: number }[]; devices?: Record<string, number> };
  const c = f.counts ?? {};
  const views = c.page_view ?? 0;
  const leads = c.form_submit ?? 0;
  const conv = f.sessions ? (leads / f.sessions) * 100 : 0;
  const steps = [
    { label: "Visualizações", value: views },
    { label: "Viram as cotas", value: c.tiers_view ?? 0 },
    { label: "Cliques em CTA", value: c.cta_click ?? 0 },
    { label: "Iniciaram o formulário", value: c.form_start ?? 0 },
    { label: "Enviaram o formulário", value: leads },
  ];
  return (
    <>
      <H title="Acessos e conversões" description="Medição interna, sem cookies, dos últimos 30 dias. Para análises avançadas, use GA4/GTM configurados em Rastreamento." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Visitantes únicos" value={formatInt(f.sessions ?? 0)} />
        <Stat label="Visualizações" value={formatInt(views)} />
        <Stat label="Leads (formulário)" value={formatInt(leads)} accent />
        <Stat label="Conversão" value={`${conv.toFixed(1)}%`} hint="Leads ÷ visitantes" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Visualizações e leads por dia" className="lg:col-span-2">
          <AreaChart data={f.by_day ?? []} label="Visualizações e leads por dia" series={[{ key: "views", label: "Visualizações", color: "#141413" }, { key: "leads", label: "Leads", color: "#2f5bc0", dashed: true }]} />
        </Panel>
        <Panel title="Funil">
          <BarList rows={steps.map((s) => ({ label: s.label, value: s.value }))} />
        </Panel>
        <Panel title="Origem do tráfego">
          {f.sources?.length ? <BarList rows={f.sources.map((s) => ({ label: s.source, value: s.views }))} /> : <p className="text-sm text-mute">Sem acessos no período.</p>}
        </Panel>
        <Panel title="Dispositivos">
          {Object.keys(f.devices ?? {}).length ? <BarList rows={Object.entries(f.devices ?? {}).map(([k, v]) => ({ label: ({ mobile: "Celular", tablet: "Tablet", desktop: "Computador" } as Record<string, string>)[k] ?? k, value: v }))} /> : <p className="text-sm text-mute">Sem acessos no período.</p>}
        </Panel>
        <Panel title="Outros eventos">
          <BarList rows={[{ label: "Cliques no WhatsApp", value: c.whatsapp_click ?? 0 }, { label: "Downloads do PDF", value: c.deck_download ?? 0 }]} />
        </Panel>
      </div>
    </>
  );
}
