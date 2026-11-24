import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {currentAdmin} from '@/server/auth';
import {AdminPanel} from './AdminPanel';
async function Content(){const user=await currentAdmin();if(!user)redirect('/admin/login');return <AdminPanel user={{username:user.username,role:user.role}} />;}
export default function Page(){return <Suspense fallback={<p style={{padding:40}}>در حال بررسی دسترسی…</p>}><Content /></Suspense>;}
