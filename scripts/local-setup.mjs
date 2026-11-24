import {existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
if(existsSync('.env.local')) { console.log('.env.local exists; preserved.');process.exit(0); }
const password=randomBytes(24).toString('hex');
writeFileSync('.env.local',`APP_ENV=demo\nAPP_ORIGIN=http://localhost:3000\nNEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=${randomBytes(48).toString('hex')}\nLOCAL_DB_PASSWORD=${password}\nDATABASE_URL=postgresql://casa:${password}@127.0.0.1:55432/casa_local\nDB_POOL_MAX=3\n`);
mkdirSync('tmp',{recursive:true});
console.log('Created private .env.local. Next: pnpm db:up, pnpm db:migrate, pnpm db:seed, pnpm admin:create');
