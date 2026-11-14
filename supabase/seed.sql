-- =============================================================================
-- Evento demonstrativo — "Solarmar Festival" (FICTÍCIO)
-- Identidade, marcas, depoimentos e números são inventados para testar a
-- plataforma. Todas as fontes estão marcadas como "Dados de demonstração".
-- =============================================================================

do $$
declare
  ev uuid := '00000000-0000-4000-8000-000000000001';
  u text := 'https://images.unsplash.com/photo-';
  q text := '?auto=format&fit=crop&w=2400&q=80';
  demo text := 'Dados de demonstração (fictícios)';
  t_master uuid := '00000000-0000-4000-8000-0000000000a1';
  t_ouro uuid := '00000000-0000-4000-8000-0000000000a2';
  t_prata uuid := '00000000-0000-4000-8000-0000000000a3';
  t_apoio uuid := '00000000-0000-4000-8000-0000000000a4';
begin

insert into public.events (
  id, slug, name, tagline, short_description, description, edition_number, starts_on, ends_on,
  venue, city, state, status, is_demo, organizer_name, organizer_document, organizer_about,
  contact_name, contact_email, contact_phone, whatsapp, social_links, footer_links,
  form_success_message, privacy_contact_email, seo_title, seo_description
) values (
  ev, 'solarmar-festival', 'Solarmar Festival', 'Música, cultura e mar',
  'Três dias de música, gastronomia e cultura à beira-mar. Uma cidade inteira em festa — e um palco para marcas que querem ser lembradas.',
  'O Solarmar é um festival fictício criado para demonstrar a plataforma. Reúne palcos de música, arena gastronômica, espaço de arte urbana e uma programação de conteúdo durante três dias.',
  5, '2027-09-10', '2027-09-12',
  'Parque da Orla (fictício)', 'Recife', 'PE', 'published', true,
  'Atlântica Produções (fictícia)', 'CNPJ 00.000.000/0001-00 (exemplo)',
  'Produtora fictícia de experiências ao vivo, usada para demonstração da plataforma de patrocínios.',
  'Equipe Comercial', 'comercial@exemplo.com', '+55 81 0000-0000', '5581900000000',
  '[{"network":"Instagram","url":"https://instagram.com/"},{"network":"YouTube","url":"https://youtube.com/"},{"network":"LinkedIn","url":"https://linkedin.com/"}]',
  '[{"label":"Imprensa","url":"mailto:imprensa@exemplo.com"}]',
  'Recebemos seu interesse no Solarmar. Este é um evento demonstrativo: em um evento real, o time comercial entraria em contato em até 2 dias úteis.',
  'privacidade@exemplo.com',
  'Solarmar Festival 2027 — Patrocínio (demonstração)',
  'Evento demonstrativo da plataforma: números, público, cotas e oportunidades de patrocínio do Solarmar Festival.'
);

update public.event_branding set
  color_background = '#0D0B10', color_text = '#F5EFE6', color_accent = '#FF5B2E',
  color_primary = '#F5C542', color_secondary = '#1E1530',
  font_heading = 'Anton', font_body = 'Space Grotesk', heading_case = 'upper',
  logo_url = '/demo/solarmar-logo.svg', grain = true, corner_style = 'square'
where event_id = ev;

update public.event_integrations set notify_emails = '{}' where event_id = ev;

-- Seções -----------------------------------------------------------------------
update public.event_sections set
  title = 'Solarmar Festival',
  settings = jsonb_build_object(
    'align','left','vertical','bottom','height','screen','overlay',0.35,'title_size','xl',
    'image_desktop', u || '1470229722913-7c0e2dbbafd3' || q,
    'image_mobile', u || '1506157786151-b8491531f063' || '?auto=format&fit=crop&w=1200&h=2000&q=80',
    'primary_label','Quero ser patrocinador','secondary_label','Conheça o projeto','show_scroll_hint',true)
where event_id = ev and type = 'hero';

update public.event_sections set eyebrow = 'O evento em números',
  title = 'Uma audiência que se mede em maré cheia.',
  body = 'Cada número abaixo traz fonte e período de apuração. Em um evento real, a equipe cadastra apenas dados auditáveis — projeções ficam separadas.'
where event_id = ev and type = 'metrics';

update public.event_sections set eyebrow = 'A grandiosidade',
  title = 'Três dias em que a cidade inteira vira palco.',
  body = 'Palcos, arena gastronômica, galeria de arte urbana e uma orla tomada por gente. Uma experiência desenhada para ser vivida — e compartilhada.',
  settings = jsonb_build_object(
    'statement','Quando o sol se põe sobre o mar, 60 mil pessoas olham na mesma direção. É ali que sua marca aparece.',
    'aftermovie_url','https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    'aftermovie_poster', u || '1514525253161-7a46d19cd819' || q,
    'aftermovie_title','O filme da 4ª edição')
where event_id = ev and type = 'grandeur';

update public.event_sections set eyebrow = 'Nosso público',
  title = 'Jovem, conectado e com poder de decisão.',
  body = 'Perfil traçado a partir de pesquisa com o público (dados de demonstração).',
  settings = '{"statement":"Um público que chega cedo, fica até o fim e transforma cada ativação em conteúdo."}'
where event_id = ev and type = 'audience';

update public.event_sections set eyebrow = 'Resultados da última edição',
  title = 'O que a 4ª edição entregou.',
  body = 'Comparativo entre a 4ª e a 3ª edição. Valores fictícios, apenas para demonstração do recurso.',
  settings = '{"edition_label":"4ª edição · 2026","previous_edition_label":"3ª edição · 2025","show_comparison":true}'
where event_id = ev and type = 'results';

update public.event_sections set eyebrow = 'Oportunidades para marcas',
  title = 'Formas de estar no centro da experiência.',
  body = 'Do naming rights a ativações sob medida: cada formato combina visibilidade, experiência e conteúdo.'
where event_id = ev and type = 'opportunities';

update public.event_sections set eyebrow = 'Cotas de patrocínio',
  title = 'Escolha o tamanho da sua presença.',
  body = 'Cotas com quantidade limitada. Os valores podem ser exibidos ou tratados sob consulta.',
  settings = '{"note":"Valores e contrapartidas meramente ilustrativos. Condições finais definidas em proposta comercial."}'
where event_id = ev and type = 'tiers';

update public.event_sections set eyebrow = 'Quem já acredita no projeto',
  title = 'Marcas que já subiram ao palco com a gente.',
  body = 'Todas as marcas abaixo são fictícias e existem apenas para demonstração.',
  settings = '{"show_marquee":true}'
where event_id = ev and type = 'sponsors';

update public.event_sections set eyebrow = 'A próxima edição',
  title = '2027: maior, mais longo, mais mar.',
  body = 'A 5ª edição amplia a área, ganha um terceiro palco e estreia o Solarmar Talks, com conteúdo sobre economia criativa.',
  settings = jsonb_build_object('date_label','10 a 12 de setembro de 2027','items', jsonb_build_array(
    jsonb_build_object('title','Terceiro palco à beira-mar','description','Um palco flutuante dedicado a shows ao pôr do sol, com capacidade para 8 mil pessoas.','image_url', u || '1563841930606-67e2bce48b78' || q),
    jsonb_build_object('title','Solarmar Talks','description','Dois dias de conteúdo sobre economia criativa, música e inovação — com espaço para marcas apresentarem cases.','image_url', u || '1505373877841-8d25f7d46678' || q),
    jsonb_build_object('title','Arena gastronômica ampliada','description','30 operações de chefs regionais e um lounge corporativo para relacionamento com clientes.','image_url', u || '1511795409834-ef04bbd61622' || q)
  ))
where event_id = ev and type = 'next_edition';

update public.event_sections set eyebrow = 'Patrocine o Solarmar',
  title = 'Sua marca precisa estar onde as grandes experiências acontecem.',
  body = 'Converse com nosso time comercial e desenhe uma presença sob medida: visibilidade, experiência para o público e conteúdo que continua circulando depois do festival.',
  settings = jsonb_build_object('button_label','Quero conectar minha marca ao evento','background_image', u || '1429962714451-bb934ecdc4ec' || q)
where event_id = ev and type = 'cta';

-- Indicadores ------------------------------------------------------------------
insert into public.event_metrics (event_id, kind, label, value, unit, description, source, period, featured, position) values
  (ev, 'actual', 'Público presencial', 62000, 'pessoas', 'Somando os três dias da 4ª edição.', demo, 'Set/2026', true, 0),
  (ev, 'actual', 'Alcance digital', 18400000, 'contas', 'Contas únicas alcançadas nas redes oficiais.', demo, 'Ago–Out/2026', false, 1),
  (ev, 'actual', 'Impressões', 41000000, null, 'Orgânico + mídia paga.', demo, 'Ago–Out/2026', false, 2),
  (ev, 'actual', 'Visualizações de vídeo', 9600000, null, 'Aftermovie, cortes e transmissões.', demo, 'Set–Dez/2026', false, 3),
  (ev, 'actual', 'Marcas parceiras', 24, null, 'Entre patrocinadores, apoiadores e parceiros.', demo, '4ª edição', false, 4),
  (ev, 'actual', 'Cidades de origem do público', 186, null, 'Municípios identificados na venda de ingressos.', demo, '4ª edição', false, 5),
  (ev, 'actual', 'Taxa de engajamento', 7.8, '%', 'Média das publicações oficiais.', demo, 'Ago–Out/2026', false, 6),
  (ev, 'projection', 'Público esperado', 80000, 'pessoas', 'Com a ampliação da área e o terceiro palco.', 'Projeção da organização (demonstração)', '5ª edição · 2027', false, 0),
  (ev, 'projection', 'Alcance digital projetado', 25000000, 'contas', null, 'Projeção da organização (demonstração)', '2027', false, 1),
  (ev, 'projection', 'Dias de programação', 3, 'dias', '+ 2 dias de Solarmar Talks', 'Planejamento (demonstração)', '2027', false, 2),
  (ev, 'projection', 'Ativações de marca', 40, null, 'Espaços disponíveis para ativação.', 'Planejamento (demonstração)', '2027', false, 3);

-- Mídia -----------------------------------------------------------------------
insert into public.event_media (event_id, kind, folder, url, alt, caption, credit, in_gallery, featured, position) values
  (ev, 'image', 'galeria', u || '1459749411175-04bf5292ceea' || q, 'Palco principal iluminado em amarelo diante da multidão', 'Palco Sol, noite de abertura.', 'Unsplash', true, true, 0),
  (ev, 'image', 'galeria', u || '1501386761578-eac5c94b800a' || q, 'Público vibrando em frente ao palco', 'A grade é colada no palco desde o primeiro show.', 'Unsplash', true, false, 1),
  (ev, 'image', 'galeria', u || '1493225457124-a3eb161ffa5f' || q, 'Artista em meio à fumaça cênica', 'Headliner da segunda noite.', 'Unsplash', true, false, 2),
  (ev, 'image', 'estrutura', u || '1563841930606-67e2bce48b78' || q, 'Estrutura de palco com treliças e iluminação azul', 'Estrutura de 40 metros de boca de cena.', 'Unsplash', true, false, 3),
  (ev, 'image', 'galeria', u || '1492684223066-81342ee5ff30' || q, 'Chuva de papel picado sobre o público', 'Encerramento com chuva de confete.', 'Unsplash', true, false, 4),
  (ev, 'image', 'momentos', u || '1429962714451-bb934ecdc4ec' || q, 'Mãos formando um coração no show', null, 'Unsplash', true, false, 5),
  (ev, 'image', 'momentos', u || '1516450360452-9312f5e86fc7' || q, 'Artista no palco com luzes azuis', null, 'Unsplash', true, false, 6),
  (ev, 'image', 'momentos', u || '1496024840928-4c417adf211d' || q, 'Público com pó colorido', null, 'Unsplash', true, false, 7),
  (ev, 'image', 'momentos', u || '1504680177321-2e6a879aac86' || q, 'DJ em palco com luzes laranja', null, 'Unsplash', true, false, 8),
  (ev, 'image', 'momentos', u || '1524368535928-5b5e00ddc76b' || q, 'Multidão sob luz laranja', null, 'Unsplash', true, false, 9),
  (ev, 'image', 'momentos', u || '1499364615650-ec38552f4f34' || q, 'Banda tocando com luzes azuis', null, 'Unsplash', true, false, 10),
  (ev, 'image', 'ativacoes', u || '1508700115892-45ecd05ae2ad' || q, 'Letreiro neon em espaço de marca', 'Ativação de marca com espaço instagramável.', 'Unsplash', false, false, 11),
  (ev, 'image', 'ativacoes', u || '1515169067868-5387ec356754' || q, 'Convidados conversando no lounge', 'Lounge corporativo de relacionamento.', 'Unsplash', false, false, 12),
  (ev, 'image', 'ativacoes', u || '1528605248644-14dd04022da1' || q, 'Pessoas em mesa de gastronomia', 'Arena gastronômica com chefs regionais.', 'Unsplash', false, false, 13),
  (ev, 'image', 'hero', u || '1470229722913-7c0e2dbbafd3' || q, 'Multidão diante do palco ao pôr do sol', 'Imagem de abertura (desktop).', 'Unsplash', false, false, 14),
  (ev, 'image', 'hero', u || '1506157786151-b8491531f063' || q, 'Festival com luzes roxas', 'Imagem de abertura (mobile).', 'Unsplash', false, false, 15);

-- Depoimentos -----------------------------------------------------------------
insert into public.event_testimonials (event_id, context, quote, author, role, company, position) values
  (ev, 'audience', 'Não é só um festival. É o fim de semana em que a cidade inteira se encontra na orla.', 'Marina A.', 'Público da 4ª edição', null, 0),
  (ev, 'audience', 'Cheguei para um show e fiquei os três dias. A experiência é muito bem cuidada.', 'Rafael T.', 'Público', null, 1),
  (ev, 'audience', 'O pôr do sol no palco Mar é o momento mais bonito do ano.', 'Juliana P.', 'Público', null, 2),
  (ev, 'results', 'A ativação gerou mais conteúdo espontâneo do que toda a nossa campanha do trimestre.', 'Carla Menezes', 'Diretora de marketing', 'Cervejaria Quilha (fictícia)', 0),
  (ev, 'results', 'Conseguimos falar com um público que não alcançávamos em mídia tradicional.', 'Pedro Lins', 'Head de marca', 'Vetta Telecom (fictícia)', 1),
  (ev, 'sponsor', 'Renovamos antes mesmo de a edição terminar. O time entende de marca, não só de evento.', 'Ana Ribeiro', 'Gerente de patrocínios', 'Banco Lume (fictício)', 0);

-- Público ---------------------------------------------------------------------
insert into public.event_audience (event_id, dimension, title, chart_type, data, unit, source, period, note, position) values
  (ev, 'age', 'Faixa etária', 'bar', '[{"label":"18–24","value":31},{"label":"25–34","value":38},{"label":"35–44","value":19},{"label":"45+","value":12}]', '%', demo, 'Pesquisa 4ª edição', null, 0),
  (ev, 'gender', 'Gênero (autodeclarado)', 'donut', '[{"label":"Mulheres","value":52},{"label":"Homens","value":45},{"label":"Outros / prefiro não dizer","value":3}]', '%', demo, 'Pesquisa 4ª edição', 'Coletado com consentimento, de forma anônima.', 1),
  (ev, 'region', 'Origem do público por estado', 'map', '[{"label":"PE","value":58},{"label":"PB","value":9},{"label":"AL","value":7},{"label":"BA","value":6},{"label":"SP","value":5},{"label":"CE","value":4},{"label":"RN","value":4},{"label":"RJ","value":3},{"label":"DF","value":2},{"label":"MG","value":2}]', '%', demo, 'Vendas de ingressos 2026', '42% do público veio de fora da região metropolitana.', 2),
  (ev, 'socioeconomic', 'Classe social', 'stat', '[{"label":"Classes A e B","value":64},{"label":"Classe C","value":31},{"label":"Ensino superior","value":71},{"label":"Renda própria","value":83}]', '%', demo, 'Pesquisa 4ª edição', null, 3),
  (ev, 'interests', 'Interesses além da música', 'bar', '[{"label":"Gastronomia","value":67},{"label":"Viagens","value":58},{"label":"Moda","value":41},{"label":"Tecnologia","value":37},{"label":"Esportes","value":29}]', '%', demo, 'Pesquisa 4ª edição', 'Respostas múltiplas.', 4);

-- Resultados ------------------------------------------------------------------
insert into public.event_results (event_id, category, label, value, unit, previous_value, description, source, period, position) values
  (ev, 'attendance', 'Público presencial', 62000, 'pessoas', 48000, null, demo, 'Set/2026 vs Set/2025', 0),
  (ev, 'organic', 'Alcance orgânico', 11200000, 'contas', 6900000, 'Redes oficiais e de artistas.', demo, 'Ago–Out', 1),
  (ev, 'paid', 'Alcance pago', 7200000, 'contas', 5100000, null, demo, 'Ago–Out', 2),
  (ev, 'impressions', 'Impressões totais', 41000000, null, 27500000, null, demo, 'Ago–Out', 3),
  (ev, 'media', 'Matérias espontâneas na imprensa', 312, 'inserções', 190, 'TV, portais e rádio.', demo, 'Ago–Out', 4),
  (ev, 'activation', 'Interações em ativações de marca', 148000, null, 96000, 'Check-ins, brindes e experiências.', demo, '3 dias de evento', 5);

-- Oportunidades ---------------------------------------------------------------
insert into public.sponsorship_opportunities (event_id, category, title, description, deliverables, image_url, position) values
  (ev, 'naming_rights', 'Naming rights do festival', 'Sua marca no nome do evento: "Solarmar apresentado por". Presença em toda a comunicação, do anúncio ao aftermovie.',
    array['Marca no nome oficial do festival','Logo em todas as peças e no palco principal','Menção em release e coletiva','Ativação central de 300 m²'], u || '1540039155733-5bb30b53aa14' || q, 0),
  (ev, 'master', 'Patrocínio master', 'A cota de maior visibilidade depois do naming rights, com presença em todos os palcos e entregas digitais dedicadas.',
    array['Logo em destaque nos telões','Ativação de 150 m²','Conteúdo co-criado com artistas','40 credenciais VIP'], u || '1533174072545-7a4b6ad7a6c3' || q, 1),
  (ev, 'category', 'Patrocínio por categoria', 'Exclusividade no seu segmento: bebida oficial, banco oficial, operadora oficial.',
    array['Exclusividade de categoria','Direito de uso da marca do festival','Pontos de venda/serviço no evento'], u || '1528605248644-14dd04022da1' || q, 2),
  (ev, 'activation', 'Ativações de marca', 'Espaços para experiências que viram conteúdo: do lounge à roda-gigante.',
    array['Área de 30 a 150 m²','Projeto cenográfico com nossa equipe','Relatório de interações'], u || '1508700115892-45ecd05ae2ad' || q, 3),
  (ev, 'experience', 'Experiências exclusivas', 'Lounge corporativo à beira-mar para relacionamento com clientes e convidados.',
    array['Lounge com open bar e gastronomia','Vista privilegiada do palco Mar','Acesso a backstage'], u || '1515169067868-5387ec356754' || q, 4),
  (ev, 'digital_media', 'Mídia digital', 'Presença nas redes oficiais, transmissões ao vivo e newsletter do festival.',
    array['Posts e stories patrocinados','Inserção na transmissão ao vivo','Cortes com marca no YouTube'], u || '1522158637959-30385a09e0da' || q, 5),
  (ev, 'audiovisual', 'Inserções audiovisuais', 'Vinhetas nos telões entre shows e presença no aftermovie oficial.',
    array['Vinheta de 15" nos intervalos','Assinatura no aftermovie'], u || '1504680177321-2e6a879aac86' || q, 6),
  (ev, 'institutional', 'Apoio institucional', 'Para instituições e órgãos públicos que queiram associar sua marca à economia criativa local.',
    array['Logo na régua institucional','Menção em releases'], null, 7);

-- Cotas -----------------------------------------------------------------------
insert into public.sponsorship_tiers (id, event_id, name, tagline, description, price, show_price, quantity_total, quantity_sold, deliverables, benefits, highlight, position) values
  (t_master, ev, 'Master', 'Presença máxima, em todos os pontos de contato.', 'Cota única por segmento, com ativação central e entregas digitais dedicadas.',
    1200000, false, 2, 1,
    array['Logo em destaque em todos os palcos e telões','Ativação de 150 m² em área nobre','12 posts + 24 stories nas redes oficiais','Inserção no aftermovie','40 credenciais VIP + lounge'],
    array['Exclusividade de categoria','Relatório de resultados','Direito de uso de imagem'], true, 0),
  (t_ouro, ev, 'Ouro', 'Visibilidade forte com ativação própria.', null,
    480000, true, 4, 2,
    array['Logo nos telões e palco secundário','Ativação de 60 m²','6 posts + 12 stories','20 credenciais VIP'],
    array['Relatório de resultados','Direito de uso de imagem'], false, 1),
  (t_prata, ev, 'Prata', 'Presença qualificada e relacionamento.', null,
    220000, true, 6, 1,
    array['Logo na régua de patrocinadores','Espaço de 20 m²','3 posts nas redes oficiais','10 credenciais VIP'],
    array['Relatório de resultados'], false, 2),
  (t_apoio, ev, 'Apoiador', 'Para marcas locais e parceiros de serviço.', null,
    60000, true, 10, 3,
    array['Logo na régua de apoiadores','Menção nas redes oficiais','4 credenciais'],
    array[]::text[], false, 3);

-- Marcas (fictícias) ----------------------------------------------------------
insert into public.sponsors (id, name, logo_url, segment) values
  ('00000000-0000-4000-8000-0000000000b1', 'Aurora Energia (fictícia)', '/demo/marcas/aurora-energia.svg', 'Energia'),
  ('00000000-0000-4000-8000-0000000000b2', 'Banco Lume (fictício)', '/demo/marcas/banco-lume.svg', 'Bancos e serviços financeiros'),
  ('00000000-0000-4000-8000-0000000000b3', 'Cervejaria Quilha (fictícia)', '/demo/marcas/cervejaria-quilha.svg', 'Alimentos e bebidas'),
  ('00000000-0000-4000-8000-0000000000b4', 'Vetta Telecom (fictícia)', '/demo/marcas/vetta-telecom.svg', 'Tecnologia e telecom'),
  ('00000000-0000-4000-8000-0000000000b5', 'Orla Seguros (fictícia)', '/demo/marcas/orla-seguros.svg', 'Seguros'),
  ('00000000-0000-4000-8000-0000000000b6', 'Nativa Cosméticos (fictícia)', '/demo/marcas/nativa-cosmeticos.svg', 'Beleza e cuidados pessoais'),
  ('00000000-0000-4000-8000-0000000000b7', 'Rota Mobilidade (fictícia)', '/demo/marcas/rota-mobilidade.svg', 'Automotivo'),
  ('00000000-0000-4000-8000-0000000000b8', 'Pulso Saúde (fictícia)', '/demo/marcas/pulso-saude.svg', 'Saúde'),
  ('00000000-0000-4000-8000-0000000000b9', 'Brisa Águas (fictícia)', '/demo/marcas/brisa-aguas.svg', 'Alimentos e bebidas'),
  ('00000000-0000-4000-8000-0000000000c1', 'Ferro Norte (fictícia)', '/demo/marcas/ferro-norte.svg', 'Indústria');

insert into public.event_sponsors (event_id, sponsor_id, relation, tier_label, case_title, case_body, position) values
  (ev, '00000000-0000-4000-8000-0000000000b2', 'current', 'Master', 'Banco Lume: cashback que virou fila', 'Ativação com pagamento por aproximação e cashback no próprio festival: 21 mil transações em três dias (dados fictícios).', 0),
  (ev, '00000000-0000-4000-8000-0000000000b3', 'current', 'Ouro', 'Quilha: o bar mais fotografado da orla', 'Um bar cenográfico sobre a areia que gerou 4,2 mil publicações espontâneas (dados fictícios).', 1),
  (ev, '00000000-0000-4000-8000-0000000000b4', 'current', 'Ouro', null, null, 2),
  (ev, '00000000-0000-4000-8000-0000000000b1', 'past', null, null, null, 3),
  (ev, '00000000-0000-4000-8000-0000000000b5', 'past', null, null, null, 4),
  (ev, '00000000-0000-4000-8000-0000000000b6', 'past', null, null, null, 5),
  (ev, '00000000-0000-4000-8000-0000000000b7', 'supporter', null, null, null, 6),
  (ev, '00000000-0000-4000-8000-0000000000b8', 'supporter', null, null, null, 7),
  (ev, '00000000-0000-4000-8000-0000000000b9', 'supporter', null, null, null, 8),
  (ev, '00000000-0000-4000-8000-0000000000c1', 'institutional', null, null, null, 9);

-- Leads de demonstração (claramente fictícios) --------------------------------
insert into public.leads (event_id, tier_id, full_name, company, job_title, email, phone, segment, interest, message, consent, cta_origin, utm_source, created_at) values
  (ev, t_ouro, 'Lead Demonstração 1', 'Empresa Exemplo Alfa', 'Gerente de Marketing', 'alfa@exemplo.com', '(81) 90000-0001', 'Alimentos e bebidas', 'Patrocínio de cota', 'Gostaríamos de entender a cota Ouro.', true, 'cota:Ouro', 'instagram', now() - interval '2 days'),
  (ev, null, 'Lead Demonstração 2', 'Empresa Exemplo Beta', 'Diretora de Marca', 'beta@exemplo.com', '(81) 90000-0002', 'Tecnologia e telecom', 'Ativação de marca', null, true, 'hero_patrocinador', null, now() - interval '5 days'),
  (ev, t_master, 'Lead Demonstração 3', 'Empresa Exemplo Gama', 'CMO', 'gama@exemplo.com', '(11) 90000-0003', 'Bancos e serviços financeiros', 'Naming rights', 'Temos interesse em naming rights.', true, 'oportunidade:Naming rights do festival', 'linkedin', now() - interval '9 days');

update public.leads set status = 'negotiating' where email = 'gama@exemplo.com';
update public.leads set status = 'contacted' where email = 'beta@exemplo.com';

end $$;
