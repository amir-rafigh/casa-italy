import 'server-only';
import {cookies} from 'next/headers';
import {unstable_rethrow} from 'next/navigation';
import {AppError,hash,limit} from './core/security.mjs';
export function json(data:unknown,status=200) {return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export async function safely(run:()=>Promise<Response>) {
  try{return await run();}catch(error){
    unstable_rethrow(error);
    if(error instanceof AppError) return json({error:error.message},error.status);
    const code=(error as {code?:string}).code;
    if(code==='23503') return json({error:'این رکورد وابسته به داده‌های دیگر است یا دسته انتخابی پیدا نشد.'},409);
    if(code==='23505') return json({error:'شناسه تکراری است.'},409);
    console.error('Request failed',code||'internal');return json({error:'ارتباط با سامانه برقرار نشد. دوباره تلاش کنید.'},503);
  }
}
export function sameOrigin(req:Request) {
  const expected=process.env.APP_ORIGIN;
  if(!expected || req.headers.get('origin')!==new URL(expected).origin) throw new AppError('مبدأ درخواست معتبر نیست.',403);
}
export async function body(req:Request):Promise<Record<string,unknown>> {
  sameOrigin(req);
  if(!req.headers.get('content-type')?.startsWith('application/json')) throw new AppError('JSON لازم است.',415);
  const reader=req.body?.getReader();if(!reader) throw new AppError('بدنه خالی است.');
  let result='',size=0;const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();throw new AppError('حجم درخواست زیاد است.',413);}result+=decoder.decode(value,{stream:true});}
  result+=decoder.decode();
  try {const data=JSON.parse(result);if(!data||typeof data!=='object'||Array.isArray(data))throw 0;return data;}catch{throw new AppError('اطلاعات درخواست معتبر نیست.');}
}
export async function guestOwner() {
  const token=(await cookies()).get('casa_guest')?.value;
  if(!token||! /^[a-f0-9]{64}$/.test(token)) throw new AppError('ابتدا نشست رزرو را ایجاد کنید.',401);
  return hash(token);
}
export async function guestLimit(owner:string) {await limit(`booking:${owner}`,40,3600);}
