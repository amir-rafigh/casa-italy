"use client";
import Link from 'next/link';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {api} from './api';
import type {Booking,Slot} from '@/types/mvp';
import {statusLabels} from '@/types/mvp';
import styles from '@/components/pizza/cavasaitaly/landing/CasaLanding.module.css';
const number=new Intl.NumberFormat('fa-IR');
export const bookingTime=(value:string)=>new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
type Availability={slots:Slot[];minDate:string;maxDate:string;maxGuests:number};
export function ReservationPanel(){
  const [date,setDate]=useState(''),[available,setAvailable]=useState<Availability|null>(null),[bookings,setBookings]=useState<Booking[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const retry=useRef<{fingerprint:string;key:string}|null>(null);
  async function reload(){setBookings(await api<Booking[]>('/api/reservations/mine'));}
  useEffect(()=>{let active=true;(async()=>{try{await api('/api/reservations/session',{});if(active)setDate(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));}catch(e){if(active)setError((e as Error).message);}})();return()=>{active=false;};},[]);
  useEffect(()=>{if(!date)return;let active=true;Promise.all([api<Availability>(`/api/availability?date=${date}`),api<Booking[]>('/api/reservations/mine')]).then(([a,b])=>{if(active){setAvailable(a);setBookings(b);setError('');}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[date]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');
    const form=event.currentTarget,data=new FormData(form),payload={name:data.get('name'),phone:data.get('phone'),guests:Number(data.get('guests')),slotId:data.get('slotId')};
    const fingerprint=JSON.stringify(payload);
    if(retry.current?.fingerprint!==fingerprint)retry.current={fingerprint,key:crypto.randomUUID()};
    try{await api('/api/reservations',{...payload,key:retry.current!.key});retry.current=null;form.reset();setNotice('درخواست در سامانه ثبت شد و منتظر بررسی مدیر است.');await reload();setAvailable(await api<Availability>(`/api/availability?date=${date}`));}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  async function cancel(id:string){setBusy(true);setError('');try{await api(`/api/reservations/${id}/cancel`,{});await reload();setAvailable(await api<Availability>(`/api/availability?date=${date}`));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <div>
    <p className={styles.demoNotice}>محیط آزمایشی است؛ اطلاعات در سامانه ذخیره می‌شود و رزرو واقعی رستوران نیست. پیامک ارسال نمی‌شود. پیگیری در همین مرورگر امکان‌پذیر است.</p>
    {error&&<p role="alert" className={styles.formError}>{error}</p>}
    {notice&&<p role="status">{notice}</p>}
    <form className={styles.form} onSubmit={submit}>
      <label>نام و نام خانوادگی<input name="name" required minLength={2} maxLength={60} autoComplete="name" /></label>
      <label>شماره موبایل<input name="phone" type="tel" required maxLength={24} autoComplete="tel" dir="ltr" placeholder="09123456789" /></label>
      <div className={styles.formRow}>
        <label>تعداد مهمان<select name="guests" defaultValue="2">{Array.from({length:available?.maxGuests||8},(_,i)=><option key={i} value={i+1}>{number.format(i+1)} نفر</option>)}</select></label>
        <label>تاریخ<input type="date" value={date} min={available?.minDate} max={available?.maxDate} required onChange={e=>{setAvailable(null);setDate(e.target.value);}} /></label>
      </div>
      <label>ساعت حضور<select key={date} name="slotId" required defaultValue="" disabled={!available}>
        <option value="">{available?'ساعت را انتخاب کنید':'در حال دریافت ساعت‌ها…'}</option>
        {available?.slots.map(s=><option key={s.id} value={s.id} disabled={s.closed||s.remaining<1}>{bookingTime(s.starts_at)} — {s.closed?'بسته':`${number.format(s.remaining)} نفر ظرفیت`}</option>)}
      </select></label>
      {available&&!available.slots.length&&<p>برای این روز ساعت قابل رزروی وجود ندارد.</p>}
      <button type="submit" className={styles.primaryButton} disabled={busy||!available||!available.slots.length}>{busy?'در حال ثبت…':'ثبت درخواست رزرو'}</button>
    </form>
    <hr style={{margin:'24px 0',opacity:.2}} /><h3>رزروهای این مرورگر</h3>
    <button type="button" className={styles.secondaryButton} disabled={busy} onClick={()=>{setError('');reload().catch(e=>setError(e.message));}}>تازه‌سازی وضعیت</button>
    {bookings.map(b=><section key={b.id} style={{padding:'16px 0',borderBottom:'1px solid #d8d8d0'}}>
      <strong>{statusLabels[b.status]}</strong><p>{b.name} · {bookingTime(b.starts_at)} · {number.format(b.guests)} نفر</p>
      <small>کد پیگیری: <bdi>{b.id}</bdi></small>
      {b.can_cancel&&<button type="button" disabled={busy} className={styles.secondaryButton} onClick={()=>cancel(b.id)}>لغو درخواست</button>}
      {!b.can_cancel&&['pending','confirmed'].includes(b.status)&&<p>لغو تا ۳۰ دقیقه پیش از شروع مجاز است.</p>}
    </section>)}
    {!bookings.length&&<p>هنوز رزروی در این مرورگر ثبت نشده است.</p>}
    <p><Link href="/reservations">صفحهٔ مستقل ثبت و پیگیری رزرو</Link></p>
  </div>;
}
