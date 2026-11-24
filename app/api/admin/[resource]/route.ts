import {currentAdmin} from '@/server/auth';
import {adminRead,adminWrite} from '@/server/core/admin.mjs';
import {AppError} from '@/server/core/security.mjs';
import {safely,json,body} from '@/server/http';
type Context={params:Promise<{resource:string}>};
export async function GET(req:Request,ctx:Context){return safely(async()=>{
  const user=await currentAdmin();if(!user)throw new AppError('ابتدا وارد حساب مدیریت شوید.',401);
  return json(await adminRead((await ctx.params).resource,user,new URL(req.url).searchParams));
});}
export async function POST(req:Request,ctx:Context){return safely(async()=>{
  const data=await body(req),user=await currentAdmin();if(!user)throw new AppError('ابتدا وارد حساب مدیریت شوید.',401);
  return json(await adminWrite((await ctx.params).resource,data,user));
});}
