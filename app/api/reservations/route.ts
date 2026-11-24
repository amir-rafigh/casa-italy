import {createReservation} from '@/server/core/reservations.mjs';
import {safely,json,body,guestOwner,guestLimit} from '@/server/http';
export async function POST(req:Request){return safely(async()=>{
  const data=await body(req),owner=await guestOwner();await guestLimit(owner);return json(await createReservation(data,owner),201);
});}
