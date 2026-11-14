import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { CONSENT_VERSION } from "@/lib/validation/lead";

/** Gera sob demanda e mantém em cache (ISR); publicar/editar invalida o cache. */
export async function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]/privacidade">): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Política de privacidade", alternates: { canonical: `/eventos/${slug}/privacidade` } };
}

export default async function Privacy({ params }: PageProps<"/eventos/[slug]/privacidade">) {
  const { slug } = await params;
  const { data: e } = await createPublicClient()
    .from("events")
    .select("name, slug, organizer_name, organizer_document, contact_email, privacy_contact_email")
    .eq("slug", slug)
    .maybeSingle();
  if (!e) notFound();
  const controller = e.organizer_name || "a organização do evento";
  const dpo = e.privacy_contact_email || e.contact_email;

  return (
    <main className="min-h-dvh bg-paper px-5 py-16 text-ink md:py-24">
      <article className="mx-auto max-w-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-3xl [&_li]:mt-1 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 text-[15px] text-ink-2">
        <Link href={`/eventos/${e.slug}`} className="text-sm text-mute hover:text-ink">← {e.name}</Link>
        <h1 className="mt-6 font-display text-5xl leading-none text-ink md:text-6xl">Política de privacidade</h1>
        <p className="text-sm text-mute">Versão {CONSENT_VERSION} · Lei nº 13.709/2018 (LGPD)</p>

        <h2>Quem trata os seus dados</h2>
        <p>O controlador dos dados é <strong>{controller}</strong>{e.organizer_document ? ` (${e.organizer_document})` : ""}, responsável pelo evento {e.name}.</p>

        <h2>Quais dados coletamos</h2>
        <ul>
          <li>Pelo formulário de interesse: nome, empresa, cargo, e-mail corporativo, telefone/WhatsApp, segmento, interesse comercial, cota desejada e mensagem.</li>
          <li>Registro do consentimento (data, hora e versão desta política).</li>
          <li>Dados técnicos mínimos: origem da visita (UTM e página de referência), tipo de dispositivo e um identificador irreversível (hash) do endereço IP, usado só para prevenir spam.</li>
          <li>Medição de navegação própria, sem cookies e sem identificar você pessoalmente.</li>
        </ul>

        <h2>Para que usamos</h2>
        <ul>
          <li>Responder ao seu interesse e conduzir a negociação de patrocínio deste evento (base legal: consentimento e procedimentos preliminares a contrato).</li>
          <li>Enviar novidades sobre outros projetos, apenas se você autorizar.</li>
          <li>Proteger o formulário contra abuso e medir o desempenho da apresentação (legítimo interesse).</li>
        </ul>

        <h2>Cookies e ferramentas de terceiros</h2>
        <p>Ferramentas como Google Analytics, Google Tag Manager ou Meta Pixel só são carregadas se você aceitar no aviso de cookies. Você pode mudar sua escolha a qualquer momento pelo link “Preferências de cookies” no rodapé.</p>

        <h2>Compartilhamento e retenção</h2>
        <p>Seus dados são acessados apenas pela equipe comercial autorizada e por fornecedores de infraestrutura (hospedagem e banco de dados) sob obrigações de confidencialidade. Não vendemos dados. Mantemos os registros pelo tempo necessário à negociação e às obrigações legais, eliminando-os quando solicitado e não houver outra base legal.</p>

        <h2>Seus direitos</h2>
        <p>Você pode solicitar confirmação, acesso, correção, portabilidade, anonimização ou eliminação dos seus dados, além de revogar o consentimento{dpo ? <> pelo e-mail <a className="underline underline-offset-4" href={`mailto:${dpo}`}>{dpo}</a></> : " pelos canais de contato do evento"}.</p>
      </article>
    </main>
  );
}
