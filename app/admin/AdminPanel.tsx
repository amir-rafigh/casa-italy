"use client";
import {useEffect,useState,type FormEvent} from 'react';
import {signOut} from 'next-auth/react';
import Link from 'next/link';
import {api} from '@/components/mvp/api';
import {statusLabels} from '@/types/mvp';
import type {CategoryData} from '@/types/mvp';
import styles from './admin.module.css';
type RecordData={id:string;[key:string]:unknown};
type Tab='reservations'|'menu'|'categories'|'slots'|'settings'|'users'|'audit';
const tabs:[Tab,string][]=[['reservations','رزروها'],['menu','محصولات'],['categories','دسته‌بندی‌ها'],['slots','ظرفیت ساعت‌ها'],['settings','تنظیمات'],['users','حساب‌ها'],['audit','گزارش تغییرات']];
const label:Record<string,string>={id:'شناسه لاتین',name:'نام',english_name:'نام انگلیسی',category_id:'دسته‌بندی',description:'توضیحات',ingredients:'ترکیبات (با ، جدا کنید)',price_toman:'قیمت آزمایشی (تومان)',sort_order:'ترتیب نمایش',image:'تصویر',available:'موجود',active:'فعال و قابل نمایش',address:'نشانی',phone:'تلفن (اختیاری)',hours:'ساعات کاری نمایشی',instagram:'شناسه اینستاگرام',capacity:'ظرفیت پیش‌فرض (نفر)',max_guests:'حداکثر نفر در هر درخواست',horizon_days:'افق رزرو (روز)',slot_times:'ساعت‌ها با کامای انگلیسی',slot_minutes:'مدت حضور (دقیقه)',username:'نام کاربری',password:'گذرواژه جدید (حداقل ۱۲ نویسه)',role:'نقش',closed:'بستن بازه'};
const fields:Partial<Record<Tab,string[]>>={menu:['id','name','english_name','category_id','description','ingredients','image','price_toman','sort_order','available','active'],categories:['id','name','sort_order','active'],settings:['address','phone','hours','instagram','capacity','max_guests','horizon_days','slot_times','slot_minutes'],users:['username','password','role','active'],slots:['capacity','closed']};
const numeric=['price_toman','sort_order','capacity','max_guests','horizon_days','slot_minutes'];
const bool=['active','available','closed'];
const fmt=(value:unknown)=>new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',dateStyle:'medium',timeStyle:'short'}).format(new Date(String(value)));
export function AdminPanel({user}:{user:{username:string;role:string}}){
 const [tab,setTab]=useState<Tab>('reservations'),[rows,setRows]=useState<RecordData[]>([]),[categories,setCategories]=useState<CategoryData[]>([]),[draft,setDraft]=useState<Record<string,unknown>|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[date,setDate]=useState(''),[status,setStatus]=useState('');
 const path=`/api/admin/${tab}?date=${date || (tab==='slots'?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()):'')}&status=${status}`;
 async function load(){const result=await api<RecordData[]|RecordData>(path);if(Array.isArray(result))setRows(result);else{setRows([]);setDraft({...result,slot_times:(result.slot_times as string[]).join(',')});}}
 useEffect(()=>{let active=true;api<RecordData[]|RecordData>(path).then(result=>{if(!active)return;if(Array.isArray(result))setRows(result);else{setRows([]);setDraft({...result,slot_times:(result.slot_times as string[]).join(',')});}}).catch(e=>{if(active){setRows([]);setError(e.message);}}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[path]);
 useEffect(()=>{api<CategoryData[]>('/api/admin/categories').then(setCategories).catch(()=>{});},[tab]);
 function edit(row:RecordData){setNotice('');setDraft({...row,ingredients:Array.isArray(row.ingredients)?row.ingredients.join('، '):row.ingredients,image:typeof row.image_path==='string'?row.image_path.split('/').pop()?.replace('.webp',''):'meatball',password:''});}
 function create(){setDraft({active:true,available:true,sort_order:0,price_toman:450000,category_id:categories[0]?.id||'',image:'meatball',role:'staff',password:''});setNotice('');}
 async function mutate(data:unknown){setBusy(true);setError('');setNotice('');try{await api(`/api/admin/${tab}`,data);setNotice('تغییرات ذخیره شد.');if(tab!=='settings')setDraft(null);await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 function save(e:FormEvent){e.preventDefault();mutate(draft);}
 const isAdmin=user.role==='admin';
 return <main className={styles.shell}>
  <header className={styles.header}><div><h1>مدیریت کازا ایتالی</h1><p>{user.username} · {isAdmin?'مدیر':'نماینده'} · نسخهٔ آزمایشی</p></div><div className={styles.actions}><Link href="/" target="_blank">منوی عمومی</Link><Link href="/reservations" target="_blank">رزرو مشتری</Link><a href="/api/qr" download>دریافت QR منو</a><button onClick={()=>signOut({callbackUrl:'/admin/login'})}>خروج</button></div></header>
  <div className={styles.layout}><nav className={styles.nav} aria-label="بخش‌های مدیریت">{tabs.filter(([id])=>isAdmin||!['settings','users','audit'].includes(id)).map(([id,name])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>{setLoading(true);setError('');setDraft(null);setTab(id);setNotice('');}}>{name}</button>)}</nav>
  <section className={styles.panel}><h2>{tabs.find(([id])=>id===tab)?.[1]}</h2>
   <p className={styles.notice}>این محیط آزمایشی است؛ قیمت‌ها و رزروها به رستوران واقعی مربوط نیستند.</p>
   <div className={styles.toolbar}>
    {['reservations','slots'].includes(tab)&&<label>تاریخ <input aria-label="فیلتر تاریخ" type="date" value={date} onChange={e=>{setLoading(true);setDraft(null);setDate(e.target.value);}} /></label>}
    {tab==='reservations'&&<label>وضعیت <select value={status} onChange={e=>{setLoading(true);setDraft(null);setStatus(e.target.value);}}><option value="">همه</option>{Object.entries(statusLabels).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>}
    {['menu','categories','users'].includes(tab)&&<button onClick={create}>افزودن</button>}
    <button disabled={busy||loading} onClick={()=>{setError('');load().catch(e=>setError(e.message));}}>تازه‌سازی</button>
   </div>
   {error&&<p className={styles.error} role="alert">{error}</p>}{notice&&<p className={styles.success} role="status">{notice}</p>}
   {loading&&<p role="status">در حال دریافت اطلاعات…</p>}
   {draft&&<form className={styles.form} onSubmit={save}>
    {fields[tab]?.map(key=><label key={key} className={bool.includes(key)?styles.check:undefined}>{label[key]}
     {bool.includes(key)?<input type="checkbox" checked={Boolean(draft[key])} onChange={e=>setDraft({...draft,[key]:e.target.checked})}/>:
      ['category_id','image','role'].includes(key)?<select value={String(draft[key]??'')} required onChange={e=>setDraft({...draft,[key]:e.target.value})}>
       {(key==='category_id'?categories.map(c=>[c.id,c.name]):key==='role'?[['admin','مدیر'],['staff','نماینده']]:['meatball','steak','chicken','bacon','eggplant','brisket','pesto'].map(v=>[v,v])).map(([id,name])=><option key={id} value={id}>{name}</option>)}
      </select>:key==='description'?<textarea required maxLength={1000} value={String(draft[key]??'')} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>:
      <input type={key==='password'?'password':numeric.includes(key)?'number':'text'} value={String(draft[key]??'')} required={!['password','phone','instagram'].includes(key)} maxLength={1000} min={numeric.includes(key)?0:undefined} autoComplete={key==='password'?'new-password':undefined} onChange={e=>setDraft({...draft,[key]:numeric.includes(key)?Number(e.target.value):e.target.value})}/>}</label>)}
    <div className={`${styles.actions} ${styles.wide}`}><button className={styles.primary} disabled={busy}>ذخیره</button>{tab!=='settings'&&<button type="button" onClick={()=>setDraft(null)}>بستن فرم</button>}</div>
    {tab==='settings'&&<p className={styles.wide}>تغییر الگو و ظرفیت پیش‌فرض فقط روی ساعت‌های ایجادنشده اثر دارد. ساعت‌های موجود را از «ظرفیت ساعت‌ها» ویرایش کنید. ساعت‌ها به وقت تهران‌اند.</p>}
   </form>}
   {!loading&&tab!=='settings'&&<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>{tab==='reservations'?'مهمان و تماس':tab==='slots'?'ساعت حضور':'عنوان / شناسه'}</th><th>جزئیات</th><th>عملیات</th></tr></thead><tbody>
    {rows.map((row,i)=><tr key={row.id||i}><td>{String(row.name||row.username||row.starts_at&&fmt(row.starts_at)||row.action||row.id)}{tab==='reservations'&&<p dir="ltr">{String(row.phone)}</p>}</td><td>
     {tab==='menu'&&<><strong>{new Intl.NumberFormat('fa-IR').format(Number(row.price_toman))} تومان</strong><p>{row.available?'موجود':'ناموجود'} · {row.active?'قابل نمایش':'بایگانی'} · ترتیب {String(row.sort_order)}</p></>}
     {tab==='categories'&&<p>{row.active?'فعال':'غیرفعال'} · ترتیب {String(row.sort_order)}</p>}
     {tab==='users'&&<p>{row.role==='admin'?'مدیر':'نماینده'} · {row.active?'فعال':'غیرفعال'}</p>}
     {tab==='slots'&&<p>ظرفیت {String(row.capacity)} · باقی‌مانده {String(row.remaining)} · {row.closed?'بسته':'باز'}</p>}
     {tab==='reservations'&&<><strong>{statusLabels[row.status as keyof typeof statusLabels]}</strong><p>{fmt(row.starts_at)} · {String(row.guests)} نفر</p><details className={styles.details}><summary>کد و تاریخچه</summary><bdi>{row.id}</bdi>{Array.isArray(row.events)&&row.events.map((event,j)=>{const e=event as Record<string,string>;return <p key={j}>{statusLabels[e.status as keyof typeof statusLabels]} · {e.actor} · {fmt(e.at)}</p>;})}</details></>}
     {tab==='audit'&&<p>{String(row.target)} · {fmt(row.created_at)}</p>}
    </td><td><div className={styles.actions}>
     {['menu','categories','users','slots'].includes(tab)&&<button onClick={()=>edit(row)}>ویرایش</button>}
     {['menu','categories'].includes(tab)&&<button disabled={busy} onClick={()=>{if(confirm(tab==='menu'?'محصول بایگانی شود؟':'دسته حذف شود؟'))mutate({id:row.id,remove:true});}}>{tab==='menu'?'بایگانی':'حذف'}</button>}
     {tab==='reservations'&&<>{row.status==='pending'&&<><button disabled={busy} onClick={()=>mutate({id:row.id,status:'confirmed'})}>تأیید</button><button disabled={busy} onClick={()=>mutate({id:row.id,status:'rejected'})}>رد</button></>}{['pending','confirmed'].includes(String(row.status))&&<button disabled={busy} onClick={()=>mutate({id:row.id,status:'cancelled'})}>لغو مدیریتی</button>}</>}
    </div></td></tr>)}
   </tbody></table>{!rows.length&&!error&&<p>موردی برای نمایش وجود ندارد.</p>}</div>}
  </section></div>
 </main>;
}
