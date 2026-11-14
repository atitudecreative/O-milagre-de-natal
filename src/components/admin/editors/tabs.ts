export type EditorTab = { slug: string; label: string; group: string };

/** As categorias do editor de evento. */
export const EDITOR_TABS: EditorTab[] = [
  { slug: "geral", label: "Informações gerais", group: "Evento" },
  { slug: "identidade", label: "Identidade visual", group: "Evento" },
  { slug: "secoes", label: "Seções e ordem", group: "Evento" },
  { slug: "abertura", label: "Abertura (hero)", group: "Conteúdo" },
  { slug: "indicadores", label: "Indicadores", group: "Conteúdo" },
  { slug: "galeria", label: "Galeria e vídeos", group: "Conteúdo" },
  { slug: "publico", label: "Público", group: "Conteúdo" },
  { slug: "resultados", label: "Resultados", group: "Conteúdo" },
  { slug: "proxima-edicao", label: "Próxima edição", group: "Conteúdo" },
  { slug: "oportunidades", label: "Oportunidades", group: "Comercial" },
  { slug: "cotas", label: "Cotas", group: "Comercial" },
  { slug: "patrocinadores", label: "Patrocinadores", group: "Comercial" },
  { slug: "contatos", label: "Contatos e formulário", group: "Comercial" },
  { slug: "midia", label: "Biblioteca de mídia", group: "Publicação" },
  { slug: "seo", label: "SEO e compartilhamento", group: "Publicação" },
  { slug: "rastreamento", label: "Rastreamento", group: "Publicação" },
  { slug: "desempenho", label: "Acessos e conversões", group: "Publicação" },
  { slug: "publicar", label: "Revisar e publicar", group: "Publicação" },
];
