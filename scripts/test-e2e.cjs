// Teste ponta a ponta (Playwright): cria evento pelo assistente, edita, publica, envia lead e opera o CRM.
// Uso: com o app rodando em http://localhost:3000 e o banco local populado: node scripts/test-e2e.cjs
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const log = (...a) => console.log('•', ...a);
async function login(b, email, pass) {
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' }); await p.fill('#email', email); await p.fill('#password', pass);
  await p.click('button[type=submit]'); await p.waitForFunction(() => location.pathname.startsWith('/admin'), null, { timeout: 30000 });
  return p;
}
(async () => {
  const b = await chromium.launch();
  const p = await login(b, 'admin@palco.local', 'Palco-2026-admin'); log('login ok');
  // 1. Wizard step 1
  await p.goto(BASE + '/admin/eventos/novo');
  await p.fill('#n-name', 'Conferência Teste E2E');
  await p.fill('#n-tagline', 'Inovação e negócios');
  await p.fill('#n-start', '2027-05-10'); await p.fill('#n-end', '2027-05-11');
  await p.fill('#n-city', 'São Paulo'); await p.fill('#n-state', 'SP'); await p.fill('#n-venue', 'Centro de Convenções');
  await p.fill('#n-desc', 'Dois dias de conteúdo e networking para líderes.');
  await p.click('button:has-text("Criar e seguir")'); await p.waitForFunction(() => location.pathname.includes('/assistente/2'), null, { timeout: 30000 });
  const eventId = p.url().split('/')[5];
  log('evento criado', eventId);
  // 2. Branding: apply preset & save
  await p.click('text=Corporativo'); await p.click('text=Salvar alterações');
  await p.waitForSelector('text=Identidade visual salva.', { timeout: 15000 }); log('identidade salva');
  // 3. Hero: overlay + title
  await p.goto(`${BASE}/admin/eventos/${eventId}/abertura`);
  await p.fill('textarea[id^="t-"]', 'Conferência Teste');
  await p.click('text=Salvar alterações'); await p.waitForSelector('text=Seção salva.'); log('abertura salva');
  // 4. Add metric
  await p.goto(`${BASE}/admin/eventos/${eventId}/indicadores`);
  await p.click('button:has-text("Adicionar indicador")');
  await p.fill('#f-metrics-label', 'Participantes'); await p.fill('#f-metrics-value', '3500'); await p.fill('#f-metrics-unit', 'pessoas'); await p.fill('#f-metrics-source', 'Credenciamento 2026');
  await p.click('button:has-text("Adicionar"):not(:has-text("indicador"))'); await p.waitForSelector('text=Item adicionado.'); log('indicador adicionado');
  // 5. Add tier
  await p.goto(`${BASE}/admin/eventos/${eventId}/cotas`);
  await p.click('button:has-text("Adicionar cota")');
  await p.fill('#f-tiers-name', 'Diamante'); await p.fill('#f-tiers-price', '150000'); await p.fill('#f-tiers-quantity_total', '3');
  await p.fill('#f-tiers-deliverables', 'Palestra de 15 minutos\nEstande 6x3');
  await p.click('button:has-text("Adicionar"):not(:has-text("cota"))'); await p.waitForSelector('text=Item adicionado.'); log('cota adicionada');
  // validation error: sold > total
  await p.click('text=Diamante'); await p.fill('#f-tiers-quantity_sold', '9'); await p.click('button:has-text("Salvar")');
  await p.waitForSelector('text=Vendidas não pode passar do total.'); log('validação de cota OK');
  // 6. Contacts
  await p.goto(`${BASE}/admin/eventos/${eventId}/contatos`);
  await p.fill('#c-organizer_name', 'Empresa Teste'); await p.fill('#c-contact_email', 'vendas@teste.com'); await p.fill('#c-whatsapp', '5511999990000');
  await p.click('text=Salvar alterações'); await p.waitForSelector('text=Contatos salvos.'); log('contatos salvos');
  // draft not public
  const anon = await b.newPage();
  const r1 = await anon.goto(`${BASE}/eventos/conferencia-teste-e2e`); log('rascunho público status', r1.status());
  // 7. Publish
  await p.goto(`${BASE}/admin/eventos/${eventId}/publicar`);
  await p.click('main button:has-text("Publicar")'); await p.click('dialog button:has-text("Publicar agora")');
  await p.waitForSelector('text=Publicado em', { timeout: 15000 }); log('publicado');
  const r2 = await anon.goto(`${BASE}/eventos/conferencia-teste-e2e`, { waitUntil: 'networkidle' }); log('público status', r2.status());
  // 8. Submit lead
  await anon.click('a:has-text("Tenho interesse")'); await anon.waitForTimeout(3000);
  await anon.fill('#lf-full_name', 'Maria Teste'); await anon.fill('#lf-company', 'ACME Testes'); await anon.fill('#lf-job_title', 'Diretora');
  await anon.fill('#lf-email', 'maria@acme.com'); await anon.fill('#lf-phone', '11988887777');
  await anon.selectOption('#lf-segment', 'Tecnologia e telecom'); await anon.selectOption('#lf-interest', { index: 1 });
  log('cota pré-selecionada', await anon.$eval('#lf-tier_id', (e) => e.options[e.selectedIndex].text));
  await anon.click('button[type=submit]'); await anon.waitForSelector('text=Consentimento', { state: 'detached' }).catch(() => {});
  log('erro sem consentimento visível', await anon.isVisible('text=É preciso concordar'));
  await anon.check('#lf-consent'); await anon.click('button[type=submit]');
  await anon.waitForSelector('text=Obrigado.', { timeout: 15000 }); log('lead enviado');
  // 9. Lead in admin
  await p.goto(`${BASE}/admin/leads`); const has = await p.isVisible('text=ACME Testes'); log('lead no painel', has);
  await p.click('a:has-text("ACME Testes")'); await p.waitForFunction(() => /leads\/.+/.test(location.pathname));
  log('cota no lead', await p.isVisible('text=Diamante'));
  await p.click('button[role=radio]:has-text("Em negociação")'); await p.waitForSelector('text=Status atualizado.');
  await p.fill('textarea[aria-label="Registro"]', 'Ligação inicial, pediu proposta.'); await p.click('button:has-text("Registrar")');
  await p.waitForSelector('text=Registro adicionado'); await p.reload();
  log('histórico tem mudança de status', await p.isVisible('text=Mudança de status'));
  // CSV
  const csv = await p.evaluate(async () => (await fetch('/api/admin/leads/export')).text()); log('csv linhas', csv.split('\r\n').length, csv.includes('ACME Testes'));
  // PDF
  const pdf = await p.evaluate(async (id) => { const r = await fetch(`/api/admin/events/${id}/pdf`); return [r.status, r.headers.get('content-type')]; }, eventId); log('pdf', pdf);
  // 10. Duplicate
  await p.goto(`${BASE}/admin/eventos`);
  console.log(JSON.stringify({ eventId }));
  await b.close();
})().catch((e) => { console.error('FALHOU', e.message); process.exit(1); });
