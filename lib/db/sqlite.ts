import fs from 'node:fs';
import path from 'node:path';
import type { Driver } from './index';

type Stmt = { all(...p: unknown[]): Record<string, unknown>[]; run(...p: unknown[]): unknown };
type SqliteDb = { exec(sql: string): void; prepare(sql: string): Stmt };

export function dataDir() {
  // No build (Render, Docker…) o disco persistente ainda não está montado: usa ./data temporário.
  const building = process.env.NEXT_PHASE === 'phase-production-build';
  const dir = process.env.DATA_DIR && !building ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function createSqliteDriver(): Promise<Driver> {
  // getBuiltinModule evita que o bundler tente resolver o módulo embutido do Node.
  const mod = process.getBuiltinModule('node:sqlite') as { DatabaseSync: new (file: string) => SqliteDb };
  const file = path.join(dataDir(), 'app.db');
  const db = new mod.DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  return {
    dialect: 'sqlite',
    async query(sql, params = []) {
      return db.prepare(sql).all(...params);
    },
    async exec(sql, params = []) {
      if (params.length) db.prepare(sql).run(...params);
      else db.exec(sql);
    },
    async columns(table) {
      return db.prepare(`PRAGMA table_info("${table}")`).all().map((r) => String(r.name));
    },
  };
}
