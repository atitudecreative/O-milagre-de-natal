/**
 * ============================================================================
 *  CONTEÚDO DA LANDING PAGE
 *  Edite este arquivo para trocar textos, números, cotas, fotos e cores.
 *  Tudo o que aparece na página (e no PDF) vem daqui.
 *
 *  O conteúdo atual é um evento FICTÍCIO de demonstração ("Solarmar Festival").
 *  Ao colocar o evento real, troque `is_demo` para false e substitua os números
 *  por dados reais, sempre com fonte e período.
 * ============================================================================
 */
import { audience, branding, bundle, event, media, metrics, opportunities, results, sections, sponsors, testimonials, tiers } from "./build";

/** Fotos: use imagens em /public (ex.: "/fotos/palco.jpg") ou links do Unsplash. */
const u = (id: string, extra = "") => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2400&q=80${extra}`;
const DEMO = "Dados de demonstração (fictícios)";

export const EVENTO = bundle({
  // --------------------------------------------------------------------------
  // Informações gerais, contato e SEO
  // --------------------------------------------------------------------------
  event: event({
    slug: "solarmar-festival",
    name: "Solarmar Festival",
    is_demo: true, // mostra a faixa "evento demonstrativo". Use false no evento real.
    tagline: "Música, cultura e mar",
    short_description:
      "Três dias de música, gastronomia e cultura à beira-mar. Uma cidade inteira em festa — e um palco para marcas que querem ser lembradas.",
    description:
      "O Solarmar é um festival fictício criado para demonstrar a landing page. Reúne palcos de música, arena gastronômica, espaço de arte urbana e uma programação de conteúdo durante três dias.",
    edition_number: 5,
    starts_on: "2027-09-10",
    ends_on: "2027-09-12",
    venue: "Parque da Orla (fictício)",
    city: "Recife",
    state: "PE",
    organizer_name: "Atlântica Produções (fictícia)",
    organizer_document: "CNPJ 00.000.000/0001-00 (exemplo)",
    organizer_about: "Produtora fictícia de experiências ao vivo, usada para demonstração.",
    contact_name: "Equipe Comercial",
    contact_email: "comercial@exemplo.com",
    contact_phone: "+55 81 0000-0000",
    // WhatsApp que recebe os interessados (DDI + DDD + número, só dígitos).
    whatsapp: "5581900000000",
    privacy_contact_email: "privacidade@exemplo.com",
    social_links: [
      { network: "Instagram", url: "https://instagram.com/" },
      { network: "YouTube", url: "https://youtube.com/" },
      { network: "LinkedIn", url: "https://linkedin.com/" },
    ],
    footer_links: [{ label: "Imprensa", url: "mailto:imprensa@exemplo.com" }],
    form_success_message: "Abrimos o WhatsApp com sua mensagem pronta. É só enviar — nosso time comercial responde em até 2 dias úteis.",
    seo_title: "Solarmar Festival 2027 — Patrocínio",
    seo_description: "Números, público, cotas e oportunidades de patrocínio do Solarmar Festival (evento demonstrativo).",
  }),

  // --------------------------------------------------------------------------
  // Identidade visual
  // --------------------------------------------------------------------------
  branding: branding({
    color_background: "#0D0B10",
    color_text: "#F5EFE6",
    color_accent: "#FF5B2E",
    color_primary: "#F5C542",
    color_secondary: "#1E1530",
    // Opções em src/lib/fonts.ts (Anton, Bebas Neue, Unbounded, Fraunces, Inter, Space Grotesk…)
    font_heading: "Anton",
    font_body: "Space Grotesk",
    heading_case: "upper",
    corner_style: "square", // "square" | "soft" | "round"
    grain: true,
    logo_url: "/demo/solarmar-logo.svg",
  }),

  // --------------------------------------------------------------------------
  // Seções (na ordem da página). Use `enabled: false` para esconder uma seção.
  // --------------------------------------------------------------------------
  sections: sections([
    ["hero", {
      title: "Solarmar Festival",
      settings: {
        align: "left", vertical: "bottom", height: "screen", overlay: 0.35, title_size: "xl",
        image_desktop: u("1470229722913-7c0e2dbbafd3"),
        image_mobile: u("1506157786151-b8491531f063", "&h=2000"),
        video_url: null, // opcional: MP4 curto e sem som
        primary_label: "Quero ser patrocinador",
        secondary_label: "Conheça o projeto",
        show_scroll_hint: true,
      },
    }],
    ["metrics", {
      eyebrow: "O evento em números",
      title: "Uma audiência que se mede em maré cheia.",
      body: "Cada número traz fonte e período de apuração. Projeções ficam separadas, na seção da próxima edição.",
    }],
    ["grandeur", {
      eyebrow: "A grandiosidade",
      title: "Três dias em que a cidade inteira vira palco.",
      body: "Palcos, arena gastronômica, galeria de arte urbana e uma orla tomada por gente. Uma experiência desenhada para ser vivida — e compartilhada.",
      settings: {
        statement: "Quando o sol se põe sobre o mar, 60 mil pessoas olham na mesma direção. É ali que sua marca aparece.",
        aftermovie_url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        aftermovie_poster: u("1514525253161-7a46d19cd819"),
        aftermovie_title: "O filme da 4ª edição",
      },
    }],
    ["audience", {
      eyebrow: "Nosso público",
      title: "Jovem, conectado e com poder de decisão.",
      body: "Perfil traçado a partir de pesquisa com o público (dados de demonstração).",
      settings: { statement: "Um público que chega cedo, fica até o fim e transforma cada ativação em conteúdo." },
    }],
    ["results", {
      eyebrow: "Resultados da última edição",
      title: "O que a 4ª edição entregou.",
      body: "Comparativo entre a 4ª e a 3ª edição. Valores fictícios, apenas para demonstração.",
      settings: { edition_label: "4ª edição · 2026", previous_edition_label: "3ª edição · 2025", show_comparison: true },
    }],
    ["opportunities", {
      eyebrow: "Oportunidades para marcas",
      title: "Formas de estar no centro da experiência.",
      body: "Do naming rights a ativações sob medida: cada formato combina visibilidade, experiência e conteúdo.",
    }],
    ["tiers", {
      eyebrow: "Cotas de patrocínio",
      title: "Escolha o tamanho da sua presença.",
      body: "Cotas com quantidade limitada. Os valores podem ser exibidos ou tratados sob consulta.",
      settings: { note: "Valores e contrapartidas meramente ilustrativos. Condições finais definidas em proposta comercial." },
    }],
    ["sponsors", {
      eyebrow: "Quem já acredita no projeto",
      title: "Marcas que já subiram ao palco com a gente.",
      body: "Todas as marcas abaixo são fictícias e existem apenas para demonstração.",
      settings: { show_marquee: true },
    }],
    ["next_edition", {
      eyebrow: "A próxima edição",
      title: "2027: maior, mais longo, mais mar.",
      body: "A 5ª edição amplia a área, ganha um terceiro palco e estreia o Solarmar Talks, com conteúdo sobre economia criativa.",
      settings: {
        date_label: "10 a 12 de setembro de 2027",
        items: [
          { title: "Terceiro palco à beira-mar", description: "Um palco flutuante dedicado a shows ao pôr do sol, com capacidade para 8 mil pessoas.", image_url: u("1563841930606-67e2bce48b78") },
          { title: "Solarmar Talks", description: "Dois dias de conteúdo sobre economia criativa, música e inovação — com espaço para marcas apresentarem cases.", image_url: u("1505373877841-8d25f7d46678") },
          { title: "Arena gastronômica ampliada", description: "30 operações de chefs regionais e um lounge corporativo para relacionamento com clientes.", image_url: u("1511795409834-ef04bbd61622") },
        ],
      },
    }],
    ["cta", {
      eyebrow: "Patrocine o Solarmar",
      title: "Sua marca precisa estar onde as grandes experiências acontecem.",
      body: "Converse com nosso time comercial e desenhe uma presença sob medida: visibilidade, experiência para o público e conteúdo que continua circulando depois do festival.",
      settings: { button_label: "Quero conectar minha marca ao evento", background_image: u("1429962714451-bb934ecdc4ec") },
    }],
    ["footer", {}],
  ]),

  // --------------------------------------------------------------------------
  // O evento em números (kind "actual") e projeções da próxima edição ("projection")
  // --------------------------------------------------------------------------
  metrics: metrics([
    { label: "Público presencial", value: 62000, unit: "pessoas", description: "Somando os três dias da 4ª edição.", source: DEMO, period: "Set/2026", featured: true },
    { label: "Alcance digital", value: 18400000, unit: "contas", description: "Contas únicas alcançadas nas redes oficiais.", source: DEMO, period: "Ago–Out/2026" },
    { label: "Impressões", value: 41000000, description: "Orgânico + mídia paga.", source: DEMO, period: "Ago–Out/2026" },
    { label: "Visualizações de vídeo", value: 9600000, description: "Aftermovie, cortes e transmissões.", source: DEMO, period: "Set–Dez/2026" },
    { label: "Marcas parceiras", value: 24, description: "Entre patrocinadores, apoiadores e parceiros.", source: DEMO, period: "4ª edição" },
    { label: "Cidades de origem do público", value: 186, description: "Municípios identificados na venda de ingressos.", source: DEMO, period: "4ª edição" },
    { label: "Taxa de engajamento", value: 7.8, unit: "%", description: "Média das publicações oficiais.", source: DEMO, period: "Ago–Out/2026" },
    { kind: "projection", label: "Público esperado", value: 80000, unit: "pessoas", description: "Com a ampliação da área e o terceiro palco.", source: "Projeção da organização (demonstração)", period: "5ª edição · 2027" },
    { kind: "projection", label: "Alcance digital projetado", value: 25000000, unit: "contas", source: "Projeção da organização (demonstração)", period: "2027" },
    { kind: "projection", label: "Dias de programação", value: 3, unit: "dias", description: "+ 2 dias de Solarmar Talks", source: "Planejamento (demonstração)", period: "2027" },
    { kind: "projection", label: "Ativações de marca", value: 40, description: "Espaços disponíveis para ativação.", source: "Planejamento (demonstração)", period: "2027" },
  ]),

  // --------------------------------------------------------------------------
  // Fotos. in_gallery: aparece na galeria. folder "ativacoes": aparece em Resultados.
  // --------------------------------------------------------------------------
  media: media([
    { url: u("1459749411175-04bf5292ceea"), alt: "Palco principal iluminado em amarelo diante da multidão", caption: "Palco Sol, noite de abertura.", credit: "Unsplash", in_gallery: true, featured: true },
    { url: u("1501386761578-eac5c94b800a"), alt: "Público vibrando em frente ao palco", caption: "A grade é colada no palco desde o primeiro show.", credit: "Unsplash", in_gallery: true },
    { url: u("1493225457124-a3eb161ffa5f"), alt: "Artista em meio à fumaça cênica", caption: "Headliner da segunda noite.", credit: "Unsplash", in_gallery: true },
    { url: u("1563841930606-67e2bce48b78"), alt: "Estrutura de palco com treliças e iluminação azul", caption: "Estrutura de 40 metros de boca de cena.", credit: "Unsplash", in_gallery: true, folder: "estrutura" },
    { url: u("1492684223066-81342ee5ff30"), alt: "Chuva de papel picado sobre o público", caption: "Encerramento com chuva de confete.", credit: "Unsplash", in_gallery: true },
    { url: u("1429962714451-bb934ecdc4ec"), alt: "Mãos formando um coração no show", credit: "Unsplash", in_gallery: true, folder: "momentos" },
    { url: u("1516450360452-9312f5e86fc7"), alt: "Artista no palco com luzes azuis", credit: "Unsplash", in_gallery: true, folder: "momentos" },
    { url: u("1496024840928-4c417adf211d"), alt: "Público com pó colorido", credit: "Unsplash", in_gallery: true, folder: "momentos" },
    { url: u("1504680177321-2e6a879aac86"), alt: "DJ em palco com luzes laranja", credit: "Unsplash", in_gallery: true, folder: "momentos" },
    { url: u("1524368535928-5b5e00ddc76b"), alt: "Multidão sob luz laranja", credit: "Unsplash", in_gallery: true, folder: "momentos" },
    { url: u("1499364615650-ec38552f4f34"), alt: "Banda tocando com luzes azuis", credit: "Unsplash", in_gallery: true, folder: "momentos" },
    { url: u("1508700115892-45ecd05ae2ad"), alt: "Letreiro neon em espaço de marca", caption: "Ativação de marca com espaço instagramável.", credit: "Unsplash", folder: "ativacoes" },
    { url: u("1515169067868-5387ec356754"), alt: "Convidados conversando no lounge", caption: "Lounge corporativo de relacionamento.", credit: "Unsplash", folder: "ativacoes" },
    { url: u("1528605248644-14dd04022da1"), alt: "Pessoas em mesa de gastronomia", caption: "Arena gastronômica com chefs regionais.", credit: "Unsplash", folder: "ativacoes" },
  ]),

  // --------------------------------------------------------------------------
  // Depoimentos. context: "audience" (galeria), "results" (resultados), "sponsor" (marcas)
  // --------------------------------------------------------------------------
  testimonials: testimonials([
    { quote: "Não é só um festival. É o fim de semana em que a cidade inteira se encontra na orla.", author: "Marina A.", role: "Público da 4ª edição" },
    { quote: "Cheguei para um show e fiquei os três dias. A experiência é muito bem cuidada.", author: "Rafael T.", role: "Público" },
    { quote: "O pôr do sol no palco Mar é o momento mais bonito do ano.", author: "Juliana P.", role: "Público" },
    { context: "results", quote: "A ativação gerou mais conteúdo espontâneo do que toda a nossa campanha do trimestre.", author: "Carla Menezes", role: "Diretora de marketing", company: "Cervejaria Quilha (fictícia)" },
    { context: "results", quote: "Conseguimos falar com um público que não alcançávamos em mídia tradicional.", author: "Pedro Lins", role: "Head de marca", company: "Vetta Telecom (fictícia)" },
    { context: "sponsor", quote: "Renovamos antes mesmo de a edição terminar. O time entende de marca, não só de evento.", author: "Ana Ribeiro", role: "Gerente de patrocínios", company: "Banco Lume (fictício)" },
  ]),

  // --------------------------------------------------------------------------
  // Público. chart_type: "bar" | "donut" | "stat" | "map" (mapa usa siglas de UF)
  // --------------------------------------------------------------------------
  audience: audience([
    { dimension: "age", title: "Faixa etária", chart_type: "bar", data: [{ label: "18–24", value: 31 }, { label: "25–34", value: 38 }, { label: "35–44", value: 19 }, { label: "45+", value: 12 }], source: DEMO, period: "Pesquisa 4ª edição" },
    { dimension: "gender", title: "Gênero (autodeclarado)", chart_type: "donut", data: [{ label: "Mulheres", value: 52 }, { label: "Homens", value: 45 }, { label: "Outros / prefiro não dizer", value: 3 }], source: DEMO, period: "Pesquisa 4ª edição", note: "Coletado com consentimento, de forma anônima." },
    { dimension: "region", title: "Origem do público por estado", chart_type: "map", data: [{ label: "PE", value: 58 }, { label: "PB", value: 9 }, { label: "AL", value: 7 }, { label: "BA", value: 6 }, { label: "SP", value: 5 }, { label: "CE", value: 4 }, { label: "RN", value: 4 }, { label: "RJ", value: 3 }, { label: "DF", value: 2 }, { label: "MG", value: 2 }], source: DEMO, period: "Vendas de ingressos 2026", note: "42% do público veio de fora da região metropolitana." },
    { dimension: "socioeconomic", title: "Classe social", chart_type: "stat", data: [{ label: "Classes A e B", value: 64 }, { label: "Classe C", value: 31 }, { label: "Ensino superior", value: 71 }, { label: "Renda própria", value: 83 }], source: DEMO, period: "Pesquisa 4ª edição" },
    { dimension: "interests", title: "Interesses além da música", chart_type: "bar", data: [{ label: "Gastronomia", value: 67 }, { label: "Viagens", value: 58 }, { label: "Moda", value: 41 }, { label: "Tecnologia", value: 37 }, { label: "Esportes", value: 29 }], source: DEMO, period: "Pesquisa 4ª edição", note: "Respostas múltiplas." },
  ]),

  // --------------------------------------------------------------------------
  // Resultados (previous_value habilita o comparativo e o % de crescimento)
  // --------------------------------------------------------------------------
  results: results([
    { category: "attendance", label: "Público presencial", value: 62000, unit: "pessoas", previous_value: 48000, source: DEMO, period: "Set/2026 vs Set/2025" },
    { category: "organic", label: "Alcance orgânico", value: 11200000, unit: "contas", previous_value: 6900000, description: "Redes oficiais e de artistas.", source: DEMO, period: "Ago–Out" },
    { category: "paid", label: "Alcance pago", value: 7200000, unit: "contas", previous_value: 5100000, source: DEMO, period: "Ago–Out" },
    { category: "impressions", label: "Impressões totais", value: 41000000, previous_value: 27500000, source: DEMO, period: "Ago–Out" },
    { category: "media", label: "Matérias espontâneas na imprensa", value: 312, unit: "inserções", previous_value: 190, description: "TV, portais e rádio.", source: DEMO, period: "Ago–Out" },
    { category: "activation", label: "Interações em ativações de marca", value: 148000, previous_value: 96000, description: "Check-ins, brindes e experiências.", source: DEMO, period: "3 dias de evento" },
  ]),

  // --------------------------------------------------------------------------
  // Oportunidades para marcas
  // --------------------------------------------------------------------------
  opportunities: opportunities([
    { category: "naming_rights", title: "Naming rights do festival", description: "Sua marca no nome do evento: \"Solarmar apresentado por\". Presença em toda a comunicação, do anúncio ao aftermovie.", deliverables: ["Marca no nome oficial do festival", "Logo em todas as peças e no palco principal", "Menção em release e coletiva", "Ativação central de 300 m²"], image_url: u("1540039155733-5bb30b53aa14") },
    { category: "master", title: "Patrocínio master", description: "A cota de maior visibilidade depois do naming rights, com presença em todos os palcos e entregas digitais dedicadas.", deliverables: ["Logo em destaque nos telões", "Ativação de 150 m²", "Conteúdo co-criado com artistas", "40 credenciais VIP"], image_url: u("1533174072545-7a4b6ad7a6c3") },
    { category: "category", title: "Patrocínio por categoria", description: "Exclusividade no seu segmento: bebida oficial, banco oficial, operadora oficial.", deliverables: ["Exclusividade de categoria", "Direito de uso da marca do festival", "Pontos de venda/serviço no evento"], image_url: u("1528605248644-14dd04022da1") },
    { category: "activation", title: "Ativações de marca", description: "Espaços para experiências que viram conteúdo: do lounge à roda-gigante.", deliverables: ["Área de 30 a 150 m²", "Projeto cenográfico com nossa equipe", "Relatório de interações"], image_url: u("1508700115892-45ecd05ae2ad") },
    { category: "experience", title: "Experiências exclusivas", description: "Lounge corporativo à beira-mar para relacionamento com clientes e convidados.", deliverables: ["Lounge com open bar e gastronomia", "Vista privilegiada do palco Mar", "Acesso a backstage"], image_url: u("1515169067868-5387ec356754") },
    { category: "digital_media", title: "Mídia digital", description: "Presença nas redes oficiais, transmissões ao vivo e newsletter do festival.", deliverables: ["Posts e stories patrocinados", "Inserção na transmissão ao vivo", "Cortes com marca no YouTube"], image_url: u("1522158637959-30385a09e0da") },
    { category: "audiovisual", title: "Inserções audiovisuais", description: "Vinhetas nos telões entre shows e presença no aftermovie oficial.", deliverables: ["Vinheta de 15\" nos intervalos", "Assinatura no aftermovie"], image_url: u("1504680177321-2e6a879aac86") },
    { category: "institutional", title: "Apoio institucional", description: "Para instituições e órgãos públicos que queiram associar sua marca à economia criativa local.", deliverables: ["Logo na régua institucional", "Menção em releases"] },
  ]),

  // --------------------------------------------------------------------------
  // Cotas. show_price: false = "Sob consulta". quantity_total: null = ilimitada.
  // --------------------------------------------------------------------------
  tiers: tiers([
    { name: "Master", tagline: "Presença máxima, em todos os pontos de contato.", description: "Cota única por segmento, com ativação central e entregas digitais dedicadas.", price: 1200000, show_price: false, quantity_total: 2, quantity_sold: 1, highlight: true,
      deliverables: ["Logo em destaque em todos os palcos e telões", "Ativação de 150 m² em área nobre", "12 posts + 24 stories nas redes oficiais", "Inserção no aftermovie", "40 credenciais VIP + lounge"],
      benefits: ["Exclusividade de categoria", "Relatório de resultados", "Direito de uso de imagem"] },
    { name: "Ouro", tagline: "Visibilidade forte com ativação própria.", price: 480000, show_price: true, quantity_total: 4, quantity_sold: 2,
      deliverables: ["Logo nos telões e palco secundário", "Ativação de 60 m²", "6 posts + 12 stories", "20 credenciais VIP"], benefits: ["Relatório de resultados", "Direito de uso de imagem"] },
    { name: "Prata", tagline: "Presença qualificada e relacionamento.", price: 220000, show_price: true, quantity_total: 6, quantity_sold: 1,
      deliverables: ["Logo na régua de patrocinadores", "Espaço de 20 m²", "3 posts nas redes oficiais", "10 credenciais VIP"], benefits: ["Relatório de resultados"] },
    { name: "Apoiador", tagline: "Para marcas locais e parceiros de serviço.", price: 60000, show_price: true, quantity_total: 10, quantity_sold: 3,
      deliverables: ["Logo na régua de apoiadores", "Menção nas redes oficiais", "4 credenciais"] },
  ]),

  // --------------------------------------------------------------------------
  // Marcas. relation: "current" | "past" | "institutional" | "supporter" | "media"
  // --------------------------------------------------------------------------
  sponsors: sponsors([
    { name: "Banco Lume (fictício)", logo_url: "/demo/marcas/banco-lume.svg", relation: "current", tier_label: "Master", case_title: "Banco Lume: cashback que virou fila", case_body: "Ativação com pagamento por aproximação e cashback no próprio festival: 21 mil transações em três dias (dados fictícios)." },
    { name: "Cervejaria Quilha (fictícia)", logo_url: "/demo/marcas/cervejaria-quilha.svg", relation: "current", tier_label: "Ouro", case_title: "Quilha: o bar mais fotografado da orla", case_body: "Um bar cenográfico sobre a areia que gerou 4,2 mil publicações espontâneas (dados fictícios)." },
    { name: "Vetta Telecom (fictícia)", logo_url: "/demo/marcas/vetta-telecom.svg", relation: "current", tier_label: "Ouro" },
    { name: "Aurora Energia (fictícia)", logo_url: "/demo/marcas/aurora-energia.svg", relation: "past" },
    { name: "Orla Seguros (fictícia)", logo_url: "/demo/marcas/orla-seguros.svg", relation: "past" },
    { name: "Nativa Cosméticos (fictícia)", logo_url: "/demo/marcas/nativa-cosmeticos.svg", relation: "past" },
    { name: "Rota Mobilidade (fictícia)", logo_url: "/demo/marcas/rota-mobilidade.svg", relation: "supporter" },
    { name: "Pulso Saúde (fictícia)", logo_url: "/demo/marcas/pulso-saude.svg", relation: "supporter" },
    { name: "Brisa Águas (fictícia)", logo_url: "/demo/marcas/brisa-aguas.svg", relation: "supporter" },
    { name: "Ferro Norte (fictícia)", logo_url: "/demo/marcas/ferro-norte.svg", relation: "institutional" },
  ]),

  // --------------------------------------------------------------------------
  // Rastreamento (opcional). Só carrega após o visitante aceitar os cookies.
  // --------------------------------------------------------------------------
  tracking: {
    meta_pixel_id: null, // ex.: "123456789012345"
    ga_measurement_id: null, // ex.: "G-XXXXXXXXXX"
    gtm_id: null, // ex.: "GTM-XXXXXXX"
  },
});
