import type { AppRole, EventStatus, LeadStatus, SectionType, SponsorRelation, InteractionKind, ChartType } from "./types";

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  commercial: "Comercial",
};

export const STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Em contato",
  negotiating: "Em negociação",
  proposal_sent: "Proposta enviada",
  won: "Fechado",
  lost: "Perdido",
};
export const LEAD_STATUS_ORDER: LeadStatus[] = ["new", "contacted", "negotiating", "proposal_sent", "won", "lost"];

export const INTERACTION_LABEL: Record<InteractionKind, string> = {
  note: "Observação",
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  whatsapp: "WhatsApp",
  status_change: "Mudança de status",
  proposal: "Proposta",
};

export const SECTION_LABEL: Record<SectionType, string> = {
  hero: "Abertura",
  metrics: "O evento em números",
  grandeur: "A grandiosidade",
  audience: "Nosso público",
  results: "Resultados da última edição",
  opportunities: "Oportunidades para marcas",
  tiers: "Cotas de patrocínio",
  sponsors: "Quem já acredita",
  next_edition: "A próxima edição",
  cta: "Chamada final",
  footer: "Rodapé",
};

export const SECTION_ANCHOR: Record<SectionType, string> = {
  hero: "inicio",
  metrics: "numeros",
  grandeur: "o-evento",
  audience: "publico",
  results: "resultados",
  opportunities: "oportunidades",
  tiers: "cotas",
  sponsors: "parceiros",
  next_edition: "proxima-edicao",
  cta: "interesse",
  footer: "contato",
};

export const RELATION_LABEL: Record<SponsorRelation, string> = {
  past: "Patrocinador de edições anteriores",
  current: "Patrocinador atual",
  institutional: "Parceiro institucional",
  supporter: "Apoiador",
  media: "Parceiro de mídia",
};

export const OPPORTUNITY_LABEL: Record<string, string> = {
  naming_rights: "Naming rights",
  master: "Patrocínio master",
  official: "Patrocínio oficial",
  category: "Patrocínio por categoria",
  activation: "Ativação de marca",
  booth: "Estandes",
  experience: "Experiências exclusivas",
  digital_media: "Mídia digital",
  audiovisual: "Inserções audiovisuais",
  institutional: "Apoio institucional",
  custom: "Personalizada",
};

export const DIMENSION_LABEL: Record<string, string> = {
  age: "Faixa etária",
  gender: "Gênero",
  region: "Região",
  socioeconomic: "Perfil socioeconômico",
  interests: "Interesses",
  consumption: "Comportamento de consumo",
  professional: "Perfil profissional",
  other: "Outro",
};

export const CHART_LABEL: Record<ChartType, string> = {
  bar: "Barras",
  donut: "Rosca",
  stat: "Indicadores",
  map: "Mapa por UF",
};

export const RESULT_CATEGORY_LABEL: Record<string, string> = {
  media: "Mídia",
  organic: "Alcance orgânico",
  paid: "Alcance pago",
  impressions: "Impressões",
  engagement: "Engajamento",
  attendance: "Público presencial",
  activation: "Ativações",
  other: "Outros",
};

export const MEDIA_FOLDERS: { value: string; label: string }[] = [
  { value: "geral", label: "Geral" },
  { value: "hero", label: "Abertura" },
  { value: "galeria", label: "Galeria" },
  { value: "estrutura", label: "Estrutura" },
  { value: "momentos", label: "Momentos" },
  { value: "aftermovie", label: "Aftermovie" },
  { value: "ativacoes", label: "Ativações de marca" },
  { value: "marcas", label: "Marcas" },
  { value: "texturas", label: "Texturas" },
  { value: "documentos", label: "Documentos" },
];
