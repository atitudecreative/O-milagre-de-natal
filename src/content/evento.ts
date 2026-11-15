/**
 * ============================================================================
 *  CONTEÚDO DA LANDING PAGE — Musical de Natal "O Milagre do Natal"
 *  Edite este arquivo para trocar textos, números, cotas, fotos e cores.
 *  Tudo o que aparece na página (e no PDF) vem daqui.
 *
 *  Fonte dos dados: media kit "O Milagre do Natal" (Striker Produções) e artes
 *  oficiais da campanha. Itens marcados com "REVISAR" dependem da equipe.
 * ============================================================================
 */
import { branding, bundle, event, media, metrics, opportunities, sections, testimonials, tiers } from "./build";

const KIT = "Media kit O Milagre do Natal — Striker Produções";

export const EVENTO = bundle({
  // --------------------------------------------------------------------------
  // Informações gerais, contato e SEO
  // --------------------------------------------------------------------------
  event: event({
    slug: "o-milagre-do-natal",
    name: "O Milagre do Natal",
    tagline: "Musical de Natal",
    short_description:
      "Um espetáculo que encanta famílias. Um presente de Natal para o Rio de Janeiro — e uma oportunidade para marcas que querem fazer parte desse momento.",
    description:
      "O Milagre do Natal é o Musical de Natal apresentado pela Striker Produções na Igreja Batista Atitude, na Barra da Tijuca. Em 2025, os especiais de fim de ano reuniram mais de 100 mil pessoas. Este ano, o musical acontece em um local preparado para proporcionar uma experiência única e inesquecível para toda a família.",
    starts_on: "2026-12-12",
    ends_on: "2026-12-15",
    date_label: "12, 13, 14 e 15 de dezembro",
    venue: "Igreja Batista Atitude",
    city: "Barra da Tijuca",
    state: "Rio de Janeiro",
    organizer_name: "Striker Produções · Igreja Batista Atitude",
    organizer_about: "Musical de Natal apresentado pela Striker Produções na Igreja Batista Atitude. Rua Sylvio da Rocha Pollis, 751 — Barra da Tijuca, Rio de Janeiro.",
    // REVISAR: preencha o contato comercial. O formulário envia para o WhatsApp
    // (DDI + DDD + número, só dígitos, ex.: "5521999999999") ou, sem ele, para o e-mail.
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    whatsapp: null,
    privacy_contact_email: null,
    social_links: [],
    footer_links: [],
    form_interests: ["Cota de patrocínio", "Stand de divulgação", "Ação de divulgação no evento", "Conteúdo e comunicação digital", "Outro formato"],
    form_success_message: "Abrimos o WhatsApp com sua mensagem pronta. É só enviar — nossa equipe responde em breve.",
    seo_title: "O Milagre do Natal — Musical de Natal · Patrocínio",
    seo_description: "Musical de Natal de 12 a 15 de dezembro na Barra da Tijuca. Mais de 100 mil pessoas em 2025. Conheça as cotas de patrocínio.",
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
    // "deck": a página é uma apresentação de slides em tela cheia.
    skin: "deck",
    slides: [
      { kind: "poster", label: "O Milagre do Natal" },
      { kind: "image", id: "o-evento", label: "Um espetáculo que encanta famílias", src: "/kit/familias.webp", alt: "Famílias sorrindo na plateia sob chuva de confete, com o título Um espetáculo que encanta famílias", text: "Um espetáculo que encanta famílias. Um presente de Natal para o Rio de Janeiro." },
      { kind: "image", label: "STK Produções apresenta", src: "/kit/apresenta.webp", alt: "Palco com painéis de LED e iluminação, com o texto STK Produções apresenta", text: "STK Produções apresenta O Milagre do Natal." },
      { kind: "image", label: "A campanha", src: "/kit/outdoor.webp", alt: "Outdoor com a arte de O Milagre do Natal ao entardecer", text: "A campanha O Milagre do Natal, apresentada pela Striker Produções." },
      { kind: "image", id: "numeros", label: "+100 mil pessoas em 2025", src: "/kit/publico-2025.webp", alt: "Palco iluminado com o texto Temos muitos motivos para comemorar: os especiais de fim de ano foram um sucesso em 2025, mais de 100 mil pessoas assistiram o Musical de Natal", text: "Temos muitos motivos para comemorar: os especiais de fim de ano foram um sucesso em 2025. Mais de 100 mil pessoas assistiram ao Musical de Natal." },
      { kind: "image", label: "Expectativa: +100 mil pessoas", src: "/kit/expectativa.webp", alt: "Palco com luzes e faíscas e o texto Expectativa de público: mais de 100 mil pessoas", text: "Expectativa de público: mais de 100 mil pessoas." },
      { kind: "image", label: "Uma oportunidade estratégica", src: "/kit/oportunidade.webp", alt: "Coral no palco com o texto Uma oportunidade estratégica de se conectar com um público que busca inspiração e valores familiares", text: "Uma oportunidade estratégica de se conectar com um público que busca inspiração e valores familiares em um momento de celebração e renovação." },
      { kind: "image", label: "Um local muito especial", src: "/kit/local.webp", alt: "Elenco no palco com cenário de floresta e neve e o texto Este ano, nosso Musical de Natal acontecerá em um local muito especial", text: "Este ano, nosso Musical de Natal acontecerá em um local muito especial, preparado para proporcionar uma experiência única e inesquecível para toda a família." },
      { kind: "sessions", label: "Sessões", title: "Quatro noites de espetáculo.", body: "De sábado a terça, 12 a 15 de dezembro, na Igreja Batista Atitude, Barra da Tijuca." },
      { kind: "opportunities", id: "oportunidades", label: "Oportunidades", title: "Sua marca presente em cada sessão." },
      { kind: "tiers", id: "cotas", label: "Cotas", title: "Escolha como sua marca participa.", body: "Compare o que cada cota entrega.", bg: "/kit/bronze-bg.webp" },
      { kind: "form", id: "interesse", label: "Patrocine", bg: "/kit/familias.webp" },
    ],
    address: "Rua Sylvio da Rocha Pollis, 751 — Barra da Tijuca, Rio de Janeiro",
    venueNote: "Este ano, o Musical de Natal acontece em um local preparado para proporcionar uma experiência única e inesquecível para toda a família.",
    posterHero: {
      desktop: "/kv/o-milagre-do-natal-16x9.webp",
      mobile: "/kv/o-milagre-do-natal-story.webp",
      alt: "Arte do Musical de Natal O Milagre do Natal: arautos tocando trombetas diante de um vitral em arco com estrela. Datas 12, 13, 14 e 15 de dezembro, Igreja Batista Atitude.",
      width: 1920,
      height: 1080,
    },
    strip: {
      src: "/kv/o-milagre-do-natal-banner.webp",
      alt: "Banner da campanha O Milagre do Natal com a cena do presépio, arautos e o título do musical.",
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
      eyebrow: "Musical de Natal",
      title: "Um espetáculo que encanta famílias.",
      body: "Um presente de Natal para o Rio de Janeiro. Música, cenário e emoção para quem vem pela primeira vez — e para quem volta todo ano.",
      settings: {
        statement: "Uma oportunidade estratégica de se conectar com um público que busca inspiração e valores familiares em um momento de celebração e renovação.",
        statement_highlights: ["inspiração e valores", "celebração e renovação"],
        highlights: [
          { title: "Inspiração", description: "A história do nascimento de Jesus contada no palco, com música ao vivo, elenco e cenografia." },
          { title: "Valores familiares", description: "Um programa para pais, filhos e avós viverem juntos — o público que sua marca quer encontrar." },
          { title: "Celebração", description: "O fim de ano, quando as famílias estão mais abertas a novas experiências e às marcas que as proporcionam." },
        ],
        gallery_title: "Por dentro do espetáculo.",
      },
    }],
    ["metrics", {
      eyebrow: "Temporada 2026",
      title: "Temos muitos motivos para comemorar.",
      body: "Apresentações de sábado a terça-feira, de 12 a 15 de dezembro, na Barra da Tijuca.",
    }],
    ["opportunities", {
      eyebrow: "Oportunidades para marcas",
      title: "Sua marca presente em cada sessão.",
      body: "Formatos de visibilidade, relacionamento e conteúdo incluídos nas cotas de patrocínio.",
    }],
    ["tiers", {
      eyebrow: "Cotas de patrocínio",
      title: "Escolha como sua marca participa.",
      body: "Compare o que cada cota entrega e escolha a presença ideal para a sua marca.",
      settings: {
        note: "Contrapartidas conforme media kit da Striker Produções. Condições finais definidas em proposta comercial.",
        // Uma linha por contrapartida; valores na ordem das cotas (Bronze, Prata, Ouro). "✓" = incluído, "—" = não incluído.
        comparison: [
          { label: "Marca na comunicação", values: ["Digital", "Matérias digitais", "Todos os materiais oficiais"] },
          { label: "Telão de LED nas sessões", values: ["—", "✓", "Exclusivo"] },
          { label: "Citação da marca", values: ["No evento", "Nas sessões", "Sorteios e ações"] },
          { label: "Área VIP", values: ["20 convidados", "30 convidados", "50 por sessão"] },
          { label: "Sala VIP com coffee break", values: ["✓", "✓", "✓"] },
          { label: "Valet de estacionamento", values: ["1 carro", "3 carros", "5 carros"] },
          { label: "Ação de divulgação no evento", values: ["—", "✓", "✓"] },
          { label: "Stand de divulgação", values: ["—", "—", "✓"] },
          { label: "Visita ao backstage do elenco", values: ["—", "—", "✓"] },
          { label: "Gravação de conteúdo com a marca", values: ["—", "—", "✓"] },
        ],
      },
    }],
    ["cta", {
      eyebrow: "Patrocine O Milagre do Natal",
      title: "Sua marca no Natal das famílias do Rio.",
      body: "Fale com a equipe do musical e descubra o formato ideal para a sua empresa estar presente nas quatro noites de apresentação.",
      settings: { button_label: "Quero conectar minha marca ao musical" },
    }],
    ["footer", { settings: { copyright: `© ${new Date().getFullYear()} O Milagre do Natal · Striker Produções · Igreja Batista Atitude` } }],
  ]),

  // --------------------------------------------------------------------------
  // Números — somente dados do media kit, com fonte e período.
  // --------------------------------------------------------------------------
  metrics: metrics([
    { label: "Público", value: 100000, unit: "pessoas assistiram ao Musical de Natal", description: "Nos especiais de fim de ano de 2025.", source: KIT, period: "2025", featured: true, animate: false },
    { kind: "projection", label: "Expectativa de público", value: 100000, unit: "pessoas esperadas", description: "Expectativa de público para a temporada de 2026.", source: KIT, period: "2026", animate: false },
    { label: "Noites de apresentação", value: 4, unit: "noites", description: "12, 13, 14 e 15 de dezembro de 2026.", source: "Programação oficial do musical", period: "Temporada 2026", animate: false },
  ]),

  // --------------------------------------------------------------------------
  // Fotos (media kit e artes da campanha)
  // --------------------------------------------------------------------------
  media: media([
    { url: "/fotos/familias.webp", alt: "Famílias sorrindo na plateia sob uma chuva de confete", caption: "Um espetáculo que encanta famílias.", in_gallery: true, featured: true, credit: "Striker Produções" },
    { url: "/fotos/elenco.webp", alt: "Elenco do musical no palco com cenário de floresta iluminada e neve", caption: "Elenco em cena nos especiais de fim de ano de 2025.", in_gallery: true, credit: "Striker Produções" },
    { url: "/fotos/presepio.webp", alt: "Cena do presépio com Maria, José, o menino Jesus, pastores e animais", caption: "A cena do presépio de O Milagre do Natal.", in_gallery: true },
    { url: "/fotos/palco.webp", alt: "Palco com painéis de LED, iluminação e faíscas diante do público", caption: "Telões de LED, luz e efeitos especiais.", in_gallery: true, credit: "Striker Produções" },
    { url: "/fotos/outdoor.webp", alt: "Outdoor com a arte da campanha O Milagre do Natal ao entardecer", caption: "Campanha O Milagre do Natal.", in_gallery: true },
  ]),

  testimonials: testimonials([]),
  audience: [],
  results: [],

  // --------------------------------------------------------------------------
  // Oportunidades — formatos que constam nas cotas do media kit
  // --------------------------------------------------------------------------
  opportunities: opportunities([
    { category: "audiovisual", title: "Telão de LED", image_url: "/fotos/palco.webp", description: "Sua marca no telão de LED durante as sessões — com exclusividade na cota Ouro.", deliverables: ["Presença no telão de LED (Prata)", "Presença exclusiva no LED durante as sessões (Ouro)"] },
    { category: "experience", title: "Área VIP e sala VIP", image_url: "/fotos/presepio.webp", description: "Receba clientes e convidados com conforto, coffee break e valet de estacionamento.", deliverables: ["Área VIP de 20 a 50 convidados", "Sala VIP com coffee break", "Valet de estacionamento"] },
    { category: "activation", title: "Ações durante o evento", image_url: "/fotos/familias.webp", description: "Citação da marca nas sessões, sorteios e ações de divulgação com o público presente.", deliverables: ["Citação da marca durante as sessões", "Sorteios e demais ações (Ouro)", "Ação de divulgação da marca"] },
    { category: "digital_media", title: "Comunicação e conteúdo", image_url: "/fotos/outdoor.webp", description: "Presença nas comunicações digitais e em conteúdo gravado durante e depois do musical.", deliverables: ["Marca nas comunicações e matérias digitais", "Marca em todos os materiais oficiais (Ouro)", "Gravação de conteúdo com marca vinculada (Ouro)"] },
    { category: "booth", title: "Stand e backstage", image_url: "/fotos/elenco.webp", description: "Um stand de divulgação no musical e uma visita à área de backstage do elenco.", deliverables: ["Stand de divulgação no musical (Ouro)", "Visita à área backstage do elenco (Ouro)"] },
  ]),

  // --------------------------------------------------------------------------
  // Cotas — valores e contrapartidas do media kit
  // --------------------------------------------------------------------------
  tiers: tiers([
    { name: "Bronze", tagline: "Presença digital e experiência VIP.", price: 4000, show_price: true,
      deliverables: ["Marca nas comunicações digitais", "Citação da marca durante o evento", "Área VIP para 20 convidados", "Sala VIP com coffee break", "Valet de estacionamento para 1 carro"] },
    { name: "Prata", tagline: "Visibilidade no telão e ação no evento.", price: 6000, show_price: true,
      deliverables: ["Marca em matérias digitais", "Presença no telão de LED", "Citação da marca durante as sessões", "Área VIP para 30 convidados", "Valet de estacionamento para 3 carros", "Sala VIP com coffee break", "Ação de divulgação da marca durante o evento"] },
    { name: "Ouro", tagline: "A presença mais completa no musical.", price: 10000, show_price: true, highlight: true,
      deliverables: ["Marca em todos os materiais oficiais", "Presença no LED durante as sessões de forma exclusiva", "Citação da marca no musical (sorteios e demais ações)", "Área VIP para 50 convidados por sessão", "Valet de estacionamento para 5 carros", "Sala VIP com coffee break", "Visita à área backstage do elenco", "Gravação de conteúdo durante o musical com marca vinculada e pós-musical", "Ação de divulgação durante o evento", "Stand de divulgação no musical"] },
  ]),

  sponsors: [],

  // --------------------------------------------------------------------------
  // Rastreamento (opcional). Só carrega após o visitante aceitar os cookies.
  // --------------------------------------------------------------------------
  tracking: { meta_pixel_id: null, ga_measurement_id: null, gtm_id: null },
});
