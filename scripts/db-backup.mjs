import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const url=new URL(process.env.DATABASE_URL);
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/casa_local')throw new Error('This helper is for the dedicated local Casa database only');
const args=['compose','--env-file','.env.local','exec','-T','db'];
function run(command,input){const r=spawnSync('docker',[...args,...command],{input,maxBuffer:50*1024*1024});if(r.status!==0)throw new Error(r.stderr.toString()||'Docker operation failed');return r.stdout;}
const dump=run(['pg_dump','-U','casa','-d','casa_local','-Fc']);
mkdirSync('tmp/backups',{recursive:true});const file=`tmp/backups/casa-local-${Date.now()}.dump`;writeFileSync(file,dump);
console.log(`Local backup saved: ${file}`);
if(process.argv.includes('--verify')){
 const name=`casa_restore_${Date.now()}`;run(['createdb','-U','casa',name]);
 try{run(['pg_restore','--exit-on-error','--no-owner','-U','casa','-d',name],dump);const result=run(['psql','-U','casa','-d',name,'-Atc','SELECT count(*) FROM menu_items; SELECT count(*) FROM schema_migrations;']);console.log(`Restore verified (item and migration counts): ${result.toString().trim().replaceAll('\n',', ')}`);}
 finally{run(['dropdb','-U','casa',name]);}
}
