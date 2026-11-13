/**
 * Registro único do modelo de dados.
 * Daqui saem: as tabelas (SQLite e Postgres), a validação e os formulários do painel.
 * Para adicionar um campo editável, basta incluí-lo aqui — a coluna é criada
 * automaticamente na próxima inicialização.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'image'
  | 'media'
  | 'url'
  | 'select'
  | 'lines'
  | 'pairs'
  | 'date';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Exibir na listagem do painel */
  list?: boolean;
}

export interface Collection {
  key: string;
  label: string;
  singular: string;
  description: string;
  section: string;
  fields: Field[];
}

export type Role = 'admin' | 'editor' | 'comercial';

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  editor: 'Editor de conteúdo',
  comercial: 'Comercial',
};

const STATUS_OPTIONS = [
  { value: 'real', label: 'Dado real (confirmado)' },
  { value: 'demo', label: 'Demonstrativo — aguardando dado real' },
];

export const COLLECTIONS: Collection[] = [
  {
    key: 'metrics',
    label: 'Números e dimensão',
    singular: 'indicador',
    section: '02 · Números',
    description:
      'Indicadores exibidos com contador animado. Marque como "Demonstrativo" tudo o que ainda não foi confirmado — o site sinaliza isso ao visitante.',
    fields: [
      { name: 'label', label: 'Rótulo', type: 'text', required: true, list: true },
      { name: 'value', label: 'Valor numérico', type: 'number', help: 'Deixe vazio para exibir "Em breve".', list: true },
      { name: 'prefix', label: 'Prefixo', type: 'text', placeholder: '+' },
      { name: 'suffix', label: 'Sufixo', type: 'text', placeholder: 'mil, %, dias…' },
      { name: 'compact', label: 'Abreviar milhares (100000 → 100 mil)', type: 'boolean' },
      { name: 'note', label: 'Nota / fonte do dado', type: 'text', placeholder: 'Ex.: Mídia kit 2026' },
      { name: 'status', label: 'Status do dado', type: 'select', options: STATUS_OPTIONS, required: true, list: true },
    ],
  },
  {
    key: 'experiences',
    label: 'Experiências',
    singular: 'experiência',
    section: '03 · Experiência',
    description: 'Blocos visuais que apresentam o que o público vive no espetáculo.',
    fields: [
      { name: 'kicker', label: 'Chamada curta', type: 'text', list: true },
      { name: 'title', label: 'Título', type: 'text', required: true, list: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'image', label: 'Imagem', type: 'image' },
    ],
  },
  {
    key: 'sessions',
    label: 'Programação',
    singular: 'sessão',
    section: '03 · Programação',
    description: 'Datas e sessões do musical. Horários podem ficar como "a confirmar".',
    fields: [
      { name: 'date', label: 'Data', type: 'date', required: true, list: true },
      { name: 'time', label: 'Horário', type: 'text', placeholder: '20h ou "A confirmar"', list: true },
      { name: 'title', label: 'Título da sessão', type: 'text', required: true, list: true },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'status', label: 'Selo', type: 'text', placeholder: 'Ingressos em breve, Esgotado…' },
      { name: 'cta_url', label: 'Link (ingressos/inscrição)', type: 'url' },
    ],
  },
  {
    key: 'people',
    label: 'Elenco e convidados',
    singular: 'pessoa',
    section: '03 · Elenco',
    description: 'Elenco, convidados e participações especiais. A grade só aparece no site quando houver itens visíveis.',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, list: true },
      { name: 'role', label: 'Papel / função', type: 'text', list: true },
      { name: 'bio', label: 'Mini bio', type: 'textarea' },
      { name: 'photo', label: 'Foto', type: 'image' },
      { name: 'link', label: 'Link (Instagram, site)', type: 'url' },
    ],
  },
  {
    key: 'gallery',
    label: 'Galeria',
    singular: 'mídia',
    section: '04 · Galeria',
    description: 'Fotos e vídeos de edições anteriores, bastidores, público e estrutura.',
    fields: [
      { name: 'media', label: 'Imagem', type: 'image', required: true },
      { name: 'video_url', label: 'Vídeo (MP4 ou link YouTube/Vimeo, opcional)', type: 'media', help: 'Se preenchido, a imagem vira a capa do vídeo.' },
      { name: 'caption', label: 'Legenda', type: 'text', required: true, list: true },
      {
        name: 'category',
        label: 'Categoria',
        type: 'select',
        list: true,
        options: [
          { value: 'Em cena', label: 'Em cena' },
          { value: 'Público', label: 'Público' },
          { value: 'Estrutura', label: 'Estrutura' },
          { value: 'Bastidores', label: 'Bastidores' },
          { value: 'Campanha', label: 'Campanha' },
        ],
      },
      {
        name: 'size',
        label: 'Formato no mosaico',
        type: 'select',
        options: [
          { value: 'wide', label: 'Panorâmico (largo)' },
          { value: 'tall', label: 'Vertical (alto)' },
          { value: 'square', label: 'Padrão' },
          { value: 'hero', label: 'Destaque (grande)' },
        ],
      },
    ],
  },
  {
    key: 'reasons',
    label: 'Por que patrocinar',
    singular: 'argumento',
    section: '05 · Patrocínio',
    description: 'Argumentos comerciais. Evite promessas de resultado que não possam ser comprovadas.',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, list: true },
      { name: 'description', label: 'Texto', type: 'textarea', required: true },
      {
        name: 'moment',
        label: 'Momento da visibilidade',
        type: 'select',
        list: true,
        options: [
          { value: '', label: '—' },
          { value: 'Antes', label: 'Antes do evento' },
          { value: 'Durante', label: 'Durante o evento' },
          { value: 'Depois', label: 'Depois do evento' },
          { value: 'Antes · Durante · Depois', label: 'Antes, durante e depois' },
        ],
      },
    ],
  },
  {
    key: 'audience',
    label: 'Perfil do público',
    singular: 'indicador de público',
    section: '06 · Público',
    description:
      'Infográficos do público. Tipo "Atributo" exibe texto; "Barras" e "Rosca" usam a lista Rótulo: valor (em %). Marque como Demonstrativo até ter pesquisa real.',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, list: true },
      {
        name: 'kind',
        label: 'Tipo de visualização',
        type: 'select',
        required: true,
        list: true,
        options: [
          { value: 'fact', label: 'Atributo (texto)' },
          { value: 'bars', label: 'Barras (%)' },
          { value: 'donut', label: 'Rosca (%)' },
        ],
      },
      { name: 'text', label: 'Texto do atributo', type: 'textarea' },
      { name: 'data', label: 'Dados (um por linha — Rótulo: valor)', type: 'pairs', placeholder: '18–24: 20' },
      { name: 'note', label: 'Fonte / observação', type: 'text' },
      { name: 'status', label: 'Status do dado', type: 'select', options: STATUS_OPTIONS, required: true, list: true },
    ],
  },
  {
    key: 'tiers',
    label: 'Cotas de patrocínio',
    singular: 'cota',
    section: '07 · Cotas',
    description: 'Cotas comerciais. Deixe o valor vazio para exibir "Sob consulta".',
    fields: [
      { name: 'name', label: 'Nome da cota', type: 'text', required: true, list: true },
      { name: 'tagline', label: 'Frase de posicionamento', type: 'text' },
      { name: 'price', label: 'Investimento (R$)', type: 'number', help: 'Somente números. Vazio = "Sob consulta".', list: true },
      { name: 'price_label', label: 'Texto alternativo do valor', type: 'text', placeholder: 'Sob consulta' },
      { name: 'benefits', label: 'Exposição de marca (um por linha)', type: 'lines' },
      { name: 'deliverables', label: 'Entregas e hospitalidade (um por linha)', type: 'lines' },
      { name: 'slots', label: 'Vagas disponíveis', type: 'number', help: 'Vazio = não exibir.' },
      { name: 'highlight', label: 'Destacar esta cota', type: 'boolean' },
    ],
  },
  {
    key: 'partners',
    label: 'Marcas parceiras',
    singular: 'marca',
    section: '08 · Parceiros',
    description: 'Patrocinadores e parceiros confirmados. Use logos em PNG transparente ou SVG.',
    fields: [
      { name: 'name', label: 'Nome da marca', type: 'text', required: true, list: true },
      { name: 'logo', label: 'Logo', type: 'image' },
      { name: 'url', label: 'Site da marca', type: 'url' },
      { name: 'category', label: 'Categoria da parceria', type: 'text', placeholder: 'Ouro, Prata, Apoio…', list: true },
    ],
  },
  {
    key: 'faqs',
    label: 'Perguntas frequentes',
    singular: 'pergunta',
    section: '11 · FAQ',
    description: 'Perguntas e respostas sobre evento, público e patrocínio.',
    fields: [
      { name: 'question', label: 'Pergunta', type: 'text', required: true, list: true },
      { name: 'answer', label: 'Resposta', type: 'textarea', required: true },
      {
        name: 'category',
        label: 'Tema',
        type: 'select',
        list: true,
        options: ['Evento', 'Público', 'Local', 'Programação', 'Patrocínio', 'Contato'].map((v) => ({ value: v, label: v })),
      },
    ],
  },
];

export function getCollection(key: string) {
  return COLLECTIONS.find((c) => c.key === key);
}

/* ------------------------------------------------------------------ */
/* Configurações gerais (chave/valor)                                  */
/* ------------------------------------------------------------------ */

export interface SettingsGroup {
  key: string;
  label: string;
  description?: string;
  fields: Field[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    key: 'evento',
    label: 'Evento',
    fields: [
      { name: 'event_name', label: 'Nome do evento', type: 'text', required: true },
      { name: 'event_kicker', label: 'Categoria (sobre o título)', type: 'text' },
      { name: 'event_edition', label: 'Edição / ano', type: 'text' },
      { name: 'event_dates_label', label: 'Datas (texto exibido)', type: 'text' },
      { name: 'event_start_date', label: 'Data inicial', type: 'date' },
      { name: 'event_end_date', label: 'Data final', type: 'date' },
      { name: 'producer', label: 'Realização / produtora', type: 'text' },
      { name: 'organizers', label: 'Créditos de realização (Papel | Nome, um por linha)', type: 'lines' },
    ],
  },
  {
    key: 'local',
    label: 'Local',
    fields: [
      { name: 'venue_name', label: 'Nome do local', type: 'text' },
      { name: 'venue_address', label: 'Endereço', type: 'text' },
      { name: 'venue_city', label: 'Bairro · Cidade', type: 'text' },
      { name: 'venue_map_url', label: 'Link do mapa', type: 'url' },
    ],
  },
  {
    key: 'hero',
    label: 'Abertura (hero)',
    fields: [
      { name: 'hero_headline', label: 'Frase de impacto', type: 'text' },
      { name: 'hero_text', label: 'Descrição breve', type: 'textarea' },
      { name: 'hero_image', label: 'Imagem principal (janela em arco)', type: 'image' },
      { name: 'hero_video', label: 'Vídeo de fundo (MP4, opcional)', type: 'media', help: 'Se preenchido, substitui a imagem principal.' },
    ],
  },
  {
    key: 'sobre',
    label: 'Sobre o evento',
    fields: [
      { name: 'about_title', label: 'Título', type: 'text' },
      { name: 'about_lead', label: 'Texto de abertura', type: 'textarea' },
      { name: 'about_story', label: 'História e conceito', type: 'textarea' },
      { name: 'about_purpose', label: 'Propósito', type: 'textarea' },
      { name: 'about_why', label: 'Por que existe / que necessidade atende', type: 'textarea' },
      { name: 'about_difference', label: 'O que o torna diferente', type: 'textarea' },
      { name: 'about_expect', label: 'O que o público encontra (um por linha)', type: 'lines' },
      { name: 'about_image_1', label: 'Imagem 1', type: 'image' },
      { name: 'about_image_2', label: 'Imagem 2', type: 'image' },
    ],
  },
  {
    key: 'patrocinio',
    label: 'Textos comerciais',
    fields: [
      { name: 'sponsor_statement', label: 'Frase-manifesto (Por que patrocinar)', type: 'textarea' },
      { name: 'sponsor_disclaimer', label: 'Nota de transparência das cotas', type: 'textarea' },
      { name: 'final_cta_title', label: 'Chamada final', type: 'text' },
      { name: 'final_cta_text', label: 'Texto de apoio final', type: 'textarea' },
    ],
  },
  {
    key: 'midiakit',
    label: 'Mídia kit',
    fields: [
      { name: 'media_kit_url', label: 'Arquivo PDF do mídia kit', type: 'media', help: 'Envie um novo PDF para substituir o atual.' },
      { name: 'media_kit_cover', label: 'Capa (imagem)', type: 'image' },
      { name: 'media_kit_version', label: 'Versão / data de atualização', type: 'text' },
      { name: 'media_kit_contents', label: 'Conteúdo do material (um por linha)', type: 'lines' },
    ],
  },
  {
    key: 'contato',
    label: 'Contato e redes',
    fields: [
      { name: 'contact_name', label: 'Responsável comercial', type: 'text' },
      { name: 'contact_email', label: 'E-mail comercial', type: 'text' },
      { name: 'contact_phone', label: 'Telefone (exibição)', type: 'text' },
      { name: 'whatsapp_number', label: 'WhatsApp (somente números com DDI, ex.: 5521999999999)', type: 'text', help: 'Enquanto vazio, os botões de WhatsApp levam ao formulário.' },
      { name: 'whatsapp_message', label: 'Mensagem pré-configurada do WhatsApp', type: 'textarea' },
      { name: 'instagram_url', label: 'Instagram', type: 'url' },
      { name: 'youtube_url', label: 'YouTube', type: 'url' },
      { name: 'facebook_url', label: 'Facebook', type: 'url' },
      { name: 'tiktok_url', label: 'TikTok', type: 'url' },
      { name: 'site_url', label: 'Site institucional', type: 'url' },
    ],
  },
  {
    key: 'institucional',
    label: 'Institucional e LGPD',
    fields: [
      { name: 'legal_name', label: 'Razão social / controlador dos dados', type: 'text' },
      { name: 'legal_document', label: 'CNPJ', type: 'text' },
      { name: 'privacy_email', label: 'E-mail do encarregado (LGPD)', type: 'text' },
      { name: 'footer_text', label: 'Texto institucional do rodapé', type: 'textarea' },
    ],
  },
  {
    key: 'seo',
    label: 'SEO e rastreamento',
    fields: [
      { name: 'seo_title', label: 'Título para buscadores', type: 'text' },
      { name: 'seo_description', label: 'Descrição para buscadores', type: 'textarea' },
      { name: 'og_image', label: 'Imagem de compartilhamento (1200×630)', type: 'image' },
      { name: 'ga4_id', label: 'Google Analytics 4 — ID de métricas', type: 'text', placeholder: 'G-XXXXXXXXXX' },
      { name: 'meta_pixel_id', label: 'Meta Pixel — ID', type: 'text', placeholder: '000000000000000' },
    ],
  },
];

export const SETTINGS_FIELDS = SETTINGS_GROUPS.flatMap((g) => g.fields);

/* ------------------------------------------------------------------ */
/* Tabelas                                                             */
/* ------------------------------------------------------------------ */

export type ColumnType = 'text' | 'number' | 'boolean' | 'timestamp';

export function fieldColumnType(t: FieldType): ColumnType {
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  return 'text';
}

const CONTENT_SYSTEM: Record<string, ColumnType> = {
  sort: 'number',
  visible: 'boolean',
  created_at: 'timestamp',
  updated_at: 'timestamp',
};

export const LEAD_STATUSES = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em contato' },
  { value: 'proposta', label: 'Proposta enviada' },
  { value: 'negociacao', label: 'Em negociação' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Sem interesse' },
];

export const SEGMENTS = [
  'Varejo e shopping',
  'Alimentação e bebidas',
  'Educação',
  'Saúde e bem-estar',
  'Imobiliário e construção',
  'Serviços financeiros',
  'Tecnologia e telecom',
  'Automotivo',
  'Comunicação e mídia',
  'Turismo e hotelaria',
  'Indústria',
  'Poder público / instituição',
  'Outro',
];

export const TABLES: Record<string, Record<string, ColumnType>> = {
  ...Object.fromEntries(
    COLLECTIONS.map((c) => [
      c.key,
      { ...Object.fromEntries(c.fields.map((f) => [f.name, fieldColumnType(f.type)])), ...CONTENT_SYSTEM },
    ]),
  ),
  leads: {
    kind: 'text',
    name: 'text',
    company: 'text',
    email: 'text',
    phone: 'text',
    segment: 'text',
    tier: 'text',
    message: 'text',
    consent: 'boolean',
    consent_text: 'text',
    status: 'text',
    notes: 'text',
    source: 'text',
    utm_source: 'text',
    utm_medium: 'text',
    utm_campaign: 'text',
    referrer: 'text',
    page: 'text',
    user_agent: 'text',
    ip_hash: 'text',
    webhook_status: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp',
  },
  users: {
    email: 'text',
    name: 'text',
    role: 'text',
    password_hash: 'text',
    active: 'boolean',
    last_login_at: 'timestamp',
    created_at: 'timestamp',
    updated_at: 'timestamp',
  },
  events: {
    type: 'text',
    label: 'text',
    page: 'text',
    created_at: 'timestamp',
  },
};

export type Row = Record<string, unknown> & { id: string };
