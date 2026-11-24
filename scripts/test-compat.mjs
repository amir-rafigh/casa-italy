import {spawnSync} from 'node:child_process';
const url=new URL(process.env.DATABASE_URL);
if(!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Local compatibility tests only');
url.port='55433';url.pathname='/casa_compat';
const result=spawnSync(process.execPath,['--test','tests/db.test.mjs'],{stdio:'inherit',env:{...process.env,DATABASE_URL:url.toString()}});
process.exit(result.status??1);
