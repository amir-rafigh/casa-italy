import {availability} from '@/server/core/reservations.mjs';
import {safely,json} from '@/server/http';
export async function GET(req:Request){return safely(async()=>json(await availability(new URL(req.url).searchParams.get('date'))));}
