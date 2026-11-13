import type { Driver } from './index';

export async function createPostgresDriver(url: string): Promise<Driver> {
  const { Pool } = await import('pg');
  const local = /localhost|127\.0\.0\.1/.test(url);
  const pool = new Pool({
    connectionString: url,
    ssl: local || process.env.DATABASE_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  });
  return {
    dialect: 'postgres',
    async query(sql, params = []) {
      return (await pool.query(sql, params)).rows;
    },
    async exec(sql, params = []) {
      await pool.query(sql, params);
    },
    async columns(table) {
      const r = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1`,
        [table],
      );
      return r.rows.map((x) => String(x.column_name));
    },
  };
}
