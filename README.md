# O Milagre do Natal — plataforma de apresentação e captação de patrocínio

Site do musical **O Milagre do Natal** (12 a 15 de dezembro de 2026, Igreja Batista Atitude, Barra da Tijuca, RJ) com painel administrativo próprio. Ele apresenta o evento ao público e funciona como apresentação comercial para patrocinadores: cotas, mídia kit, formulário de interesse e acompanhamento dos contatos.

## Stack

| Camada | Escolha |
| --- | --- |
| Front-end | Next.js 15 (App Router, React 19), TypeScript, Tailwind CSS, Framer Motion |
| Banco | **Postgres / Supabase** (`DATABASE_URL`) ou **SQLite embutido do Node** (sem `DATABASE_URL`, para desenvolvimento ou VPS) |
| Arquivos | **Supabase Storage** (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) ou disco local (`DATA_DIR/uploads`) |
| Autenticação | Sessão própria com cookie assinado (HMAC) e senhas com scrypt. Três perfis de acesso |
| E-mail / CRM | Resend (opcional) e webhook genérico para CRM ou automação |
| Medição | GA4, Meta Pixel e registro interno de conversões, visível no painel |

## Rodando localmente

Requer Node 22.13 ou superior.

```bash
npm install
cp .env.example .env.local   # preencha SESSION_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
npm run dev                  # http://localhost:3000  ·  painel em /admin
```

Na primeira inicialização o app cria as tabelas, carrega o conteúdo inicial (vindo do mídia kit oficial) e cria o administrador definido no `.env`.

## Deploy no Render (configurado em `render.yaml`)

1. No Render: **New → Blueprint**, conecte o GitHub e escolha este repositório.
2. Preencha as variáveis pedidas:
   - `NEXT_PUBLIC_SITE_URL`: a URL do serviço (ex.: `https://o-milagre-do-natal.onrender.com`) ou o domínio próprio;
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD`: o primeiro administrador do painel. Use uma senha forte.
   `SESSION_SECRET` é gerado automaticamente.
3. Clique em **Apply**. O primeiro build leva alguns minutos; depois, cada push na `main` gera um deploy novo.

O blueprint usa o plano **Starter** com um **disco persistente de 1 GB** em `/var/data`, onde ficam o banco SQLite e os arquivos enviados pelo painel. Disco persistente exige plano pago e mantém uma única instância, o que basta para este site.

**Sem disco (plano free ou várias instâncias):** remova o bloco `disk` e a variável `DATA_DIR` do `render.yaml` e configure `DATABASE_URL`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (veja abaixo). No plano free, o serviço hiberna sem acesso e a primeira visita demora alguns segundos.

**Domínio próprio:** em *Settings → Custom Domains*, adicione o domínio, aponte o DNS como o Render indicar e atualize `NEXT_PUBLIC_SITE_URL`. Ela é usada no build (SEO e Open Graph), então faça um novo deploy depois de alterá-la.

Para e-mail, CRM, Turnstile e medição, adicione as variáveis opcionais de `.env.example` em *Environment*.

## Deploy em outras plataformas (Vercel + Supabase)

1. Crie um projeto no Supabase e rode `supabase/migrations/0001_init.sql` no SQL Editor. O app também cria e atualiza as tabelas sozinho; o arquivo serve para revisão e versionamento.
2. Na Vercel, configure as variáveis de `.env.example`:
   - `DATABASE_URL` com a connection string do *Transaction pooler* (porta 6543);
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_STORAGE_BUCKET=media`;
   - `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `NEXT_PUBLIC_SITE_URL`.
3. Faça o deploy. Em ambiente serverless, **`DATABASE_URL` e o Supabase Storage são obrigatórios**: o SQLite e o disco local não persistem entre execuções.

Em uma VPS ou com Docker, `npm run build && npm start` funciona com SQLite. Basta apontar `DATA_DIR` para um volume persistente.

## Painel administrativo (`/admin`)

| Perfil | Acesso |
| --- | --- |
| Administrador | Tudo, inclusive usuários |
| Editor de conteúdo | Textos, imagens, números, programação, elenco, galeria, cotas, parceiros, FAQ e mídia kit |
| Comercial | Empresas interessadas e pedidos de mídia kit (status, anotações, CSV) |

O que dá para fazer no painel:

- **Conteúdo:** todas as seções do site são editáveis, com upload de imagem e vídeo, ordenação, ocultar/exibir e remoção. As alterações são publicadas na hora.
- **Mídia kit:** envie um novo PDF em *Mídia kit (PDF)*. O link público `/api/midia-kit` é sempre o mesmo, registra o download e entrega a versão atual.
- **Contatos:** filtros, status do atendimento (novo, em contato, proposta, negociação, fechado), anotações, atalhos de e-mail e WhatsApp, exportação CSV e exclusão a pedido do titular (LGPD).
- **Visão geral:** funil comercial, conversões registradas, interesse por cota e checklist do que falta configurar.

Para adicionar um campo editável, inclua-o em `lib/schema.ts`. A coluna é criada no banco e o campo aparece no formulário do painel automaticamente.

## Formulário e anti-spam

O formulário valida no cliente e no servidor (zod) e faz:

- **Proteção contra spam:** honeypot, tempo mínimo de preenchimento, limite de envios por IP e Cloudflare Turnstile opcional.
- **LGPD:** consentimento obrigatório, com o texto aceito e a data gravados junto do lead.
- **Origem:** guarda UTM, referência, página e data de cada contato.
- **Notificação:** avisa a equipe por e-mail (Resend) e envia o JSON do lead para `CRM_WEBHOOK_URL`, caso configurados. O resultado do envio fica registrado em cada lead.

## Eventos de conversão

O helper `track()` envia o mesmo evento para GA4, Meta Pixel e para o registro interno:

| Evento | GA4 | Meta Pixel |
| --- | --- | --- |
| `sponsor_cta` (botões "Seja patrocinador") | `select_promotion` | — |
| `tier_interest` ("Tenho interesse", com a cota) | `select_item` | `ViewContent` |
| `kit_download` | `file_download` | `ViewContent` |
| `lead_submit` / `kit_request` | `generate_lead` | `Lead` |
| `whatsapp_click`, `contact_cta`, `email_click` | `contact` | `Contact` |

Os IDs do GA4 e do Pixel podem ser preenchidos no painel (*SEO e rastreamento*) ou pelo `.env`.

## Origem dos dados

- **Do mídia kit oficial 2026 e das peças de campanha:** datas, local, endereço, público de 2025 (+100 mil), expectativa de 2026 (+100 mil), cotas Bronze (R$ 10 mil), Prata (R$ 15 mil) e Ouro (R$ 25 mil) com suas contrapartidas, e as frases institucionais.
- **Demonstrativos, sinalizados no site com o selo "Demonstrativo":** alcance digital, seguidores, faixa etária e origem do público. Substitua-os por dados reais no painel.
- **Em branco até a organização informar:** WhatsApp, e-mail e telefone comerciais, redes sociais, CNPJ, e-mail do encarregado (LGPD), horários das sessões e elenco. Enquanto o WhatsApp estiver vazio, os botões levam ao formulário. O checklist do painel mostra o que ainda falta.
- **"Parceiro institucional":** entra como *Sob consulta*, com os benefícios descritos de forma genérica.

## Estrutura

```
app/(site)/            página pública, política de privacidade
app/admin/             login, painel (route group "(panel)"), server actions, exportação CSV
app/api/               leads, track, midia-kit
components/site/       seções do site
components/admin/      componentes do painel
lib/schema.ts          modelo de dados único (tabelas, formulários, validação)
lib/db/                drivers Postgres e SQLite, seed com o conteúdo inicial
supabase/migrations/   SQL para o Supabase (gerado por `npm run db:sql`)
public/media/          fotos, logotipo e mídia kit extraídos do material oficial
```
