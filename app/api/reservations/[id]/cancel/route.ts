import {changeReservation} from '@/server/core/reservations.mjs';
import {safely,json,body,guestOwner} from '@/server/http';
export async function POST(req:Request,ctx:{params:Promise<{id:string}>}){return safely(async()=>{
  await body(req);return json(await changeReservation((await ctx.params).id,'cancelled','guest',await guestOwner()));
});}
