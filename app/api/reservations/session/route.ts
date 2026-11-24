import {randomBytes} from 'node:crypto';
import {cookies} from 'next/headers';
import {safely,json,sameOrigin} from '@/server/http';
import {limit} from '@/server/core/security.mjs';
export async function POST(req:Request){return safely(async()=>{
  sameOrigin(req);
  await limit('guest-session-global',1000,60);
  const jar=await cookies();
  if(!/^[a-f0-9]{64}$/.test(jar.get('casa_guest')?.value||'')) jar.set('casa_guest',randomBytes(32).toString('hex'),{httpOnly:true,sameSite:'lax',secure:new URL(process.env.APP_ORIGIN!).protocol==='https:',path:'/',maxAge:90*86400});
  return json({ok:true});
});}
