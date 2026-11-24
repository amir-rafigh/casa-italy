import 'server-only';
import type {CasaProduct} from '@/data/pizza/cavasaitaly/products';
import type {MenuData} from '@/types/mvp';
import {menu} from './core/menu.mjs';
export async function getMenu():Promise<MenuData> {return await menu() as {products:CasaProduct[]} & MenuData;}
