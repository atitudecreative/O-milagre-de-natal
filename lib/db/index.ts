import 'server-only';
import { randomUUID } from 'node:crypto';
import { TABLES, type ColumnType, type Row } from '@/lib/schema';
import { createSqliteDriver } from './sqlite';
import { createPostgresDriver } from './postgres';
import { seedDatabase } from './seed';

/**
 * Camada de dados com dois drivers intercambiáveis:
 *  - Postgres (Supabase ou qualquer Postgres) quando DATABASE_URL estiver definido;
 *  - SQLite embutido do Node (node:sqlite) para desenvolvimento e servidores próprios.
 * Toda a aplicação usa apenas as funções exportadas aqui.
 */

export interface Driver {
  dialect: 'sqlite' | 'postgres';
  query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
  exec(sql: string, params?: unknown[]): Promise<void>;
  columns(table: string): Promise<string[]>;
}

type ListOptions = {
  where?: Record<string, unknown>;
  orderBy?: string;
  desc?: boolean;
  limit?: number;
};

const g = globalThis as unknown as { __mnDb?: Promise<Driver> };

function sqlType(dialect: Driver['dialect'], t: ColumnType) {
  if (dialect === 'postgres') {
    return { text: 'TEXT', number: 'DOUBLE PRECISION', boolean: 'BOOLEAN', timestamp: 'TIMESTAMPTZ' }[t];
  }
  return { text: 'TEXT', number: 'REAL', boolean: 'INTEGER', timestamp: 'TEXT' }[t];
}

export function ddl(dialect: Driver['dialect']) {
  const statements: string[] = [];
  for (const [table, cols] of Object.entries(TABLES)) {
    const defs = Object.entries(cols).map(([c, t]) => `"${c}" ${sqlType(dialect, t)}`);
    statements.push(`CREATE TABLE IF NOT EXISTS "${table}" ("id" TEXT PRIMARY KEY, ${defs.join(', ')})`);
  }
  statements.push(`CREATE TABLE IF NOT EXISTS "settings" ("key" TEXT PRIMARY KEY, "value" TEXT)`);
  statements.push(`CREATE INDEX IF NOT EXISTS leads_created_idx ON "leads" ("created_at")`);
  statements.push(`CREATE INDEX IF NOT EXISTS events_type_idx ON "events" ("type")`);
  statements.push(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON "users" ("email")`);
  return statements;
}

async function boot(): Promise<Driver> {
  const driver = process.env.DATABASE_URL ? await createPostgresDriver(process.env.DATABASE_URL) : await createSqliteDriver();
  for (const s of ddl(driver.dialect)) await driver.exec(s);
  // Migração aditiva: cria colunas novas declaradas no schema.
  for (const [table, cols] of Object.entries(TABLES)) {
    const existing = new Set(await driver.columns(table));
    for (const [c, t] of Object.entries(cols)) {
      if (!existing.has(c)) await driver.exec(`ALTER TABLE "${table}" ADD COLUMN "${c}" ${sqlType(driver.dialect, t)}`);
    }
  }
  await seedDatabase(api(driver));
  return driver;
}

export function db() {
  if (!g.__mnDb) {
    g.__mnDb = boot().catch((e) => {
      g.__mnDb = undefined;
      throw e;
    });
  }
  return g.__mnDb.then(api);
}

/* ------------------------------------------------------------------ */

function assertTable(table: string) {
  const cols = TABLES[table];
  if (!cols) throw new Error(`Tabela desconhecida: ${table}`);
  return cols;
}

function toDb(d: Driver, t: ColumnType | undefined, v: unknown) {
  if (v === undefined) return null;
  if (t === 'boolean') {
    const b = v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
    return d.dialect === 'sqlite' ? (b ? 1 : 0) : b;
  }
  if (t === 'number') {
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (t === 'timestamp') {
    if (!v) return null;
    return v instanceof Date ? v.toISOString() : String(v);
  }
  if (v === null) return null;
  return String(v);
}

function fromDb(table: string, raw: Record<string, unknown>): Row {
  const cols = TABLES[table] ?? {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    const t = cols[k];
    if (t === 'boolean') out[k] = v === true || v === 1 || v === '1';
    else if (t === 'timestamp') out[k] = v instanceof Date ? v.toISOString() : v ?? null;
    else if (t === 'number') out[k] = v === null || v === undefined ? null : Number(v);
    else out[k] = v ?? (t === 'text' ? '' : null);
  }
  return out as Row;
}

function api(d: Driver) {
  let n = 0;
  const ph = () => (d.dialect === 'postgres' ? `$${++n}` : '?');
  const reset = () => (n = 0);

  return {
    dialect: d.dialect,

    async list(table: string, opts: ListOptions = {}): Promise<Row[]> {
      const cols = assertTable(table);
      reset();
      const params: unknown[] = [];
      let sql = `SELECT * FROM "${table}"`;
      const where = Object.entries(opts.where ?? {}).filter(([k]) => k in cols || k === 'id');
      if (where.length) {
        sql += ' WHERE ' + where.map(([k]) => `"${k}" = ${ph()}`).join(' AND ');
        params.push(...where.map(([k, v]) => toDb(d, cols[k], v)));
      }
      const orderBy = opts.orderBy && (opts.orderBy in cols || opts.orderBy === 'id') ? opts.orderBy : 'sort' in cols ? 'sort' : 'created_at';
      sql += ` ORDER BY "${orderBy}" ${opts.desc ? 'DESC' : 'ASC'}`;
      if ('created_at' in cols && orderBy !== 'created_at') sql += `, "created_at" ASC`;
      if (opts.limit) sql += ` LIMIT ${Math.max(1, Math.floor(opts.limit))}`;
      return (await d.query(sql, params)).map((r) => fromDb(table, r));
    },

    async get(table: string, id: string): Promise<Row | null> {
      assertTable(table);
      reset();
      const rows = await d.query(`SELECT * FROM "${table}" WHERE "id" = ${ph()}`, [id]);
      return rows[0] ? fromDb(table, rows[0]) : null;
    },

    async findBy(table: string, col: string, value: unknown): Promise<Row | null> {
      const cols = assertTable(table);
      if (!(col in cols)) throw new Error('Coluna inválida');
      reset();
      const rows = await d.query(`SELECT * FROM "${table}" WHERE "${col}" = ${ph()} LIMIT 1`, [toDb(d, cols[col], value)]);
      return rows[0] ? fromDb(table, rows[0]) : null;
    },

    async insert(table: string, data: Record<string, unknown>): Promise<Row> {
      const cols = assertTable(table);
      const now = new Date().toISOString();
      const row: Record<string, unknown> = { ...data, id: (data.id as string) || randomUUID() };
      if ('created_at' in cols && !row.created_at) row.created_at = now;
      if ('updated_at' in cols) row.updated_at = now;
      const keys = Object.keys(row).filter((k) => k in cols || k === 'id');
      reset();
      const sql = `INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${keys.map(() => ph()).join(', ')})`;
      await d.exec(sql, keys.map((k) => (k === 'id' ? row.id : toDb(d, cols[k], row[k]))));
      return (await this.get(table, row.id as string))!;
    },

    async update(table: string, id: string, patch: Record<string, unknown>): Promise<Row | null> {
      const cols = assertTable(table);
      const data: Record<string, unknown> = { ...patch };
      if ('updated_at' in cols) data.updated_at = new Date().toISOString();
      const keys = Object.keys(data).filter((k) => k in cols);
      if (!keys.length) return this.get(table, id);
      reset();
      const sql = `UPDATE "${table}" SET ${keys.map((k) => `"${k}" = ${ph()}`).join(', ')} WHERE "id" = ${ph()}`;
      await d.exec(sql, [...keys.map((k) => toDb(d, cols[k], data[k])), id]);
      return this.get(table, id);
    },

    async remove(table: string, id: string) {
      assertTable(table);
      reset();
      await d.exec(`DELETE FROM "${table}" WHERE "id" = ${ph()}`, [id]);
    },

    async count(table: string): Promise<number> {
      assertTable(table);
      const rows = await d.query(`SELECT COUNT(*) AS c FROM "${table}"`);
      return Number(rows[0]?.c ?? 0);
    },

    async countBy(table: string, col: string): Promise<Record<string, number>> {
      const cols = assertTable(table);
      if (!(col in cols)) throw new Error('Coluna inválida');
      const rows = await d.query(`SELECT "${col}" AS k, COUNT(*) AS c FROM "${table}" GROUP BY "${col}"`);
      return Object.fromEntries(rows.map((r) => [String(r.k ?? ''), Number(r.c)]));
    },

    async getSettings(): Promise<Record<string, string>> {
      const rows = await d.query(`SELECT "key", "value" FROM "settings"`);
      return Object.fromEntries(rows.map((r) => [String(r.key), String(r.value ?? '')]));
    },

    async setSettings(values: Record<string, string>) {
      for (const [k, v] of Object.entries(values)) {
        reset();
        const a = ph();
        const b = ph();
        await d.exec(
          `INSERT INTO "settings" ("key", "value") VALUES (${a}, ${b}) ON CONFLICT ("key") DO UPDATE SET "value" = excluded."value"`,
          [k, v],
        );
      }
    },
  };
}

export type Db = ReturnType<typeof api>;
