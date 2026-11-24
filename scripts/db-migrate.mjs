import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {transaction,closeDB} from '../server/core/db.mjs';
export async function migrate() {
  const dir=new URL('../db/migrations/',import.meta.url);
  await transaction(async c=>{
    await c.query('SELECT pg_advisory_xact_lock(86421)');
    await c.query('CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
    for(const name of (await readdir(dir)).filter(n=>n.endsWith('.sql')).sort()) {
      const sql=await readFile(new URL(name,dir),'utf8'),checksum=createHash('sha256').update(sql).digest('hex');
      const {rows:[prior]}=await c.query('SELECT checksum FROM schema_migrations WHERE version=$1',[name]);
      if(prior) { if(prior.checksum!==checksum) throw new Error(`Migration checksum mismatch: ${name}`);continue; }
      await c.query(sql);await c.query('INSERT INTO schema_migrations(version,checksum) VALUES($1,$2)',[name,checksum]);console.log(`Applied ${name}`);
    }
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {try {await migrate();} finally {await closeDB();}}
