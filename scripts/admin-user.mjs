import {randomUUID,randomBytes} from 'node:crypto';
import {writeFileSync,mkdirSync} from 'node:fs';
import {query,closeDB} from '../server/core/db.mjs';
import {hashPassword,identifier} from '../server/core/security.mjs';
try {
  const username=identifier(process.env.ADMIN_USERNAME||'admin');
  const generated=!process.env.ADMIN_PASSWORD,password=process.env.ADMIN_PASSWORD||randomBytes(12).toString('base64url');
  const result=await query(`INSERT INTO admin_users(id,username,password_hash,role) VALUES($1,$2,$3,'admin') ON CONFLICT(username) DO NOTHING RETURNING id`,[randomUUID(),username,await hashPassword(password)]);
  if(!result.rowCount) console.log('Account already exists; password preserved. Use the users panel for changes.');
  else if(generated) {mkdirSync('tmp',{recursive:true});writeFileSync('tmp/local-admin.txt',`Local admin only\nUsername: ${username}\nPassword: ${password}\n`,{mode:0o600});console.log('Admin created. Private credentials: tmp/local-admin.txt (git ignored).');}
  else console.log('Admin account created.');
} finally {await closeDB();}
