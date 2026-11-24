import pg from 'pg';
let pool;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: Number(process.env.DB_POOL_MAX || 3), connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000, statement_timeout: 10000 });
    pool.on('error', () => console.error('Database connection interrupted'));
  }
  return pool;
}
export const query = (sql, values = []) => getPool().query(sql, values);
export async function transaction(fn) {
  const client = await getPool().connect();
  try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function closeDB() { if(pool) { await pool.end(); pool=undefined; } }
