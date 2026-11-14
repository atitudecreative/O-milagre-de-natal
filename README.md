# Landing page de patrocínio

Landing page para apresentar um evento a potenciais patrocinadores: abertura cinematográfica, números, galeria, perfil do público, resultados, oportunidades, cotas, marcas parceiras, próxima edição e chamada final com formulário.

Não usa banco de dados nem login. **Todo o conteúdo fica em um único arquivo: [`src/content/evento.ts`](src/content/evento.ts).**

O conteúdo atual é um evento **fictício** de demonstração (*Solarmar Festival*), identificado como tal na página.

## O que tem
- **Página única** (`/`) com 11 seções, animações, galeria em tela cheia, aftermovie, gráficos de público e comparativo entre edições. Tem layout próprio para celular: menu em tela cheia, barra fixa "Quero ser patrocinador" e cotas em carrossel.
- **Formulário de interesse:** valida os campos e abre o **WhatsApp do time comercial com a mensagem pronta** (ou o e-mail, se não houver WhatsApp). Ao clicar em "Tenho interesse" numa cota, ela já vem selecionada. Nenhum dado é guardado no site.
- **Apresentação em PDF** (`/apresentacao.pdf`), gerada automaticamente a partir do mesmo conteúdo.
- **Política de privacidade** (`/privacidade`), aviso de cookies e Meta Pixel / Google Analytics / Tag Manager opcionais (só carregam com o aceite do visitante).
- **SEO:** metadados, imagem de compartilhamento gerada automaticamente, sitemap, robots e dados estruturados.

## Como editar o conteúdo
Abra `src/content/evento.ts`. Cada bloco está comentado:

| Bloco | O que muda |
|---|---|
| `event` | nome, slogan, datas, local, contatos, **WhatsApp que recebe os interessados**, SEO |
| `branding` | 5 cores, fontes (opções em `src/lib/fonts.ts`), logo, cantos, grão |
| `sections` | textos de cada seção, imagens da abertura, aftermovie, novidades da próxima edição. `enabled: false` esconde uma seção |
| `metrics` | números (`kind: "projection"` para metas da próxima edição) — sempre com fonte e período |
| `media` | fotos da galeria (`in_gallery: true`) e de ativações (`folder: "ativacoes"`) |
| `audience`, `results` | gráficos do público e resultados (com `previous_value` aparece o % de crescimento) |
| `opportunities`, `tiers` | formatos de patrocínio e cotas (`show_price: false` mostra "Sob consulta") |
| `sponsors`, `testimonials` | marcas parceiras e depoimentos |
| `tracking` | IDs de Meta Pixel / GA4 / GTM (opcional) |

**Fotos próprias:** coloque os arquivos em `public/` (ex.: `public/fotos/palco.jpg`) e use `"/fotos/palco.jpg"` no conteúdo. Para usar fotos de outro domínio, adicione-o em `images.remotePatterns` no `next.config.ts`.

Ao trocar pelo evento real, mude `is_demo` para `false` e use apenas números verdadeiros.

## Rodando localmente

```bash
npm install
```

```bash
npm run dev
```

Abra http://localhost:3000.

## Publicando no Render
O repositório tem um `render.yaml`. Use **New → Blueprint** e aponte para o repositório, ou crie um **Web Service** com:
- Build: `npm ci && npm run build`
- Start: `npm start`

Nenhuma variável é obrigatória. Opcionalmente, defina `NEXT_PUBLIC_SITE_URL` com o domínio final (por padrão é usado o endereço do próprio Render).

Também funciona na Vercel sem nenhuma configuração.

## Stack
Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion (animações), `@react-pdf/renderer` + `sharp` (PDF).
