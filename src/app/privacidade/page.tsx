import type { Metadata } from "next";
import Link from "next/link";
import { EVENTO } from "@/content/evento";

export const metadata: Metadata = { title: "Política de privacidade", alternates: { canonical: "/privacidade" } };

export default function Privacy() {
  const e = EVENTO.event;
  const controller = e.organizer_name || "a organização do evento";
  const dpo = e.privacy_contact_email || e.contact_email;

  return (
    <main className="min-h-dvh bg-paper px-5 py-16 text-ink md:py-24">
      <article className="mx-auto max-w-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-3xl [&_li]:mt-1 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 text-[15px] text-ink-2">
        <Link href="/" className="text-sm text-mute hover:text-ink">← {e.name}</Link>
        <h1 className="mt-6 font-display text-5xl leading-none text-ink md:text-6xl">Política de privacidade</h1>
        <p className="text-sm text-mute">Lei nº 13.709/2018 (LGPD)</p>

        <h2>Quem trata os seus dados</h2>
        <p>O controlador dos dados é <strong>{controller}</strong>{e.organizer_document ? ` (${e.organizer_document})` : ""}, responsável pelo evento {e.name}.</p>

        <h2>Quais dados coletamos</h2>
        <p>Ao enviar o formulário, seus dados (nome, empresa, cargo, e-mail, telefone, segmento, interesse, cota, mensagem e a página de origem) são encaminhados à equipe comercial do evento por meio de uma ferramenta de automação, usada apenas para registrar e responder o seu contato. O site em si não guarda esses dados. Se o envio automático não estiver disponível, a mensagem é aberta no seu WhatsApp ou no seu aplicativo de e-mail e só chega até nós quando você confirma o envio.</p>

        <h2>Para que usamos</h2>
        <ul>
          <li>Responder ao seu interesse e conduzir a negociação de patrocínio deste evento (base legal: consentimento e procedimentos preliminares a contrato).</li>
          <li>Enviar novidades sobre outros projetos, apenas se você pedir.</li>
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
