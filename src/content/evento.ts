/**
 * ============================================================================
 *  CONTEÚDO DA LANDING PAGE — Musical de Natal "O Milagre do Natal"
 *  Edite este arquivo para trocar textos, números, cotas, fotos e cores.
 *  Tudo o que aparece na página (e no PDF) vem daqui.
 *
 *  Itens marcados com "REVISAR" são propostas de texto/comercial que precisam
 *  ser confirmadas pela equipe antes da divulgação.
 * ============================================================================
 */
import { branding, bundle, event, metrics, opportunities, sections, testimonials, tiers } from "./build";

export const EVENTO = bundle({
  // --------------------------------------------------------------------------
  // Informações gerais, contato e SEO
  // --------------------------------------------------------------------------
  event: event({
    slug: "o-milagre-do-natal",
    name: "O Milagre do Natal",
    tagline: "Musical de Natal",
    short_description:
      "Quatro noites em que a história do nascimento de Jesus ganha música, luz e cena no palco da Igreja Batista Atitude. Um encontro para famílias de toda a cidade — e uma oportunidade para marcas que querem fazer parte desse momento.",
    description:
      "O Milagre do Natal é o musical de Natal da Igreja Batista Atitude, produzido pela Atitude Creative. Em cena, arautos, a família de Nazaré, a manjedoura e um coro que conduz o público pela noite mais conhecida da história. Uma montagem com cenário, figurinos, iluminação e música ao vivo, aberta a toda a comunidade.",
    starts_on: "2026-12-12",
    ends_on: "2026-12-15",
    date_label: "12, 13, 14 e 15 de dezembro",
    venue: "Igreja Batista Atitude",
    city: "Barra da Tijuca",
    state: "Rio de Janeiro",
    organizer_name: "Igreja Batista Atitude — Barra",
    organizer_about: "Musical de Natal da Igreja Batista Atitude, com produção da Atitude Creative. Rua Sylvio da Rocha Pollis, 751 — Barra da Tijuca, Rio de Janeiro.",
    // REVISAR: preencha o contato comercial. O formulário envia para o WhatsApp
    // (DDI + DDD + número, só dígitos, ex.: "5521999999999") ou, sem ele, para o e-mail.
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    whatsapp: null,
    privacy_contact_email: null,
    social_links: [],
    footer_links: [],
    form_interests: ["Cota de patrocínio", "Ativação no hall", "Mídia e redes sociais", "Apoio cultural", "Outro formato"],
    form_success_message: "Abrimos o WhatsApp com sua mensagem pronta. É só enviar — nossa equipe responde em breve.",
    seo_title: "O Milagre do Natal — Musical de Natal · Patrocínio",
    seo_description: "Musical de Natal da Igreja Batista Atitude, de 12 a 15 de dezembro na Barra da Tijuca. Conheça as oportunidades de patrocínio.",
    og_image_url: "/kv/og.jpg",
  }),

  // --------------------------------------------------------------------------
  // Identidade visual (tirada da arte oficial)
  // --------------------------------------------------------------------------
  branding: branding({
    color_background: "#13171D", // azul-noite da arte
    color_secondary: "#1B222B",
    color_text: "#F3E9DC", // creme dos textos
    color_primary: "#EDC392", // brilho do cobre
    color_accent: "#C98B57", // cobre
    font_heading: "Cinzel",
    font_body: "Manrope",
    heading_case: "none",
    corner_style: "soft",
    grain: true,
    logo_url: "/kv/logo-atitude-branca.png", // logo branca, fundo transparente (menu)
    logo_alt_url: "/kv/logo-atitude-branca.png", // rodapé
  }),

  look: {
    skin: "apple", // abertura com a arte; o restante em estilo galeria branca
    address: "Rua Sylvio da Rocha Pollis, 751 — Barra da Tijuca, Rio de Janeiro",
    posterHero: {
      desktop: "/kv/o-milagre-do-natal-16x9.webp",
      // Para o celular, adicione a arte vertical (story) em public/kv e informe aqui:
      // mobile: "/kv/o-milagre-do-natal-story.webp",
      alt: "Arte do Musical de Natal O Milagre do Natal: arautos tocando trombetas diante de um vitral em arco com estrela. Datas 12, 13, 14 e 15 de dezembro, Igreja Batista Atitude.",
      width: 1920,
      height: 1080,
    },
    metallic: true,
    starfield: true,
    archOrnament: true,
    displayLeading: 1.04,
    titleScale: 0.78,
  },

  // --------------------------------------------------------------------------
  // Seções (na ordem da página). Seções sem conteúdo ficam ocultas sozinhas.
  // --------------------------------------------------------------------------
  sections: sections([
    ["hero", {
      title: "O Milagre do Natal",
      settings: { primary_label: "Quero ser patrocinador", secondary_label: "Conheça o musical" },
    }],
    ["grandeur", {
      eyebrow: "O musical",
      title: "A noite mais conhecida da história, contada no palco.",
      body: "Arautos anunciam a chegada, a família de Nazaré atravessa a cidade e a manjedoura se acende sob o céu estrelado. Cenário, figurinos, luz e música ao vivo para emocionar quem vem pela primeira vez — e quem volta todo ano.",
      settings: {
        statement: "Uma história que atravessa gerações, contada para a família inteira.",
        highlights: [
          { title: "Música ao vivo", description: "Um coro e música ao vivo conduzem o público pela noite do nascimento de Jesus." },
          { title: "Cenário e figurinos", description: "A manjedoura, os arautos e a família de Nazaré ganham vida com cenografia, figurino e luz." },
          { title: "Para toda a família", description: "Uma programação de Natal aberta à comunidade, para quem vem pela primeira vez e para quem volta todo ano." },
        ],
      },
    }],
    ["metrics", {
      eyebrow: "Temporada 2026",
      title: "Quatro noites para celebrar o Natal.",
      body: "Apresentações de sábado a terça-feira na Igreja Batista Atitude, na Barra da Tijuca.",
    }],
    ["opportunities", {
      eyebrow: "Oportunidades para marcas",
      title: "Formas de fazer parte do Natal da cidade.",
      body: "Formatos pensados para associar sua marca a uma experiência familiar, afetiva e de grande alcance na comunidade.",
    }],
    ["tiers", {
      eyebrow: "Cotas de patrocínio",
      title: "Escolha como sua marca participa.",
      body: "Valores e contrapartidas sob consulta. Montamos a proposta de acordo com o objetivo da sua empresa.",
      settings: { note: "Contrapartidas sujeitas à confirmação em proposta comercial." },
    }],
    ["cta", {
      eyebrow: "Patrocine O Milagre do Natal",
      title: "Sua marca no Natal das famílias da cidade.",
      body: "Fale com a equipe do musical e descubra o formato ideal para a sua empresa estar presente nas quatro noites de apresentação.",
      settings: { button_label: "Quero conectar minha marca ao musical" },
    }],
    ["footer", { settings: { copyright: `© ${new Date().getFullYear()} Igreja Batista Atitude · Produção Atitude Creative` } }],
  ]),

  // --------------------------------------------------------------------------
  // Números — use apenas dados reais, com fonte e período.
  // REVISAR: acrescente público das edições anteriores, alcance nas redes etc.
  // --------------------------------------------------------------------------
  metrics: metrics([
    { label: "Noites de apresentação", value: 4, unit: "noites", description: "12, 13, 14 e 15 de dezembro de 2026.", source: "Programação oficial do musical", period: "Temporada 2026", featured: true, animate: false },
  ]),

  media: [],
  testimonials: testimonials([]),
  audience: [],
  results: [],

  // --------------------------------------------------------------------------
  // Oportunidades para marcas — REVISAR com a equipe comercial
  // --------------------------------------------------------------------------
  opportunities: opportunities([
    { category: "master", title: "Patrocínio master", description: "A marca que apresenta o musical: presença em toda a comunicação e nas quatro noites de espetáculo.", deliverables: ["“O Milagre do Natal apresentado por” na divulgação", "Logo em destaque no telão antes de cada sessão", "Agradecimento no palco", "Espaço de ativação no hall"] },
    { category: "activation", title: "Ativação no hall", description: "Um espaço para receber as famílias antes e depois do espetáculo: degustação, brindes, fotos e experiências de Natal.", deliverables: ["Espaço no hall de entrada", "Ação durante as quatro noites", "Fotos e registros da ativação"] },
    { category: "digital_media", title: "Mídia e redes sociais", description: "Presença nas publicações oficiais do musical antes, durante e depois da temporada.", deliverables: ["Marca nas artes de divulgação", "Menção nas redes oficiais", "Assinatura nos vídeos do musical"] },
    { category: "audiovisual", title: "Telão e programa", description: "Inserções no telão antes das sessões e presença no material entregue ao público.", deliverables: ["Vinheta no telão", "Logo no programa / material impresso"] },
    { category: "institutional", title: "Apoio cultural", description: "Para empresas e instituições que querem apoiar uma iniciativa cultural e comunitária de Natal.", deliverables: ["Logo na régua de apoiadores", "Agradecimento nas redes oficiais"] },
  ]),

  // --------------------------------------------------------------------------
  // Cotas — REVISAR nomes, contrapartidas, quantidades e valores
  // (show_price: false mostra "Sob consulta")
  // --------------------------------------------------------------------------
  tiers: tiers([
    { name: "Master", tagline: "A marca que apresenta o musical.", highlight: true,
      deliverables: ["“Apresentado por” em toda a divulgação", "Logo em destaque no telão e nas artes", "Agradecimento no palco nas 4 noites", "Espaço de ativação no hall", "Ingressos/convites para convidados"],
      benefits: ["Exclusividade de segmento", "Relatório fotográfico"] },
    { name: "Ouro", tagline: "Visibilidade e presença nas quatro noites.",
      deliverables: ["Logo no telão e nas artes de divulgação", "Menção nas redes oficiais", "Espaço no hall em uma das noites"],
      benefits: ["Relatório fotográfico"] },
    { name: "Prata", tagline: "Presença qualificada na divulgação.",
      deliverables: ["Logo na régua de patrocinadores", "Menção nas redes oficiais"] },
    { name: "Apoiador", tagline: "Para negócios locais e parceiros.",
      deliverables: ["Logo na régua de apoiadores", "Agradecimento nas redes oficiais"] },
  ]),

  sponsors: [],

  // --------------------------------------------------------------------------
  // Rastreamento (opcional). Só carrega após o visitante aceitar os cookies.
  // --------------------------------------------------------------------------
  tracking: { meta_pixel_id: null, ga_measurement_id: null, gtm_id: null },
});
