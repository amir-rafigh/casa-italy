import {mine} from '@/server/core/reservations.mjs';
import {safely,json,guestOwner} from '@/server/http';
export async function GET(){return safely(async()=>json(await mine(await guestOwner())));}
