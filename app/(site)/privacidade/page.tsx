import type { Metadata } from 'next';
import { getSiteData } from '@/lib/content';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Política de privacidade — O Milagre do Natal', robots: { index: true, follow: true } };

export default async function Privacidade() {
  const { settings: s } = await getSiteData();
  const controller = s.legal_name || s.producer;
  const contact = s.privacy_email || s.contact_email;
  return (
    <main className="min-h-screen bg-papel py-20">
      <article className="wrap max-w-3xl">
        <a href="/" className="pill pill-ghost pill-sm">← Voltar ao site</a>
        <h1 className="display mt-10 text-5xl sm:text-7xl">Política de privacidade</h1>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-carbon/80 [&_h2]:display [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-carbon">
          <p>
            Esta política explica como {controller}
            {s.legal_document ? ` (CNPJ ${s.legal_document})` : ''}, responsável pelo site do musical {s.event_name}, trata os dados pessoais
            enviados pelos formulários, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
          <h2>Quais dados coletamos</h2>
          <p>
            Nome, empresa, e-mail, telefone, segmento, cota de interesse e mensagem informados por você; data e hora do envio; página e origem da
            visita (parâmetros UTM e site de referência); navegador utilizado e um identificador criptografado do endereço IP, usado apenas para
            prevenção de spam.
          </p>
          <h2>Para que usamos</h2>
          <p>
            Para responder ao seu interesse comercial, enviar o mídia kit solicitado e conduzir a negociação de patrocínio. A base legal é o seu
            consentimento (art. 7º, I) e o procedimento preliminar a contrato a seu pedido (art. 7º, V).
          </p>
          <h2>Compartilhamento</h2>
          <p>
            Os dados são acessados apenas pela equipe da organização e por fornecedores que operam a infraestrutura do site, envio de e-mails e
            ferramentas de relacionamento (CRM), sob dever de confidencialidade. Não vendemos dados pessoais.
          </p>
          <h2>Cookies e medição</h2>
          <p>
            Quando ativadas, ferramentas de medição (Google Analytics 4 e Meta Pixel) registram a navegação de forma agregada para avaliar o
            desempenho das campanhas. O painel administrativo usa apenas um cookie de sessão estritamente necessário.
          </p>
          <h2>Retenção</h2>
          <p>Mantemos os dados pelo tempo necessário à negociação e às obrigações legais, ou até que você solicite a exclusão.</p>
          <h2>Seus direitos</h2>
          <p>
            Você pode solicitar confirmação, acesso, correção, anonimização, portabilidade ou exclusão dos seus dados, bem como revogar o
            consentimento{contact ? (
              <>
                {' '}pelo e-mail <a className="font-bold underline" href={`mailto:${contact}`}>{contact}</a>
              </>
            ) : ' pelos canais de contato informados no site'}
            .
          </p>
        </div>
      </article>
    </main>
  );
}
