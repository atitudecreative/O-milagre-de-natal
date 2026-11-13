import { hashPassword } from '@/lib/password';
import type { Db } from './index';

/**
 * Conteúdo inicial. Todos os dados marcados como "real" vêm do mídia kit oficial 2026
 * e das peças de campanha. Indicadores sem fonte entram como "demo" e são sinalizados
 * no site até serem substituídos no painel.
 */

export const DEFAULT_SETTINGS: Record<string, string> = {
  event_name: 'O Milagre do Natal',
  event_kicker: 'Musical de Natal',
  event_edition: '2026',
  event_dates_label: '12, 13, 14 e 15 de dezembro',
  event_start_date: '2026-12-12',
  event_end_date: '2026-12-15',
  producer: 'Striker Produções',
  organizers: ['Realização | Striker Produções', 'Local | Igreja Batista Atitude', 'Campanha | Atitude Barra · Atitude Creative'].join('\n'),

  venue_name: 'Igreja Batista Atitude',
  venue_address: 'Rua Sylvio da Rocha Pollis, 751',
  venue_city: 'Barra da Tijuca · Rio de Janeiro',
  venue_map_url: 'https://www.google.com/maps/search/?api=1&query=Rua+Sylvio+da+Rocha+Pollis+751+Barra+da+Tijuca+Rio+de+Janeiro',

  hero_headline: 'Um espetáculo que encanta famílias.',
  hero_text:
    'Um presente de Natal para o Rio de Janeiro: a história do nascimento de Jesus contada com música, teatro, dança e cenografia de grande espetáculo.',
  hero_image: '/media/presepio-lua.webp',
  hero_video: '',

  about_title: 'Um presente de Natal para o Rio de Janeiro.',
  about_lead:
    'O Milagre do Natal é um musical que leva ao palco a história do nascimento de Jesus com música, teatro, dança e um presépio construído em escala de espetáculo.',
  about_story:
    'Produzido pela Striker Produções, o musical dá continuidade aos especiais de fim de ano que, em 2025, foram assistidos por mais de 100 mil pessoas. Em 2026, o espetáculo acontece em um local preparado para receber toda a família na Barra da Tijuca.',
  about_purpose:
    'Celebrar o verdadeiro sentido do Natal e oferecer às famílias uma experiência única e inesquecível — para viver junto e guardar na memória.',
  about_why:
    'No fim do ano, as famílias procuram momentos para estar juntas. O musical responde a esse desejo com uma programação acolhedora para todas as idades, conectada a valores de fé, esperança e celebração.',
  about_difference:
    'Estrutura de grande produção — telões de LED, iluminação cênica, efeitos de palco e um elenco numeroso — a serviço de uma história que atravessa gerações.',
  about_expect: [
    'A história do nascimento de Jesus em forma de musical',
    'Coral, elenco e dança em cena',
    'Cenografia de presépio, figurinos e efeitos de palco',
    'Um programa para viver em família',
  ].join('\n'),
  about_image_1: '/media/presepio-elenco.webp',
  about_image_2: '/media/familias-close.webp',

  sponsor_statement:
    'Uma oportunidade estratégica de se conectar com um público que busca inspiração e valores familiares em um momento de celebração e renovação.',
  sponsor_disclaimer:
    'Valores e contrapartidas conforme o mídia kit oficial 2026. Disponibilidade, prazos de produção dos materiais e condições comerciais são confirmados pela organização durante a negociação.',
  final_cta_title: 'Faça parte de algo maior.',
  final_cta_text:
    'Conecte sua marca a uma experiência que gera conexões, oportunidades e impacto. Seja um dos parceiros deste evento.',

  media_kit_url: '/media/midia-kit-o-milagre-do-natal.pdf',
  media_kit_cover: '/media/kv-wide.webp',
  media_kit_version: 'Edição 2026',
  media_kit_contents: [
    'Apresentação do musical e da produtora',
    'Proposta e posicionamento do evento',
    'Resultados de 2025 e expectativa de público',
    'Cotas Bronze, Prata e Ouro',
    'Contrapartidas de cada cota',
  ].join('\n'),

  contact_name: '',
  contact_email: '',
  contact_phone: '',
  whatsapp_number: '',
  whatsapp_message: 'Olá! Vi o site do musical O Milagre do Natal e tenho interesse em patrocinar. Podemos conversar?',
  instagram_url: '',
  youtube_url: '',
  facebook_url: '',
  tiktok_url: '',
  site_url: '',

  legal_name: 'Striker Produções',
  legal_document: '',
  privacy_email: '',
  footer_text: 'Musical de Natal realizado pela Striker Produções na Igreja Batista Atitude, Barra da Tijuca, Rio de Janeiro.',

  seo_title: 'O Milagre do Natal — Musical de Natal 2026 | Barra da Tijuca, RJ',
  seo_description:
    'Musical de Natal O Milagre do Natal: 12 a 15 de dezembro na Igreja Batista Atitude, Barra da Tijuca. Conheça o espetáculo e as cotas de patrocínio.',
  og_image: '/media/og.jpg',
  ga4_id: '',
  meta_pixel_id: '',
};

const SEED: Record<string, Record<string, unknown>[]> = {
  metrics: [
    { label: 'pessoas assistiram aos especiais de fim de ano em 2025', value: 100000, prefix: '+', compact: true, note: 'Fonte: mídia kit oficial 2026', status: 'real' },
    { label: 'de público esperado na edição 2026', value: 100000, prefix: '+', compact: true, note: 'Expectativa da organização', status: 'real' },
    { label: 'dias de espetáculo', value: 4, suffix: '', note: '12 a 15 de dezembro', status: 'real' },
    { label: 'de alcance digital da campanha', value: null, note: 'Preencher com dados das redes oficiais', status: 'demo' },
    { label: 'seguidores nos canais oficiais', value: null, note: 'Preencher com dados das redes oficiais', status: 'demo' },
  ],
  experiences: [
    {
      kicker: 'Cenografia',
      title: 'O presépio em escala de espetáculo',
      description: 'Estábulo, animais, pastores e reis magos compõem um cenário construído para que o público entre na noite de Belém.',
      image: '/media/presepio-elenco.webp',
    },
    {
      kicker: 'Música',
      title: 'Coral e canções de Natal',
      description: 'Vozes em conjunto conduzem a narrativa e transformam cada cena em celebração.',
      image: '/media/coral.webp',
    },
    {
      kicker: 'Elenco',
      title: 'Teatro, dança e figurino',
      description: 'Um elenco numeroso em cena, com coreografias e figurinos que dão vida à história.',
      image: '/media/elenco-close.webp',
    },
    {
      kicker: 'Palco',
      title: 'Luz, telões de LED e efeitos',
      description: 'Iluminação cênica, telões de LED e efeitos especiais ampliam a emoção de cada momento.',
      image: '/media/palco-faiscas.webp',
    },
    {
      kicker: 'Família',
      title: 'Uma experiência para viver junto',
      description: 'Pais, filhos e avós compartilham a mesma plateia — um programa de Natal para todas as idades.',
      image: '/media/familias-close.webp',
    },
  ],
  sessions: ['2026-12-12', '2026-12-13', '2026-12-14', '2026-12-15'].map((date) => ({
    date,
    time: 'Horário a confirmar',
    title: 'O Milagre do Natal',
    description: 'Apresentação do musical na Igreja Batista Atitude.',
    status: 'Informações em breve',
    cta_url: '',
  })),
  people: [],
  gallery: [
    { media: '/media/outdoor.webp', caption: 'A campanha nas ruas do Rio', category: 'Campanha', size: 'hero' },
    { media: '/media/familias.webp', caption: 'Famílias na plateia', category: 'Público', size: 'wide' },
    { media: '/media/presepio-lua.webp', caption: 'O presépio sob a lua', category: 'Em cena', size: 'tall' },
    { media: '/media/palco-telas.webp', caption: 'Palco, telões e iluminação cênica', category: 'Estrutura', size: 'wide' },
    { media: '/media/elenco-palco.webp', caption: 'Elenco em cena', category: 'Em cena', size: 'wide' },
    { media: '/media/poster.webp', caption: 'Pôster oficial 2026', category: 'Campanha', size: 'tall' },
    { media: '/media/coral.webp', caption: 'Coral no palco', category: 'Em cena', size: 'square' },
    { media: '/media/luzes.webp', caption: 'Desenho de luz', category: 'Estrutura', size: 'square' },
    { media: '/media/palco-faiscas.webp', caption: 'Efeitos de palco', category: 'Estrutura', size: 'wide' },
  ],
  reasons: [
    { title: 'Exposição e reconhecimento de marca', description: 'Sua marca nos materiais oficiais, nos telões e nas comunicações do musical, conforme a cota contratada.', moment: 'Antes · Durante · Depois' },
    { title: 'Contato direto com o público', description: 'Ações de divulgação e stand no local permitem encontrar as famílias pessoalmente, durante o evento.', moment: 'Durante' },
    { title: 'Associação a valores', description: 'Família, fé, esperança e celebração: atributos que a marca passa a compartilhar ao lado do espetáculo.', moment: '' },
    { title: 'Posicionamento institucional', description: 'Assinar um presente de Natal para a cidade comunica compromisso com a comunidade e com a cultura.', moment: '' },
    { title: 'Ativação de marca', description: 'Sorteios, citações em cena e ações durante as sessões, de acordo com as contrapartidas de cada cota.', moment: 'Durante' },
    { title: 'Relacionamento e networking', description: 'Área VIP e sala com coffee break para receber clientes, parceiros e equipes em um ambiente especial.', moment: 'Durante' },
    { title: 'Divulgação nos canais digitais', description: 'Presença da marca nas comunicações digitais e conteúdos da campanha.', moment: 'Antes · Durante · Depois' },
    { title: 'Potenciais clientes', description: 'Um público familiar e local, reunido em um momento de alta disposição emocional, para conhecer a sua marca.', moment: '' },
    { title: 'Conteúdo que continua depois', description: 'Na cota Ouro, gravação de conteúdo durante o musical com marca vinculada e material pós-musical.', moment: 'Depois' },
  ],
  audience: [
    { title: 'Famílias', kind: 'fact', text: 'Um espetáculo pensado para toda a família: pais, filhos e avós compartilhando a mesma experiência.', note: 'Mídia kit oficial 2026', status: 'real', data: '' },
    { title: 'Valores e afinidades', kind: 'fact', text: 'Pessoas que buscam inspiração e valores familiares em um momento de celebração e renovação.', note: 'Mídia kit oficial 2026', status: 'real', data: '' },
    { title: 'Território', kind: 'fact', text: 'Barra da Tijuca, Rio de Janeiro — o musical é apresentado como um presente de Natal para a cidade.', note: 'Mídia kit oficial 2026', status: 'real', data: '' },
    { title: 'Faixa etária', kind: 'bars', data: 'Crianças (0–12): 25\nJovens (13–24): 20\nAdultos (25–44): 35\n45 anos ou mais: 20', note: 'Valores ilustrativos — substituir por pesquisa de público ou dados de bilheteria.', status: 'demo', text: '' },
    { title: 'Origem do público', kind: 'donut', data: 'Barra e Recreio: 40\nDemais bairros da Zona Oeste: 25\nZona Sul: 15\nZona Norte: 10\nOutras cidades: 10', note: 'Valores ilustrativos — substituir por dados reais de cadastro.', status: 'demo', text: '' },
  ],
  tiers: [
    {
      name: 'Ouro',
      tagline: 'Presença exclusiva e a maior exposição do musical.',
      price: 25000,
      benefits: [
        'Marca em todos os materiais oficiais',
        'Presença no telão de LED durante as sessões, de forma exclusiva',
        'Citação da marca no musical (sorteios e demais ações)',
        'Ação de divulgação durante o evento',
        'Stand de divulgação no musical',
        'Gravação de conteúdo durante o musical com marca vinculada e pós-musical',
      ].join('\n'),
      deliverables: [
        'Área VIP para 50 convidados por sessão',
        'Sala VIP com coffee break',
        'Visita à área de backstage do elenco',
        'Valet de estacionamento para 5 carros',
      ].join('\n'),
      highlight: true,
    },
    {
      name: 'Prata',
      tagline: 'Visibilidade no palco e nas comunicações digitais.',
      price: 15000,
      benefits: [
        'Marca em matérias digitais',
        'Presença no telão de LED',
        'Citação da marca durante as sessões',
        'Ação de divulgação da marca durante o evento',
      ].join('\n'),
      deliverables: ['Área VIP para 30 convidados', 'Sala VIP com coffee break', 'Valet de estacionamento para 3 carros'].join('\n'),
      highlight: false,
    },
    {
      name: 'Bronze',
      tagline: 'A porta de entrada para fazer parte do musical.',
      price: 10000,
      benefits: ['Marca nas comunicações digitais', 'Citação da marca durante o evento'].join('\n'),
      deliverables: ['Área VIP para 20 convidados', 'Sala VIP com coffee break', 'Valet de estacionamento para 1 carro'].join('\n'),
      highlight: false,
    },
    {
      name: 'Parceiro institucional',
      tagline: 'Para instituições que desejam caminhar junto com o musical.',
      price: null,
      price_label: 'Sob consulta',
      benefits: ['Associação institucional ao evento', 'Divulgação e reconhecimento como parceiro'].join('\n'),
      deliverables: 'Benefícios específicos definidos com a organização',
      highlight: false,
    },
  ],
  partners: [],
  faqs: [
    { category: 'Evento', question: 'O que é O Milagre do Natal?', answer: 'É o musical de Natal apresentado pela Striker Produções, que conta a história do nascimento de Jesus com música, teatro, dança e cenografia — um espetáculo pensado para toda a família.' },
    { category: 'Local', question: 'Quando e onde acontece?', answer: 'Nos dias 12, 13, 14 e 15 de dezembro de 2026, na Igreja Batista Atitude — Rua Sylvio da Rocha Pollis, 751, Barra da Tijuca, Rio de Janeiro.' },
    { category: 'Programação', question: 'Quais são os horários das sessões?', answer: 'Os horários e as informações de acesso serão divulgados nos canais oficiais e atualizados nesta página assim que confirmados.' },
    { category: 'Público', question: 'Qual é o público do musical?', answer: 'Famílias. Em 2025, mais de 100 mil pessoas assistiram aos especiais de fim de ano, e a expectativa da organização para 2026 é de mais de 100 mil pessoas.' },
    { category: 'Patrocínio', question: 'Quais são as cotas de patrocínio?', answer: 'Bronze (R$ 10 mil), Prata (R$ 15 mil) e Ouro (R$ 25 mil), além da parceria institucional, sob consulta. As contrapartidas de cada cota estão detalhadas nesta página e no mídia kit.' },
    { category: 'Patrocínio', question: 'Quais contrapartidas minha marca recebe?', answer: 'Depende da cota: exposição nas comunicações digitais e materiais oficiais, presença no telão de LED, citações durante as sessões, ações de divulgação, stand, área VIP para convidados, sala VIP com coffee break e valet. Na cota Ouro, também há visita ao backstage e gravação de conteúdo com marca vinculada.' },
    { category: 'Patrocínio', question: 'É possível montar um formato diferente das cotas?', answer: 'Envie sua proposta pelo formulário ou fale com a equipe. Cada solicitação é avaliada pela organização.' },
    { category: 'Patrocínio', question: 'Até quando posso fechar o patrocínio?', answer: 'Quanto antes a parceria for fechada, maior o período de exposição nos materiais de divulgação. Os prazos de produção de cada peça são informados pela equipe comercial.' },
    { category: 'Patrocínio', question: 'Como funcionam pagamento e contrato?', answer: 'Condições de pagamento, contrato e emissão de documentos fiscais são tratados diretamente com a equipe comercial da organização.' },
    { category: 'Contato', question: 'Como falo com a equipe comercial?', answer: 'Preencha o formulário de interesse nesta página — a equipe recebe sua solicitação e retorna pelo contato informado.' },
  ],
};

export async function seedDatabase(db: Db) {
  const current = await db.getSettings();
  const isFresh = Object.keys(current).length === 0;

  // Preenche apenas chaves ausentes (nunca sobrescreve o que foi editado no painel).
  const missing = Object.fromEntries(Object.entries(DEFAULT_SETTINGS).filter(([k]) => !(k in current)));
  if (Object.keys(missing).length) await db.setSettings(missing);

  if (isFresh) {
    for (const [table, rows] of Object.entries(SEED)) {
      let sort = 10;
      for (const r of rows) {
        await db.insert(table, { visible: true, sort, ...r });
        sort += 10;
      }
    }
  }

  const version = Number((await db.getSettings()).seed_version || 1);
  if (version < 2) await upgradeV2(db);

  if ((await db.count('users')) === 0) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (email && password) {
      await db.insert('users', {
        email,
        name: process.env.ADMIN_NAME || 'Administrador',
        role: 'admin',
        active: true,
        password_hash: await hashPassword(password),
      });
      console.info(`[seed] Usuário administrador criado: ${email}`);
    } else {
      console.warn('[seed] Nenhum usuário no painel. Defina ADMIN_EMAIL e ADMIN_PASSWORD e reinicie para criar o primeiro administrador.');
    }
  }
}

/* ------------------------------------------------------------------ */
/* v2 — redesign "picadeiro de papel": histórico 2024/2025 e números   */
/* Fontes: mídia kit 2026, apresentação oficial 2025 e artes 2024–2026 */
/* ------------------------------------------------------------------ */

const V2_SETTINGS: Record<string, { old?: string; value: string }> = {
  hero_headline: { old: 'Um espetáculo que encanta famílias.', value: 'O Natal que reúne mais de 100 mil pessoas.' },
  hero_text: {
    old: 'Um presente de Natal para o Rio de Janeiro: a história do nascimento de Jesus contada com música, teatro, dança e cenografia de grande espetáculo.',
    value:
      'O Milagre do Natal leva música, teatro, dança e efeitos de palco a quatro dias de espetáculo na Barra da Tijuca. Sua marca pode estar no centro dessa história.',
  },
  marquee_items: {
    value: [
      '12 a 15 de dezembro de 2026',
      '+100 mil pessoas em 2025',
      '40 marcas na edição 2025',
      'Cotas a partir de R$ 10 mil',
      'Igreja Batista Atitude · Barra da Tijuca',
    ].join('\n'),
  },
  past_title: { value: 'Quem já colocou a marca no palco.' },
  past_text: {
    value:
      'Em 2025, O Descendente levou o musical ao Parque Olímpico da Barra com 34 patrocinadores, 6 apoiadores e apoio institucional da Prefeitura do Rio.',
  },
  past_master_image: { value: '/media/v2/master-2025.webp' },
  past_sponsors_image: { value: '/media/v2/mural-patrocinadores-2025.webp' },
  past_support_image: { value: '/media/v2/apoio-2025.webp' },
  past_institutional: { value: 'Prefeitura do Rio · Visit Rio · Melodia 97.5' },
};

const OLD_METRIC_LABELS = new Set([
  'pessoas assistiram aos especiais de fim de ano em 2025',
  'de público esperado na edição 2026',
  'dias de espetáculo',
  'de alcance digital da campanha',
  'seguidores nos canais oficiais',
]);

const V2_ROWS: Record<string, Record<string, unknown>[]> = {
  metrics: [
    { label: 'pessoas assistiram ao Musical de Natal em 2025', value: 100000, prefix: '+', compact: true, note: 'Mídia kit oficial 2026', status: 'real' },
    { label: 'de público esperado em 2026', value: 100000, prefix: '+', compact: true, note: 'Expectativa da organização', status: 'real' },
    { label: 'marcas patrocinaram e apoiaram a edição 2025', value: 40, note: '34 patrocinadores + 6 apoiadores · arte oficial 2025', status: 'real' },
    { label: 'dias de espetáculo em 2026', value: 4, note: '12 a 15 de dezembro', status: 'real' },
    { label: 'artistas convidados em 2025', value: 5, note: 'Luciano Camargo, Ton Carfi, Cristina Mel, Davi Sacer e Maria Pita', status: 'real' },
    { label: 'temporadas seguidas: 2024, 2025 e 2026', value: 3, note: 'Uma tradição de Natal no Rio', status: 'real' },
  ],
  editions: [
    { year: '2024', title: 'O Melhor Natal', dates: '14 e 15 de dezembro', venue: 'Igreja Batista Atitude', highlight: 'Acrobatas no ar, coral e elenco completo em cena.', image: '/media/v2/kv-2024.webp', color: 'turquesa' },
    { year: '2025', title: 'O Descendente', dates: '29 e 30 de novembro', venue: 'Parque Olímpico da Barra da Tijuca', highlight: 'No Parque Olímpico, com expectativa de 40 mil pessoas e 5 artistas convidados.', image: '/media/v2/kv-2025.webp', color: 'cortina' },
    { year: '2026', title: 'O Milagre do Natal', dates: '12, 13, 14 e 15 de dezembro', venue: 'Igreja Batista Atitude', highlight: 'Quatro dias de espetáculo e expectativa de mais de 100 mil pessoas.', image: '/media/kv-wide.webp', color: 'ouro' },
  ],
  people: [
    { name: 'Luciano Camargo', role: 'Participação especial', edition: '2025 · O Descendente', photo: '/media/v2/adesivos/luciano.webp' },
    { name: 'Cristina Mel', role: 'Participação especial', edition: '2025 · O Descendente', photo: '/media/v2/adesivos/cristina-mel.webp' },
    { name: 'Davi Sacer', role: 'Participação especial', edition: '2025 · O Descendente', photo: '/media/v2/adesivos/davi-sacer.webp' },
    { name: 'Ton Carfi', role: 'Participação especial', edition: '2025 · O Descendente', photo: '/media/v2/adesivos/ton-carfi.webp' },
    { name: 'Maria Pita', role: 'Participação especial', edition: '2025 · O Descendente', photo: '/media/v2/adesivos/maria-pita.webp' },
  ],
  gallery: [
    { media: '/media/v2/palco-confete.webp', caption: 'A iluminação é um espetáculo à parte', category: 'Em cena', size: 'hero' },
    { media: '/media/v2/cenario-relogio.webp', caption: 'Um cenário grandioso', category: 'Em cena', size: 'wide' },
    { media: '/media/v2/projecao.webp', caption: 'Projeções mapeadas', category: 'Estrutura', size: 'tall' },
    { media: '/media/v2/figurino.webp', caption: 'Figurinos pensados nos detalhes', category: 'Bastidores', size: 'wide' },
    { media: '/media/v2/parque-olimpico-wide.webp', caption: 'Parque Olímpico da Barra, 2025', category: 'Público', size: 'wide' },
    { media: '/media/v2/kv-2025-convidados.webp', caption: 'Campanha O Descendente, 2025', category: 'Campanha', size: 'wide' },
    { media: '/media/v2/combo-2024.webp', caption: 'Combo oficial de pipoca, 2024', category: 'Campanha', size: 'tall' },
  ],
};

async function upgradeV2(db: Db) {
  const s = await db.getSettings();
  const patch: Record<string, string> = {};
  for (const [k, { old, value }] of Object.entries(V2_SETTINGS)) {
    if (!(k in s) || !s[k] || (old !== undefined && s[k] === old)) patch[k] = value;
  }
  patch.seed_version = '2';

  for (const m of await db.list('metrics')) if (OLD_METRIC_LABELS.has(String(m.label))) await db.update('metrics', m.id, { visible: false });
  for (const g of await db.list('gallery'))
    if (['/media/luzes.webp', '/media/coral.webp', '/media/palco-faiscas.webp', '/media/palco-telas.webp', '/media/elenco-palco.webp'].includes(String(g.media))) await db.update('gallery', g.id, { visible: false });

  for (const [table, rows] of Object.entries(V2_ROWS)) {
    const existing = await db.list(table);
    let sort = table === 'gallery' ? 5 : (Math.max(0, ...existing.map((r) => Number(r.sort) || 0)) || 0) + 10;
    if (table === 'metrics' || table === 'editions' || table === 'people') sort = (Math.max(0, ...existing.map((r) => Number(r.sort) || 0)) || 0) + 10;
    for (const r of rows) {
      await db.insert(table, { visible: true, sort, ...r });
      sort += table === 'gallery' ? 0.5 : 10;
    }
  }
  await db.setSettings(patch);
  console.info('[seed] Conteúdo atualizado para a versão 2 (histórico 2024–2026).');
}
