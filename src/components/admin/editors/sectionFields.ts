import type { SettingField } from "./SectionForm";

export const HERO_FIELDS: SettingField[] = [
  { name: "image_desktop", label: "Imagem desktop", type: "image", folder: "hero", hint: "Horizontal, mín. 2400 px de largura." },
  { name: "image_mobile", label: "Imagem mobile", type: "image", folder: "hero", hint: "Vertical (9:16). Vazio = usa a imagem desktop." },
  { name: "video_url", label: "Vídeo de fundo (MP4)", type: "video", folder: "hero", hint: "Arquivo .mp4 curto, sem áudio, até 15 MB. Não carrega em conexões lentas.", span: 2 },
  { name: "align", label: "Alinhamento do texto", type: "select", options: [{ value: "left", label: "Esquerda" }, { value: "center", label: "Centro" }, { value: "right", label: "Direita" }] },
  { name: "vertical", label: "Posição vertical", type: "select", options: [{ value: "bottom", label: "Inferior" }, { value: "center", label: "Centro" }, { value: "top", label: "Superior" }] },
  { name: "height", label: "Altura da seção", type: "select", options: [{ value: "screen", label: "Tela cheia" }, { value: "tall", label: "Alta (88%)" }, { value: "medium", label: "Média (70%)" }] },
  { name: "title_size", label: "Tamanho do título", type: "select", options: [{ value: "xl", label: "Monumental" }, { value: "lg", label: "Grande" }, { value: "md", label: "Médio" }] },
  { name: "overlay", label: "Escurecimento da imagem", type: "range", min: 0, max: 0.9, step: 0.05 },
  { name: "text_color", label: "Cor do texto (opcional)", type: "text", hint: "#RRGGBB. Vazio = cor de texto do evento." },
  { name: "primary_label", label: "Texto do botão principal", type: "text", hint: "Padrão: QUERO SER PATROCINADOR" },
  { name: "secondary_label", label: "Texto do botão secundário", type: "text", hint: "Padrão: CONHEÇA O PROJETO" },
  { name: "show_logo", label: "Exibir logotipo acima do título", type: "toggle" },
  { name: "show_scroll_hint", label: "Indicador “role para explorar”", type: "toggle" },
];

export const GRANDEUR_FIELDS: SettingField[] = [
  { name: "statement", label: "Frase de impacto", type: "textarea", hint: "Exibida em destaque entre as fotos.", span: 2 },
  { name: "aftermovie_url", label: "Aftermovie (YouTube, Vimeo ou MP4)", type: "text", span: 2 },
  { name: "aftermovie_title", label: "Título do vídeo", type: "text" },
  { name: "aftermovie_poster", label: "Capa do vídeo", type: "image", folder: "aftermovie" },
];

export const AUDIENCE_FIELDS: SettingField[] = [{ name: "statement", label: "Frase sobre o público", type: "textarea", span: 2 }];

export const RESULTS_FIELDS: SettingField[] = [
  { name: "edition_label", label: "Rótulo da última edição", type: "text", hint: "Ex.: 4ª edição · 2026" },
  { name: "previous_edition_label", label: "Rótulo da edição anterior", type: "text", hint: "Ex.: 3ª edição · 2025" },
  { name: "show_comparison", label: "Mostrar comparativo entre edições", type: "toggle", span: 2 },
];

export const METRICS_FIELDS: SettingField[] = [
  { name: "show_projections", label: "Mostrar projeções também nesta seção", type: "toggle", hint: "Exibidas em bloco separado e identificado.", span: 2 },
];

export const TIERS_FIELDS: SettingField[] = [{ name: "note", label: "Nota de rodapé das cotas", type: "textarea", span: 2, hint: "Ex.: valores sujeitos a alteração; condições definidas em proposta." }];
export const SPONSORS_FIELDS: SettingField[] = [{ name: "show_marquee", label: "Faixa animada de logos", type: "toggle", hint: "Aparece com 6 marcas ou mais.", span: 2 }];
export const NEXT_FIELDS: SettingField[] = [
  { name: "date_label", label: "Data da próxima edição", type: "text" },
  { name: "items", label: "Novidades, melhorias e novas experiências", type: "items" },
];
export const CTA_FIELDS: SettingField[] = [
  { name: "button_label", label: "Texto do botão do formulário", type: "text", hint: "Padrão: QUERO CONECTAR MINHA MARCA AO EVENTO" },
  { name: "background_image", label: "Imagem de fundo", type: "image" },
];
export const FOOTER_FIELDS: SettingField[] = [{ name: "copyright", label: "Texto de direitos autorais", type: "text", hint: "Vazio = © ano + organizador", span: 2 }];
