import { z } from "./zod";

/** E-mails pessoais comuns — avisamos, mas não bloqueamos (pequenas empresas usam). */
export const FREE_EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "yahoo.com.br", "icloud.com", "live.com", "bol.com.br", "uol.com.br"];

export const SEGMENTS = [
  "Alimentos e bebidas", "Automotivo", "Bancos e serviços financeiros", "Beleza e cuidados pessoais",
  "Construção e imobiliário", "Educação", "Energia", "Esportes", "Governo e setor público",
  "Indústria", "Moda e varejo", "Saúde", "Seguros", "Tecnologia e telecom", "Turismo e hotelaria",
  "Mídia e entretenimento", "Outro",
];

const trimmed = (max: number) => z.string().trim().max(max);

export const leadSchema = z.object({
  event_id: z.uuid(),
  tier_id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  full_name: trimmed(120).min(3, "Informe seu nome completo."),
  company: trimmed(160).min(2, "Informe a empresa."),
  job_title: trimmed(120).min(2, "Informe seu cargo."),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("Informe um e-mail válido.")),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
  segment: trimmed(120).min(2, "Selecione o segmento."),
  interest: trimmed(120).min(2, "Selecione o interesse."),
  message: trimmed(3000).optional().default(""),
  consent: z.literal(true, { error: "É preciso concordar com a política de privacidade." }),
  marketing_opt_in: z.boolean().optional().default(false),
  // Origem
  cta_origin: trimmed(60).optional(),
  utm_source: trimmed(120).optional(),
  utm_medium: trimmed(120).optional(),
  utm_campaign: trimmed(120).optional(),
  utm_content: trimmed(120).optional(),
  referrer: trimmed(500).optional(),
  landing_path: trimmed(500).optional(),
  // Antispam
  website: z.string().max(200).optional(), // honeypot: precisa vir vazio
  elapsed_ms: z.number().int().nonnegative().optional(),
  turnstile_token: z.string().max(4096).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;

export const CONSENT_VERSION = "2026-11-v1";
