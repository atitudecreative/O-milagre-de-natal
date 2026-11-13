/**
 * Gera supabase/migrations/0001_init.sql a partir de lib/schema.ts.
 * Uso: node --experimental-strip-types scripts/generate-sql.ts
 * (O app também cria/atualiza as tabelas sozinho na inicialização; este arquivo
 *  serve para revisão, versionamento e execução manual no SQL Editor do Supabase.)
 */
import { writeFileSync } from 'node:fs';
import { TABLES } from '../lib/schema.ts';

const T = { text: 'TEXT', number: 'DOUBLE PRECISION', boolean: 'BOOLEAN', timestamp: 'TIMESTAMPTZ' } as const;

const out: string[] = [
  '-- O Milagre do Natal — schema Postgres/Supabase (gerado por scripts/generate-sql.ts)',
  '-- O acesso aos dados é feito apenas pelo servidor (DATABASE_URL). RLS habilitado',
  '-- sem políticas públicas: a chave anon do Supabase não lê nem grava nada.',
  '',
];
for (const [table, cols] of Object.entries(TABLES)) {
  const defs = Object.entries(cols).map(([c, t]) => `  "${c}" ${T[t]}`);
  out.push(`CREATE TABLE IF NOT EXISTS "${table}" (\n  "id" TEXT PRIMARY KEY,\n${defs.join(',\n')}\n);`);
  out.push(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`, '');
}
out.push(`CREATE TABLE IF NOT EXISTS "settings" ("key" TEXT PRIMARY KEY, "value" TEXT);`);
out.push(`ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;`, '');
out.push(`CREATE INDEX IF NOT EXISTS leads_created_idx ON "leads" ("created_at");`);
out.push(`CREATE INDEX IF NOT EXISTS events_type_idx ON "events" ("type");`);
out.push(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON "users" ("email");`, '');
out.push(
  '-- Bucket público para imagens, vídeos e PDF enviados pelo painel',
  `INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;`,
  '',
);
writeFileSync(new URL('../supabase/migrations/0001_init.sql', import.meta.url), out.join('\n'));
console.log('ok');
