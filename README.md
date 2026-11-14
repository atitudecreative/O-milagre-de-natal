# Palco — Plataforma de apresentação de eventos e captação de patrocínios

Plataforma para transformar qualquer evento em uma apresentação comercial digital: identidade visual própria, números, público, resultados, oportunidades, cotas e um formulário que vira lead dentro de um CRM.

- **Página pública por evento**: `/eventos/<slug>`, montada com os dados cadastrados no painel. Nenhuma página é escrita à mão.
- **Painel administrativo**: `/admin`, com dashboard, eventos, assistente de criação, editor em 18 abas, biblioteca de mídia, leads/CRM, marcas, equipe e auditoria.
- **Apresentação em PDF**: `/eventos/<slug>/apresentacao.pdf`, gerada com a identidade do evento.
- **Evento demonstrativo**: *Solarmar Festival*. É fictício e vem marcado como demonstração na página, no PDF e nas fontes dos dados.

---

## Sumário
1. [Stack e arquitetura](#1-stack-e-arquitetura)
2. [Rodando localmente](#2-rodando-localmente)
3. [Publicando (Supabase + Vercel)](#3-publicando-supabase--vercel)
4. [Variáveis de ambiente](#4-variáveis-de-ambiente)
5. [Perfis e permissões](#5-perfis-e-permissões)
6. [Como usar](#6-como-usar)
7. [Banco de dados](#7-banco-de-dados)
8. [Segurança, LGPD e rastreamento](#8-segurança-lgpd-e-rastreamento)
9. [Testes](#9-testes)
10. [Critérios de aceitação](#10-critérios-de-aceitação)
11. [Decisões e próximos passos](#11-decisões-e-próximos-passos)

---

## 1. Stack e arquitetura

| Camada | Tecnologia |
|---|---|
| App | Next.js 16 (App Router, Server Actions, ISR), React 19, TypeScript |
| Estilo | Tailwind CSS 4. Design system próprio do painel; variáveis `--ev-*` por evento |
| Animação | Motion (Framer Motion) e CSS. Respeita `prefers-reduced-motion` |
| Dados | Supabase: PostgreSQL, Auth, Storage, RLS |
| Gráficos | SVG próprio (sem biblioteca), renderizado no servidor ou animado no cliente |
| PDF | `@react-pdf/renderer` + `sharp` (converte WebP/AVIF/SVG para o PDF) |
| Validação | Zod no servidor e validação imediata no cliente |
| Hospedagem | Vercel (app) + Supabase (dados e arquivos) |

```
src/
  app/
    eventos/[slug]/           página pública (ISR), privacidade, PDF, imagem Open Graph
    admin/                    painel protegido (dashboard, eventos, leads, marcas, equipe, atividade)
    preview/[id]/             pré-visualização de rascunhos (somente equipe)
    api/leads, api/track      captação de leads e analytics interno (público)
    api/admin/...             exportação CSV, PDF de rascunho, notificações
    login, recuperar-senha, redefinir-senha, auth/confirm
  actions/                    server actions (regras de negócio + auditoria)
  components/public/          seções da página do evento (11 seções)
  components/admin/           painel: editores, mídia, CRM, assistente
  lib/                        auth/permissões, dados, validação, tema, formatação, PDF
  proxy.ts                    renovação de sessão e proteção de rotas
supabase/
  migrations/                 esquema, RLS, funções, storage
  seed.sql                    evento demonstrativo
scripts/                      criação de admin e testes
```

**Como um evento ganha cara própria:** a identidade do evento (5 cores, 2 fontes, cantos, textura, grão) vira variáveis CSS em `lib/theme.ts`. Todos os componentes públicos usam só essas variáveis. A mesma arquitetura de 11 seções serve para qualquer evento, e cada seção pode ser ligada, desligada, reordenada e editada.

**Dados reais × projeções:** indicadores têm `kind = actual | projection`. Projeções aparecem só na seção "Próxima edição" (ou num bloco separado, se você ativar), com hachura, borda tracejada e o selo "Projeção". Todo indicador tem campos de fonte e período.

---

## 2. Rodando localmente

Pré-requisitos: Node 20.9+, Docker (para o Supabase local).

```bash
npm install
```

```bash
npm run db:start
```

O comando acima sobe o Postgres, Auth, Storage e Mailpit. Ao terminar, ele imprime a URL e as chaves. Copie `.env.example` para `.env.local` e preencha com elas:

```bash
cp .env.example .env.local
```

No ambiente local, use `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` e as chaves `ANON_KEY` e `SERVICE_ROLE_KEY` exibidas pelo `db:start`.

Aplique as migrações e o evento demonstrativo:

```bash
npm run db:reset
```

Crie o primeiro administrador:

```bash
npm run admin:create -- voce@empresa.com.br "Senha-Forte-123" "Seu Nome" admin
```

Inicie o app:

```bash
npm run dev
```

- Site: http://localhost:3000. Evento demo: http://localhost:3000/eventos/solarmar-festival
- Painel: http://localhost:3000/admin
- E-mails locais (recuperação de senha, convites): http://127.0.0.1:54324 (Mailpit)

Para testar os três perfis, crie também um editor e um comercial (os testes automatizados usam estes dados):

```bash
npm run admin:create -- admin@palco.local "Palco-2026-admin" "Ana Admin" admin
```

```bash
npm run admin:create -- editor@palco.local "Palco-2026-editor" "Edu Editor" editor
```

```bash
npm run admin:create -- comercial@palco.local "Palco-2026-comercial" "Carla Comercial" commercial
```

> Esses usuários existem só no seu banco local. Nunca use essas senhas em produção.

---

## 3. Publicando (Supabase + Vercel)

### 3.1 Supabase
1. Crie um projeto em https://supabase.com (região São Paulo, de preferência).
2. Aplique as migrações. Com a CLI:

   ```bash
   npx supabase login
   ```

   ```bash
   npx supabase link --project-ref <ref-do-projeto>
   ```

   ```bash
   npx supabase db push
   ```

   Sem a CLI, cole o conteúdo de `supabase/migrations/*.sql`, em ordem, no SQL Editor.
3. **Opcional:** para ter o evento demonstrativo em produção, rode `supabase/seed.sql` no SQL Editor. Ele fica marcado como demonstração e com `noindex`.
4. Em **Authentication → URL Configuration**:
   - Site URL: `https://seu-dominio.com.br`
   - Redirect URLs: `https://seu-dominio.com.br/**`
5. Em **Authentication → Providers → Email**: desative "Allow new users to sign up". A equipe entra só por convite.
6. Em **Authentication → SMTP**: configure um SMTP próprio. O e-mail padrão do Supabase tem limite baixo de envio e afeta convites e recuperação de senha.

### 3.2 Vercel
1. Importe o repositório na Vercel. O framework (Next.js) é detectado automaticamente.
2. Cadastre as variáveis da [seção 4](#4-variáveis-de-ambiente) em *Production* e *Preview*.
3. Faça o deploy e crie o primeiro admin apontando o script para o projeto de produção:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-admin.mjs voce@empresa.com.br "Senha-Forte" "Seu Nome" admin
   ```

4. Configure o domínio próprio e atualize `NEXT_PUBLIC_SITE_URL`.

### 3.3 Alternativa: Render
O repositório inclui um `render.yaml`. No Render, use **New → Blueprint** e aponte para o repositório, ou crie um Web Service com build `npm ci && npm run build` e start `npm start`. Preencha as variáveis da seção 4 **antes do primeiro build**: as `NEXT_PUBLIC_*` são embutidas no código durante o build, então alterá-las depois exige um novo deploy.

> O `next.config.ts` libera imagens de `*.supabase.co` e `images.unsplash.com`. Para outra CDN de imagens, adicione-a em `images.remotePatterns`.

---

## 4. Variáveis de ambiente

| Variável | Obrigatória | Onde é usada |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | sim | Links absolutos (e-mails, sitemap, PDF, Open Graph) |
| `NEXT_PUBLIC_SUPABASE_URL` | sim | Cliente Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | Chave pública. Pode ir ao navegador: o RLS protege os dados |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | **Somente servidor**: convites de equipe e notificações de lead |
| `APP_SECRET` | sim | Sal do hash irreversível de IP (antispam) |
| `RESEND_API_KEY`, `LEAD_NOTIFY_FROM`, `LEAD_NOTIFY_TO` | não | E-mail de novo lead |
| `LEAD_WEBHOOK_URL` | não | Webhook de novo lead (CRM externo, Slack, Zapier) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | não | Cloudflare Turnstile no formulário (só é exigido com as duas chaves) |

Nenhuma chave secreta tem o prefixo `NEXT_PUBLIC_`. O cliente com service role (`lib/supabase/admin.ts`) importa `server-only`, então o build falha se alguém tentar usá-lo no navegador.

---

## 5. Perfis e permissões

As permissões vivem no banco (tabela `role_permissions`) e são checadas em três camadas: servidor (`assertPermission`), interface (botões e campos) e **RLS no Postgres**, que é a garantia final.

| Permissão | Administrador | Editor | Comercial |
|---|:-:|:-:|:-:|
| Ver eventos | ✓ | ✓ | ✓ |
| Criar/editar eventos, conteúdo e identidade | ✓ | ✓ | — |
| Publicar/despublicar | ✓ | ✓ | — |
| Excluir eventos | ✓ | — | — |
| Mídia e marcas | ✓ | ✓ | — |
| Atualizar vendas das cotas | ✓ | (via edição) | ✓ (só a quantidade vendida) |
| Ver/gerenciar leads e exportar CSV | ✓ | — | ✓ |
| Acessos e conversões | ✓ | ✓ | ✓ |
| Equipe, auditoria, eliminação de dados (LGPD) | ✓ | — | — |

**Permissões personalizadas no futuro:** basta inserir novas linhas em `role_permissions` (ou criar uma tabela de permissões por usuário). As políticas usam `has_permission('...')`, sem papéis fixos no código.

Usuário novo nasce **sem acesso** e vê a tela "Acesso pendente" até um admin definir o perfil em **Equipe**. Um usuário não consegue alterar o próprio papel: há trigger e RLS para isso.

---

## 6. Como usar

### Criar um evento (assistente em 6 etapas)
**Eventos → Novo evento**, do zero ou duplicando outro:
1. **Informações básicas**: nome, endereço (slug automático e editável), slogan, datas, local, edição, descrição.
2. **Identidade visual**: logos, favicon, 5 cores (com paletas de partida e verificação de contraste), fontes, cantos, textura e grão. A pré-visualização atualiza em tempo real.
3. **Conteúdo**: abertura (imagem desktop/mobile, vídeo, alinhamento, altura, escurecimento), seções (ativar e reordenar), galeria e depoimentos.
4. **Indicadores e resultados**: números com fonte e período, público (barras, rosca, indicadores ou mapa por UF) e resultados com comparativo entre edições.
5. **Comercial**: oportunidades, cotas (valor visível ou "sob consulta", quantidade, contrapartidas, benefícios, destaque), patrocinadores e contatos.
6. **Publicação**: SEO, imagem de compartilhamento, checklist de revisão, pré-visualização e publicação com confirmação.

O endereço público é gerado a partir do slug: `/eventos/<slug>`.

**Duplicar** copia estrutura, conteúdo, identidade e, se você quiser, cotas (com vendas zeradas) e mídias. **Nunca** copia leads, histórico, analytics, patrocinadores vinculados nem IDs de rastreamento.

### Editor do evento
São 18 abas em 4 grupos (Evento, Conteúdo, Comercial, Publicação). Os formulários avisam quando há alterações não salvas e pedem confirmação antes de publicar, despublicar, arquivar e excluir. A exclusão exige digitar o nome do evento.

### Biblioteca de mídia
Upload por arrastar e soltar, com pastas, legenda, texto alternativo, crédito, "exibir na galeria", "destaque", substituição de arquivo (atualiza todas as referências) e exclusão. As imagens são redimensionadas no navegador (máx. 2560 px, WebP) antes do envio. A página pública entrega AVIF/WebP no tamanho de cada tela via `next/image`, com lazy loading. Vídeos entram por arquivo MP4 ou por link do YouTube/Vimeo.

### Leads / CRM
- Lista com busca, filtros (evento, status, interesse, período, origem), paginação e exportação CSV. O CSV é protegido contra injeção de fórmulas e usa `;` e UTF-8 com BOM para abrir direto no Excel.
- Detalhe do lead: status em um clique (Novo → Em contato → Em negociação → Proposta enviada → Fechado/Perdido), responsável, valor estimado, histórico de contatos (ligação, e-mail, WhatsApp, reunião, proposta, observação), origem da conversão (botão clicado + UTMs + referência) e o registro do consentimento.
- Notificações: contador no menu, aviso dentro do painel (verificação a cada 45 s) e, se configurado, e-mail ou webhook.
- Indicadores: taxa de fechamento por perfil comercial; conversão por evento (leads ÷ visitantes) no dashboard.

---

## 7. Banco de dados

Tabelas: `profiles` (+ `auth.users`), `role_permissions`, `events`, `event_branding`, `event_sections`, `event_metrics`, `event_media`, `event_testimonials`, `event_audience`, `event_results`, `sponsorship_opportunities`, `sponsorship_tiers`, `sponsors`, `event_sponsors`, `leads`, `lead_interactions`, `event_analytics`, `event_integrations`, `audit_logs`.

Destaques:
- **Chaves estrangeiras com `on delete cascade`** a partir de `events`. **Índices** nos acessos frequentes (evento + posição, leads por data/status, analytics por evento/nome).
- **Restrições `check`** para slug, cores `#RRGGBB`, e-mails, IDs de Pixel/GA4/GTM, tamanhos de texto, datas, e `vendidas ≤ total`.
- **Triggers:** criação automática de seções, identidade e integrações para cada evento novo; histórico automático de mudança de status do lead; validação da cota do lead (mesmo evento); datas de publicação e arquivamento; bloqueio de autopromoção de perfil; comercial só altera `quantity_sold`.
- **RPC:** `duplicate_event`, `dashboard_overview`, `event_funnel`, `event_lead_counts`, `lead_recent_count` (antispam).
- **View pública `public_event_tracking`:** expõe só os IDs de rastreamento de eventos publicados (os e-mails de notificação ficam ocultos).
- **Storage:** bucket `media` público para leitura, com escrita restrita por permissão, limite de 50 MB e tipos de arquivo permitidos.

Depois de mudar o esquema, gere os tipos de novo:

```bash
npm run db:types
```

---

## 8. Segurança, LGPD e rastreamento

**Segurança**
- Supabase Auth com cookies httpOnly (`@supabase/ssr`) e renovação de sessão no `proxy.ts`. Rotas `/admin` e `/preview` redirecionam para o login.
- Recuperação de senha por e-mail. A resposta é a mesma exista ou não a conta (evita enumeração de usuários). Senha com no mínimo 8 caracteres, letras e números.
- Todas as server actions validam a permissão e os dados com Zod. O RLS repete a regra no banco.
- Conteúdo é exibido como texto pelo React, sem HTML livre. O JSON-LD é escapado. O jsonb de configurações das seções é sanitizado (chaves, tipos e tamanhos).
- Cabeçalhos: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
- Auditoria (`audit_logs`) de criar, editar, publicar, duplicar, excluir, exportar, convidar e mudar status.

**Antispam no formulário:** campo honeypot, tempo mínimo de preenchimento, limite de 5 envios a cada 10 min por IP (hash), validação no servidor e Turnstile opcional. Bots recebem "ok" e nada é gravado.

**LGPD**
- Consentimento obrigatório e registrado (data e versão). Opt-in de marketing separado.
- IP armazenado só como hash irreversível.
- Política de privacidade gerada por evento (`/eventos/<slug>/privacidade`) com controlador, finalidades, bases legais, retenção e canal do encarregado.
- Eliminação definitiva do lead (admin) para atender pedidos de titulares.
- Dados de gênero e outros dados sensíveis: o painel orienta a publicar apenas dados agregados e com consentimento.

**Rastreamento por evento**
- Cada evento tem seu próprio Meta Pixel, GA4 e GTM, além de um interruptor para pausar sem apagar os IDs.
- Os scripts externos **só carregam depois do aceite de cookies** e só nos eventos que os configuraram.
- Eventos registrados: `page_view`, `cta_click`, `tiers_view` (seção realmente visível), `form_start`, `form_submit`, `whatsapp_click`, `deck_download`. São mapeados para GA4 (`generate_lead`, `file_download`…) e Meta (`Lead`, `Contact`, `ViewContent`…).
- **A conversão de lead só dispara depois que o servidor confirma o registro.**
- O analytics interno (sem cookies, `sessionStorage`) alimenta a aba "Acessos e conversões" (funil, origem, dispositivo, série diária) e o dashboard. Bots e navegadores headless são ignorados.

---

## 9. Testes

Com o Supabase local rodando e os usuários de teste criados:

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run test:rls
```

O `test:rls` executa 26 verificações de RLS e permissões: visitante anônimo, editor e comercial, além da duplicação.

Com o app rodando (`npm run dev`), em outro terminal:

```bash
npm run test:e2e
```

O `test:e2e` usa Playwright e percorre o fluxo completo: assistente → identidade → abertura → indicador → cota (incluindo erro de validação) → contatos → rascunho com 404 → publicar → lead com cota pré-selecionada e consentimento obrigatório → lead no painel → mudança de status e histórico → CSV → PDF.

---

## 10. Critérios de aceitação

| # | Critério | Onde |
|---|---|---|
| 1 | Criar evento pelo painel | Eventos → Novo evento (assistente) |
| 2 | Personalizar a identidade visual | Editor → Identidade visual (pré-visualização em tempo real) |
| 3 | Configurar todas as seções | Editor → Seções e ordem + uma aba por seção |
| 4 | Inserir e alterar indicadores | Editor → Indicadores / Próxima edição |
| 5 | Cotas e contrapartidas | Editor → Cotas / Oportunidades |
| 6 | Site público mostra os dados cadastrados | `/eventos/<slug>` (ISR, invalidado a cada alteração) |
| 7 | URL independente por evento | slug único, validado e editável |
| 8 | Formulário registra leads | `/api/leads` → tabela `leads` (RLS: só eventos publicados) |
| 9 | Leads no painel | Leads (lista, filtros, detalhe, CSV) |
| 10 | Controle de permissões | `role_permissions` + RLS + `scripts/test-rls.mjs` |
| 11 | Desktop e mobile | Layout próprio no celular: barra de conversão, menu em tela cheia, cotas em carrossel, sem rolagem horizontal |
| 12 | PDF comercial | `/eventos/<slug>/apresentacao.pdf` e botão "PDF" no editor |
| 13 | Rastreamento individual | Editor → Rastreamento (IDs por evento, só com consentimento) |
| 14 | Sem erros críticos | typecheck, lint, build, testes de RLS e E2E |
| 15 | Documentação | este arquivo |

---

## 11. Decisões e próximos passos

- **Fontes por evento:** lista curada de 16 Google Fonts, carregadas sob demanda só na página do evento. Para adicionar uma fonte, edite `src/lib/fonts.ts`.
- **Mapa do público:** cartograma em grade de UFs. É leve, legível no celular e não precisa de biblioteca de mapas.
- **Imagens do demo:** Unsplash (licença livre). Os logos de marcas são SVGs fictícios em `public/demo/`.
- **Itens que dependem de credenciais ou contas externas:** projeto Supabase de produção, domínio, SMTP próprio, Resend (e-mail de lead), Cloudflare Turnstile e os IDs de Pixel/GA4/GTM de cada evento.
- **Ideias de evolução:** realtime de leads (Supabase Realtime), permissões por evento (tabela `event_members` + políticas), integração nativa com CRMs (o webhook já cobre o básico), versionamento de conteúdo e agendamento de publicação.
