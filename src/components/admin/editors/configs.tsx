"use client";
import type { ReactNode } from "react";
import type { CollectionTable } from "@/lib/validation/content";
import { CHART_LABEL, DIMENSION_LABEL, OPPORTUNITY_LABEL, RELATION_LABEL, RESULT_CATEGORY_LABEL } from "@/lib/labels";
import { compactNumber, formatCurrency, growth } from "@/lib/format";

export type Row = Record<string, unknown>;
type Opt = { value: string; label: string };
export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "toggle" | "lines" | "image" | "datapoints";
  options?: Opt[];
  hint?: string;
  placeholder?: string;
  span?: 1 | 2;
  required?: boolean;
  rows?: number;
  max?: number;
  step?: string;
  folder?: string;
  aspect?: string;
  showIf?: (draft: Record<string, unknown>) => boolean;
};
export type Config = {
  table: CollectionTable;
  fields: FieldDef[];
  defaults: Row;
  title: (r: Row, o: Record<string, Opt[]>) => ReactNode;
  subtitle?: (r: Row, o: Record<string, Opt[]>) => ReactNode;
  badge?: (r: Row) => ReactNode;
  thumb?: (r: Row) => string | null | undefined;
  addLabel: string;
  emptyTitle: string;
  emptyText: string;
  intro?: string;
  formNote?: (draft: Record<string, unknown>) => ReactNode;
  salesFields?: string[];
};

const opts = (m: Record<string, string>): Opt[] => Object.entries(m).map(([value, label]) => ({ value, label }));
const fmt = (v: unknown) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const c = compactNumber(n);
  return `${c.number}${c.suffix ? ` ${c.suffix}` : ""}`;
};
const src = (r: Row) => [r.source, r.period].filter(Boolean).join(" · ") || "Sem fonte informada";

const metricFields = (kind: "actual" | "projection"): FieldDef[] => [
  { name: "label", label: "Título", type: "text", required: true, placeholder: kind === "actual" ? "Público presencial" : "Público esperado", max: 80 },
  { name: "value", label: "Valor", type: "number", required: true, hint: "Número completo (ex.: 62000). A página abrevia como “62 mil”." },
  { name: "unit", label: "Unidade", type: "text", placeholder: "pessoas, %, contas", max: 24 },
  { name: "prefix", label: "Prefixo", type: "text", placeholder: "R$, +", max: 8 },
  { name: "description", label: "Descrição", type: "textarea", rows: 2, span: 2, max: 280 },
  { name: "source", label: kind === "actual" ? "Fonte dos dados" : "Base da projeção", type: "text", required: kind === "actual", placeholder: kind === "actual" ? "Ex.: Bilheteria oficial, Meta Business Suite" : "Ex.: Planejamento da organização", max: 200 },
  { name: "period", label: "Período de apuração", type: "text", placeholder: "Set/2026", max: 80 },
  { name: "animate", label: "Animação numérica", type: "toggle", hint: "Conta até o valor ao aparecer na tela." },
  ...(kind === "actual" ? [{ name: "featured", label: "Indicador em destaque", type: "toggle", hint: "Exibido em tamanho grande (apenas um)." } as FieldDef] : []),
];

export const CONFIGS = {
  metrics: {
    table: "event_metrics",
    fields: metricFields("actual"),
    defaults: { kind: "actual", animate: true, featured: false },
    title: (r) => `${fmt(r.value)} ${r.unit ?? ""} — ${r.label}`,
    subtitle: (r) => src(r),
    badge: (r) => (r.featured ? "Destaque" : null),
    addLabel: "Adicionar indicador",
    emptyTitle: "Nenhum indicador",
    emptyText: "Cadastre números reais e auditáveis, sempre com fonte e período.",
    intro: "Indicadores apurados (dados reais). Projeções ficam na aba “Próxima edição” e são exibidas com estilo diferente.",
    formNote: () => "Não invente resultados: informe a fonte e o período. Dados sem fonte reduzem a credibilidade da apresentação.",
  },
  projections: {
    table: "event_metrics",
    fields: metricFields("projection"),
    defaults: { kind: "projection", animate: true, featured: false },
    title: (r) => `${fmt(r.value)} ${r.unit ?? ""} — ${r.label}`,
    subtitle: (r) => src(r),
    badge: () => "Projeção",
    addLabel: "Adicionar projeção",
    emptyTitle: "Nenhuma projeção",
    emptyText: "Metas e expectativas para a próxima edição. Aparecem identificadas como projeção.",
  },
  results: {
    table: "event_results",
    fields: [
      { name: "category", label: "Categoria", type: "select", options: opts(RESULT_CATEGORY_LABEL) },
      { name: "label", label: "Título", type: "text", required: true, max: 120 },
      { name: "value", label: "Valor (última edição)", type: "number", required: true },
      { name: "previous_value", label: "Valor (edição anterior)", type: "number", hint: "Opcional — habilita o comparativo e o % de crescimento." },
      { name: "unit", label: "Unidade", type: "text", max: 24 },
      { name: "prefix", label: "Prefixo", type: "text", max: 8 },
      { name: "description", label: "Descrição", type: "textarea", rows: 2, span: 2, max: 280 },
      { name: "source", label: "Fonte", type: "text", required: true, max: 200 },
      { name: "period", label: "Período", type: "text", max: 80 },
    ],
    defaults: { category: "media" },
    title: (r) => `${fmt(r.value)} ${r.unit ?? ""} — ${r.label}`,
    subtitle: (r) => {
      const g = growth(Number(r.value), r.previous_value == null || r.previous_value === "" ? null : Number(r.previous_value));
      return `${RESULT_CATEGORY_LABEL[String(r.category)] ?? ""}${g != null ? ` · ${g >= 0 ? "+" : ""}${g.toFixed(0)}% vs. anterior` : ""}`;
    },
    addLabel: "Adicionar resultado",
    emptyTitle: "Nenhum resultado",
    emptyText: "Resultados concretos da última edição: mídia, alcance, público, ativações.",
  },
  audience: {
    table: "event_audience",
    fields: [
      { name: "title", label: "Título", type: "text", required: true, max: 120, placeholder: "Faixa etária" },
      { name: "dimension", label: "Dimensão", type: "select", options: opts(DIMENSION_LABEL) },
      { name: "chart_type", label: "Visualização", type: "select", options: opts(CHART_LABEL), hint: "Mapa: use as siglas das UFs como rótulo." },
      { name: "unit", label: "Unidade", type: "text", placeholder: "%", max: 12 },
      { name: "data", label: "Dados", type: "datapoints", span: 2 },
      { name: "note", label: "Observação", type: "text", span: 2, max: 280 },
      { name: "source", label: "Fonte", type: "text", required: true, max: 200, placeholder: "Pesquisa com o público, n=1.200" },
      { name: "period", label: "Período", type: "text", max: 80 },
    ],
    defaults: { dimension: "age", chart_type: "bar", unit: "%", data: [{ label: "", value: "" }] },
    title: (r) => String(r.title ?? ""),
    subtitle: (r) => `${CHART_LABEL[r.chart_type as keyof typeof CHART_LABEL] ?? ""} · ${(r.data as unknown[] | undefined)?.length ?? 0} dados · ${src(r)}`,
    addLabel: "Adicionar bloco de público",
    emptyTitle: "Sem dados de público",
    emptyText: "Perfil do público em barras, rosca, indicadores ou mapa por estado.",
    formNote: (d) => (d.dimension === "gender" ? "Publique dados de gênero apenas quando coletados com consentimento e de forma agregada/anônima." : "Use dados agregados — nunca informações que identifiquem pessoas."),
  },
  testimonials: {
    table: "event_testimonials",
    fields: [
      { name: "quote", label: "Depoimento", type: "textarea", required: true, span: 2, rows: 3, max: 600 },
      { name: "author", label: "Autor", type: "text", required: true, max: 120 },
      { name: "context", label: "Onde exibir", type: "select", options: [{ value: "audience", label: "Grandiosidade (público)" }, { value: "results", label: "Resultados" }, { value: "sponsor", label: "Quem já acredita (marcas)" }] },
      { name: "role", label: "Cargo", type: "text", max: 120 },
      { name: "company", label: "Empresa", type: "text", max: 120 },
    ],
    defaults: { context: "audience" },
    title: (r) => `“${String(r.quote ?? "").slice(0, 90)}${String(r.quote ?? "").length > 90 ? "…" : ""}”`,
    subtitle: (r) => [r.author, r.company].filter(Boolean).join(" · "),
    badge: (r) => ({ audience: "Público", results: "Resultados", sponsor: "Marcas" })[String(r.context)] ?? null,
    addLabel: "Adicionar depoimento",
    emptyTitle: "Nenhum depoimento",
    emptyText: "Depoimentos reais de público, patrocinadores e parceiros (com autorização).",
  },
  opportunities: {
    table: "sponsorship_opportunities",
    fields: [
      { name: "title", label: "Título", type: "text", required: true, max: 120 },
      { name: "category", label: "Categoria", type: "select", options: opts(OPPORTUNITY_LABEL) },
      { name: "description", label: "Descrição", type: "textarea", span: 2, rows: 3, max: 1200 },
      { name: "deliverables", label: "Contrapartidas", type: "lines", span: 2, hint: "Uma por linha." },
      { name: "image_url", label: "Imagem", type: "image", span: 2, folder: "ativacoes" },
      { name: "enabled", label: "Exibir na página", type: "toggle" },
    ],
    defaults: { category: "custom", enabled: true, deliverables: [] },
    title: (r) => String(r.title ?? ""),
    subtitle: (r) => `${OPPORTUNITY_LABEL[String(r.category)] ?? ""} · ${(r.deliverables as unknown[] | undefined)?.length ?? 0} contrapartidas`,
    badge: (r) => (r.enabled ? null : "Oculta"),
    thumb: (r) => r.image_url as string,
    addLabel: "Adicionar oportunidade",
    emptyTitle: "Nenhuma oportunidade",
    emptyText: "Naming rights, ativações, estandes, mídia digital… cada formato com suas contrapartidas.",
  },
  tiers: {
    table: "sponsorship_tiers",
    fields: [
      { name: "name", label: "Nome da cota", type: "text", required: true, max: 60, placeholder: "Master, Ouro, Prata…" },
      { name: "tagline", label: "Frase curta", type: "text", max: 140 },
      { name: "price", label: "Valor", type: "number", hint: "Opcional. Usado no painel e, se permitido, na página." },
      { name: "currency", label: "Moeda", type: "select", options: [{ value: "BRL", label: "Real (BRL)" }, { value: "USD", label: "Dólar (USD)" }, { value: "EUR", label: "Euro (EUR)" }] },
      { name: "show_price", label: "Exibir valor na página", type: "toggle", hint: "Desligado = “Sob consulta”.", span: 2 },
      { name: "quantity_total", label: "Quantidade disponível", type: "number", step: "1", hint: "Vazio = ilimitada." },
      { name: "quantity_sold", label: "Quantidade comercializada", type: "number", step: "1" },
      { name: "description", label: "Descrição", type: "textarea", span: 2, rows: 2, max: 1200 },
      { name: "deliverables", label: "Contrapartidas", type: "lines", span: 2 },
      { name: "benefits", label: "Benefícios", type: "lines", span: 2, rows: 3 },
      { name: "image_url", label: "Logo ou imagem da cota", type: "image", folder: "marcas", aspect: "aspect-square" },
      { name: "highlight", label: "Destaque visual", type: "toggle", hint: "Cota em cor de destaque." },
      { name: "enabled", label: "Exibir na página", type: "toggle" },
    ],
    defaults: { currency: "BRL", show_price: false, quantity_sold: 0, highlight: false, enabled: true, deliverables: [], benefits: [] },
    title: (r) => String(r.name ?? ""),
    subtitle: (r) => {
      const price = r.price !== null && r.price !== "" && r.price !== undefined ? formatCurrency(Number(r.price), String(r.currency ?? "BRL")) : "Sem valor";
      const qty = r.quantity_total !== null && r.quantity_total !== "" && r.quantity_total !== undefined ? `${r.quantity_sold ?? 0}/${r.quantity_total} vendidas` : `${r.quantity_sold ?? 0} vendidas`;
      return `${price}${r.show_price ? "" : " (sob consulta)"} · ${qty}`;
    },
    badge: (r) => (!r.enabled ? "Oculta" : r.highlight ? "Destaque" : null),
    addLabel: "Adicionar cota",
    emptyTitle: "Nenhuma cota",
    emptyText: "Crie quantas cotas precisar — valores e quantidades são definidos aqui, nunca no código.",
    salesFields: ["quantity_sold"],
  },
  sponsors: {
    table: "event_sponsors",
    fields: [
      { name: "sponsor_id", label: "Marca", type: "select", required: true, placeholder: "Selecione…", hint: "Cadastre novas marcas em Marcas." },
      { name: "relation", label: "Relação", type: "select", options: opts(RELATION_LABEL) },
      { name: "tier_label", label: "Cota/categoria", type: "text", max: 60 },
      { name: "case_title", label: "Título do case", type: "text", span: 2, max: 140 },
      { name: "case_body", label: "Descrição do case", type: "textarea", span: 2, rows: 3, max: 1200 },
    ],
    defaults: { relation: "past" },
    title: (r, o) => o.sponsor_id?.find((x) => x.value === r.sponsor_id)?.label ?? "Marca",
    subtitle: (r) => `${RELATION_LABEL[r.relation as keyof typeof RELATION_LABEL] ?? ""}${r.tier_label ? ` · ${r.tier_label}` : ""}${r.case_title ? " · com case" : ""}`,
    addLabel: "Vincular marca",
    emptyTitle: "Nenhuma marca vinculada",
    emptyText: "Patrocinadores anteriores, parceiros institucionais e apoiadores.",
  },
} satisfies Record<string, Config>;

export type ConfigKey = keyof typeof CONFIGS;
