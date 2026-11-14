import { z } from "./zod";

/** Schemas de validação de todo o conteúdo editável (servidor). */
const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v)).nullable().optional();
const url = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Use um endereço que comece com https:// ou /")
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use #RRGGBB)");
const num = z.coerce.number().refine(Number.isFinite, "Número inválido");
const optNum = z
  .union([z.literal(""), z.null(), z.undefined(), z.coerce.number()])
  .transform((v) => (v === "" || v == null || Number.isNaN(v) ? null : Number(v)));
const lines = z
  .union([z.array(z.string()), z.string()])
  .transform((v) => (Array.isArray(v) ? v : v.split("\n")).map((s) => s.trim()).filter(Boolean).slice(0, 40));

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.")
  .min(2)
  .max(80);

export const eventBasicsSchema = z.object({
  name: str(120).min(2, "Informe o nome do evento."),
  slug: slugSchema,
  tagline: optStr(200),
  short_description: optStr(400),
  description: optStr(6000),
  edition_number: optNum.refine((v) => v == null || (v >= 1 && v <= 999), "Edição entre 1 e 999"),
  edition_label: optStr(60),
  starts_on: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).transform((v) => v || null).nullable().optional(),
  ends_on: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).transform((v) => v || null).nullable().optional(),
  date_label: optStr(80),
  venue: optStr(160),
  city: optStr(80),
  state: optStr(40),
  country: optStr(60),
});

export const eventContactSchema = z.object({
  organizer_name: optStr(160),
  organizer_document: optStr(40),
  organizer_about: optStr(1200),
  contact_name: optStr(120),
  contact_email: z.union([z.literal(""), z.email("E-mail inválido")]).transform((v) => v || null).nullable().optional(),
  contact_phone: optStr(40),
  whatsapp: z.string().trim().transform((v) => v.replace(/\D/g, "")).refine((v) => v === "" || (v.length >= 10 && v.length <= 15), "WhatsApp com DDI e DDD, ex.: 5581999999999").transform((v) => v || null),
  privacy_contact_email: z.union([z.literal(""), z.email("E-mail inválido")]).transform((v) => v || null).nullable().optional(),
  form_interests: lines,
  form_success_message: optStr(400),
  deck_enabled: z.boolean(),
  social_links: z.array(z.object({ network: str(40).min(1), url: z.string().trim().regex(/^https?:\/\//, "URL inválida") })).max(12),
  footer_links: z.array(z.object({ label: str(60).min(1), url: z.string().trim().refine((v) => /^(https?:\/\/|mailto:|tel:|\/)/.test(v), "Link inválido") })).max(12),
});

export const seoSchema = z.object({
  seo_title: optStr(70),
  seo_description: optStr(200),
  og_image_url: url,
  noindex: z.boolean(),
});

export const integrationsSchema = z.object({
  meta_pixel_id: z.string().trim().refine((v) => v === "" || /^\d{6,20}$/.test(v), "ID do Pixel: apenas números").transform((v) => v || null),
  ga_measurement_id: z.string().trim().toUpperCase().refine((v) => v === "" || /^G-[A-Z0-9]{4,16}$/.test(v), "Formato G-XXXXXXX").transform((v) => v || null),
  gtm_id: z.string().trim().toUpperCase().refine((v) => v === "" || /^GTM-[A-Z0-9]{4,12}$/.test(v), "Formato GTM-XXXXXX").transform((v) => v || null),
  tracking_enabled: z.boolean(),
  notify_emails: z
    .union([z.array(z.string()), z.string()])
    .transform((v) => (Array.isArray(v) ? v : v.split(/[\n,;]/)).map((s) => s.trim().toLowerCase()).filter(Boolean))
    .pipe(z.array(z.email("E-mail de notificação inválido")).max(10)),
});

export const brandingSchema = z.object({
  logo_url: url,
  logo_alt_url: url,
  favicon_url: url,
  texture_url: url,
  color_primary: hex,
  color_secondary: hex,
  color_accent: hex,
  color_background: hex,
  color_text: hex,
  font_heading: str(60),
  font_body: str(60),
  heading_case: z.enum(["upper", "none"]),
  texture_opacity: z.coerce.number().min(0).max(1),
  grain: z.boolean(),
  corner_style: z.enum(["square", "soft", "round"]),
});

export const sectionSchema = z.object({
  id: z.uuid(),
  enabled: z.boolean(),
  eyebrow: optStr(80),
  title: optStr(240),
  body: optStr(4000),
  settings: z.record(z.string(), z.unknown()),
});

/* ---------- Coleções editáveis (tabela → schema) ---------- */
export const collectionSchemas = {
  event_metrics: z.object({
    kind: z.enum(["actual", "projection"]),
    label: str(80).min(1, "Informe o título."),
    value: num,
    prefix: optStr(8),
    unit: optStr(24),
    description: optStr(280),
    source: optStr(200),
    period: optStr(80),
    animate: z.boolean(),
    featured: z.boolean(),
  }),
  event_results: z.object({
    category: z.enum(["media", "organic", "paid", "impressions", "engagement", "attendance", "activation", "other"]),
    label: str(120).min(1, "Informe o título."),
    value: num,
    prefix: optStr(8),
    unit: optStr(24),
    previous_value: optNum,
    description: optStr(280),
    source: optStr(200),
    period: optStr(80),
  }),
  event_audience: z.object({
    dimension: z.enum(["age", "gender", "region", "socioeconomic", "interests", "consumption", "professional", "other"]),
    title: str(120).min(1, "Informe o título."),
    chart_type: z.enum(["bar", "donut", "stat", "map"]),
    data: z.array(z.object({ label: str(60).min(1), value: num, code: optStr(4) })).min(1, "Adicione ao menos um dado.").max(30),
    unit: optStr(12),
    source: optStr(200),
    period: optStr(80),
    note: optStr(280),
  }),
  event_testimonials: z.object({
    context: z.enum(["audience", "sponsor", "results"]),
    quote: str(600).min(2, "Escreva o depoimento."),
    author: str(120).min(1, "Informe o autor."),
    role: optStr(120),
    company: optStr(120),
    avatar_url: url,
  }),
  sponsorship_opportunities: z.object({
    category: z.enum(["naming_rights", "master", "official", "category", "activation", "booth", "experience", "digital_media", "audiovisual", "institutional", "custom"]),
    title: str(120).min(1, "Informe o título."),
    description: optStr(1200),
    deliverables: lines,
    image_url: url,
    enabled: z.boolean(),
  }),
  sponsorship_tiers: z
    .object({
      name: str(60).min(1, "Informe o nome da cota."),
      tagline: optStr(140),
      description: optStr(1200),
      price: optNum.refine((v) => v == null || v >= 0, "Valor inválido"),
      currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).default("BRL"),
      show_price: z.boolean(),
      quantity_total: optNum.refine((v) => v == null || (Number.isInteger(v) && v >= 0), "Quantidade inválida"),
      quantity_sold: z.coerce.number().int().min(0, "Quantidade inválida"),
      deliverables: lines,
      benefits: lines,
      image_url: url,
      highlight: z.boolean(),
      enabled: z.boolean(),
    })
    .refine((t) => t.quantity_total == null || t.quantity_sold <= t.quantity_total, { message: "Vendidas não pode passar do total.", path: ["quantity_sold"] }),
  event_sponsors: z.object({
    sponsor_id: z.uuid("Selecione a marca."),
    relation: z.enum(["past", "current", "institutional", "supporter", "media"]),
    tier_label: optStr(60),
    case_title: optStr(140),
    case_body: optStr(1200),
  }),
  event_media: z.object({
    folder: z.string().regex(/^[a-z0-9-]{1,40}$/),
    caption: optStr(280),
    alt: optStr(280),
    credit: optStr(120),
    in_gallery: z.boolean(),
    featured: z.boolean(),
    poster_url: url,
  }),
} as const;

export type CollectionTable = keyof typeof collectionSchemas;
export const COLLECTION_TABLES = Object.keys(collectionSchemas) as CollectionTable[];

export const sponsorSchema = z.object({
  name: str(120).min(1, "Informe o nome da marca."),
  logo_url: url,
  website: z.string().trim().refine((v) => v === "" || /^https?:\/\//.test(v), "Use https://").transform((v) => v || null).nullable().optional(),
  segment: optStr(80),
});
