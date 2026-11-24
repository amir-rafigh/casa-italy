import {getMenu} from '@/server/data';
import {safely,json} from '@/server/http';
export async function GET(){return safely(async()=>json(await getMenu()));}
