import Link from 'next/link';
import {ReservationPanel} from '@/components/mvp/ReservationPanel';
export default function Page(){return <main style={{maxWidth:620,margin:'40px auto',padding:24}}><h1>ثبت و پیگیری رزرو میز</h1><p><Link href="/">منو</Link> · <Link href="/landing">لندینگ</Link></p><ReservationPanel /></main>;}
