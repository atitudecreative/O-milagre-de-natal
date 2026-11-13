-- O Milagre do Natal — schema Postgres/Supabase (gerado por scripts/generate-sql.ts)
-- O acesso aos dados é feito apenas pelo servidor (DATABASE_URL). RLS habilitado
-- sem políticas públicas: a chave anon do Supabase não lê nem grava nada.

CREATE TABLE IF NOT EXISTS "editions" (
  "id" TEXT PRIMARY KEY,
  "year" TEXT,
  "title" TEXT,
  "dates" TEXT,
  "venue" TEXT,
  "highlight" TEXT,
  "image" TEXT,
  "color" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "editions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "metrics" (
  "id" TEXT PRIMARY KEY,
  "label" TEXT,
  "value" DOUBLE PRECISION,
  "prefix" TEXT,
  "suffix" TEXT,
  "compact" BOOLEAN,
  "note" TEXT,
  "status" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "experiences" (
  "id" TEXT PRIMARY KEY,
  "kicker" TEXT,
  "title" TEXT,
  "description" TEXT,
  "image" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "experiences" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT PRIMARY KEY,
  "date" TEXT,
  "time" TEXT,
  "title" TEXT,
  "description" TEXT,
  "status" TEXT,
  "cta_url" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "people" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "role" TEXT,
  "bio" TEXT,
  "photo" TEXT,
  "link" TEXT,
  "edition" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "people" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "gallery" (
  "id" TEXT PRIMARY KEY,
  "media" TEXT,
  "video_url" TEXT,
  "caption" TEXT,
  "category" TEXT,
  "size" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "gallery" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "reasons" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT,
  "description" TEXT,
  "moment" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "reasons" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "audience" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT,
  "kind" TEXT,
  "text" TEXT,
  "data" TEXT,
  "note" TEXT,
  "status" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "audience" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "tiers" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "tagline" TEXT,
  "price" DOUBLE PRECISION,
  "price_label" TEXT,
  "benefits" TEXT,
  "deliverables" TEXT,
  "slots" DOUBLE PRECISION,
  "highlight" BOOLEAN,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "tiers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "partners" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "logo" TEXT,
  "url" TEXT,
  "category" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "partners" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "faqs" (
  "id" TEXT PRIMARY KEY,
  "question" TEXT,
  "answer" TEXT,
  "category" TEXT,
  "sort" DOUBLE PRECISION,
  "visible" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "faqs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "leads" (
  "id" TEXT PRIMARY KEY,
  "kind" TEXT,
  "name" TEXT,
  "company" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "segment" TEXT,
  "tier" TEXT,
  "message" TEXT,
  "consent" BOOLEAN,
  "consent_text" TEXT,
  "status" TEXT,
  "notes" TEXT,
  "source" TEXT,
  "utm_source" TEXT,
  "utm_medium" TEXT,
  "utm_campaign" TEXT,
  "referrer" TEXT,
  "page" TEXT,
  "user_agent" TEXT,
  "ip_hash" TEXT,
  "webhook_status" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT,
  "name" TEXT,
  "role" TEXT,
  "password_hash" TEXT,
  "active" BOOLEAN,
  "last_login_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT,
  "label" TEXT,
  "page" TEXT,
  "created_at" TIMESTAMPTZ
);
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "settings" ("key" TEXT PRIMARY KEY, "value" TEXT);
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS leads_created_idx ON "leads" ("created_at");
CREATE INDEX IF NOT EXISTS events_type_idx ON "events" ("type");
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON "users" ("email");

-- Bucket público para imagens, vídeos e PDF enviados pelo painel
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;
