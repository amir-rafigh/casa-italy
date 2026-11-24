import {Suspense} from 'react';
import {connection} from 'next/server';
import {CasaItalyMenu} from '@/components/pizza/cavasaitaly/CasaItalyMenu';
import {getMenu} from '@/server/data';
async function Content(){await connection();return <CasaItalyMenu initialData={await getMenu()} />;}
export default function Page(){return <Suspense fallback={<p style={{textAlign:'center',padding:40}}>در حال دریافت منو…</p>}><Content /></Suspense>;}
