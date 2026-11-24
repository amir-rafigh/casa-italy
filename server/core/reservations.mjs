import {randomUUID} from 'node:crypto';
import {query,transaction} from './db.mjs';
import {AppError,hash,integer,text,uuidPattern} from './security.mjs';
export function tehranDay(now=new Date()) { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function addDays(day,n) { const d=new Date(`${day}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10); }
export function mayCancel(startsAt,now){return startsAt.getTime()-now.getTime()>=1800000;}
export function validDay(day, horizon, now=new Date()) {
  const today=tehranDay(now);
  if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day||day<today||day>addDays(today,horizon)) throw new AppError('تاریخ باید معتبر و در محدودهٔ روزهای قابل رزرو باشد.');
}
export async function availability(day) {
  await transaction(async c=>{
    // The singleton settings lock serializes schedule generation and settings changes.
    const {rows:[s]}=await c.query('SELECT * FROM restaurant_settings WHERE id=1 FOR UPDATE');
    validDay(day,s.horizon_days);
    for(const time of s.slot_times) {
      const start=new Date(`${day}T${time}:00+03:30`),end=new Date(start.getTime()+s.slot_minutes*60000);
      await c.query(`INSERT INTO reservation_slots(id,starts_at,ends_at,capacity) SELECT $1,$2,$3,$4
        WHERE NOT EXISTS (SELECT 1 FROM reservation_slots WHERE starts_at<$3 AND ends_at>$2)
        ON CONFLICT(starts_at) DO NOTHING`,[randomUUID(),start,end,s.capacity]);
    }
  });
  const {rows}=await query(`SELECT s.id,s.starts_at,s.ends_at,s.closed,s.capacity,
    s.capacity-COALESCE(SUM(r.guests) FILTER(WHERE r.status IN ('pending','confirmed')),0)::int remaining
    FROM reservation_slots s LEFT JOIN reservations r ON r.slot_id=s.id
    WHERE s.starts_at >= $1::timestamptz AND s.starts_at < $1::timestamptz+interval '1 day' AND s.starts_at>now()
    GROUP BY s.id ORDER BY s.starts_at`,[`${day}T00:00:00+03:30`]);
  const {rows:[s]}=await query('SELECT max_guests,horizon_days FROM restaurant_settings WHERE id=1');
  return {slots:rows,maxGuests:s.max_guests,minDate:tehranDay(),maxDate:addDays(tehranDay(),s.horizon_days)};
}
const publicReservation=`r.id,r.name,r.guests,r.status,r.created_at,r.updated_at,s.starts_at,s.ends_at,
 (r.status IN ('pending','confirmed') AND s.starts_at-now()>=interval '30 minutes') can_cancel`;
export async function mine(owner) {
  const {rows}=await query(`SELECT ${publicReservation} FROM reservations r JOIN reservation_slots s ON s.id=r.slot_id WHERE owner_token_hash=$1 ORDER BY r.created_at DESC LIMIT 100`,[owner]);return rows;
}
export async function createReservation(input,owner) {
  const name=text(input.name,2,60);
  const phone=text(input.phone,10,24).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s()\-]/g,'').replace(/^(?:\+98|0098)/,'0');
  if(!/^09\d{9}$/.test(phone)||!uuidPattern.test(input.slotId)||!uuidPattern.test(input.key)) throw new AppError('شماره موبایل یا بازهٔ انتخابی معتبر نیست.');
  const guests=integer(input.guests,1,20), fingerprint=hash(JSON.stringify({name,phone,guests,slotId:input.slotId}));
  return transaction(async c=>{
    // Owner-scoped lock also handles retries targeting different slots with the same key.
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[`${owner}:${input.key}`]);
    const {rows:[prior]}=await c.query('SELECT id,request_hash FROM reservations WHERE owner_token_hash=$1 AND idempotency_key=$2',[owner,input.key]);
    if(prior) { if(prior.request_hash!==fingerprint) throw new AppError('این شناسه قبلاً با اطلاعات دیگری ثبت شده است.',409);return {id:prior.id,replayed:true}; }
    const {rows:[s]}=await c.query('SELECT * FROM reservation_slots WHERE id=$1 FOR UPDATE',[input.slotId]);
    if(!s) throw new AppError('بازه پیدا نشد.',404);
    const {rows:[settings]}=await c.query('SELECT * FROM restaurant_settings WHERE id=1');
    const {rows:[clock]}=await c.query('SELECT clock_timestamp() now');
    validDay(tehranDay(s.starts_at),settings.horizon_days,clock.now);
    if(s.closed||s.starts_at<=clock.now||guests>settings.max_guests) throw new AppError('بازه بسته است یا تعداد مهمان مجاز نیست.',409);
    const {rows:[used]}=await c.query("SELECT COALESCE(SUM(guests),0)::int n FROM reservations WHERE slot_id=$1 AND status IN ('pending','confirmed')",[s.id]);
    if(used.n+guests>s.capacity) throw new AppError('ظرفیت این ساعت کافی نیست. ساعت دیگری انتخاب کنید.',409);
    const id=randomUUID();
    await c.query('INSERT INTO reservations(id,slot_id,name,phone,guests,owner_token_hash,idempotency_key,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,s.id,name,phone,guests,owner,input.key,fingerprint]);
    await c.query("INSERT INTO reservation_events(id,reservation_id,new_status,actor) VALUES($1,$2,'pending','guest')",[randomUUID(),id]);
    return {id,replayed:false};
  });
}
export async function changeReservation(id,status,actor,owner='') {
  if(!uuidPattern.test(id)||!['confirmed','rejected','cancelled'].includes(status)) throw new AppError('تغییر وضعیت معتبر نیست.');
  return transaction(async c=>{
    const {rows:[ref]}=await c.query('SELECT slot_id FROM reservations WHERE id=$1',[id]);
    if(!ref) throw new AppError('رزرو پیدا نشد.',404);
    const {rows:[slot]}=await c.query('SELECT * FROM reservation_slots WHERE id=$1 FOR UPDATE',[ref.slot_id]);
    const {rows:[r]}=await c.query('SELECT * FROM reservations WHERE id=$1 FOR UPDATE',[id]);
    if(owner && r.owner_token_hash!==owner) throw new AppError('رزرو پیدا نشد.',404);
    if(owner) {
      const {rows:[clock]}=await c.query('SELECT clock_timestamp() now');
      if(status!=='cancelled'||!mayCancel(slot.starts_at,clock.now)) throw new AppError('لغو فقط تا ۳۰ دقیقه پیش از شروع مجاز است.',409);
    }
    if(r.status===status) return {id};
    if(!(['pending','confirmed'].includes(r.status)) || (r.status==='confirmed'&&status!=='cancelled')) throw new AppError('وضعیت رزرو تغییر کرده؛ صفحه را تازه کنید.',409);
    if(status==='confirmed') {
      const {rows:[clock]}=await c.query('SELECT clock_timestamp() now');
      if(slot.starts_at<=clock.now||slot.closed) throw new AppError('تأیید این بازه دیگر مجاز نیست.',409);
    }
    await c.query('UPDATE reservations SET status=$2,updated_at=now() WHERE id=$1',[id,status]);
    await c.query('INSERT INTO reservation_events(id,reservation_id,old_status,new_status,actor) VALUES($1,$2,$3,$4,$5)',[randomUUID(),id,r.status,status,actor]);
    return {id};
  });
}
export async function changeSlot(input) {
  const capacity=integer(input.capacity,1,200),closed=input.closed;
  if(!uuidPattern.test(input.id)||typeof closed!=='boolean') throw new AppError('بازه معتبر نیست.');
  return transaction(async c=>{
    const {rowCount}=await c.query('SELECT id FROM reservation_slots WHERE id=$1 FOR UPDATE',[input.id]);
    if(!rowCount) throw new AppError('بازه پیدا نشد.',404);
    const {rows:[used]}=await c.query("SELECT COALESCE(SUM(guests),0)::int n FROM reservations WHERE slot_id=$1 AND status IN ('pending','confirmed')",[input.id]);
    if(capacity<used.n) throw new AppError('ظرفیت نمی‌تواند کمتر از تعداد رزروهای فعال باشد.',409);
    await c.query('UPDATE reservation_slots SET capacity=$2,closed=$3 WHERE id=$1',[input.id,capacity,closed]);return {id:input.id};
  });
}
