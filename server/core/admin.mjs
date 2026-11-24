import {randomUUID} from 'node:crypto';
import {query,transaction} from './db.mjs';
import {AppError,text,integer,boolean,identifier,hashPassword} from './security.mjs';
import {availability,changeReservation,changeSlot} from './reservations.mjs';
export const imageNames=['meatball','steak','chicken','bacon','eggplant','brisket','pesto'];
export async function actor(id,version,role=null) {
  const {rows:[user]}=await query('SELECT id,username,role,session_version FROM admin_users WHERE id=$1 AND active AND session_version=$2',[id,version]);
  if(!user) throw new AppError('لطفاً وارد حساب مدیریت شوید.',401);
  if(role && user.role!==role) throw new AppError('به این بخش دسترسی ندارید.',403);
  return user;
}
export async function adminRead(resource,user,params) {
  if(resource==='menu') return (await query('SELECT * FROM menu_items ORDER BY sort_order,id')).rows;
  if(resource==='categories') return (await query('SELECT * FROM categories ORDER BY sort_order,id')).rows;
  if(resource==='reservations') {
    const date=params.get('date')||'',status=params.get('status')||'';
    if(date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('تاریخ نامعتبر است.');
    return (await query(`SELECT r.id,r.name,r.phone,r.guests,r.status,r.created_at,s.starts_at,
      (SELECT COALESCE(jsonb_agg(jsonb_build_object('status',e.new_status,'actor',e.actor,'at',e.created_at) ORDER BY e.created_at),'[]'::jsonb) FROM reservation_events e WHERE e.reservation_id=r.id) events
      FROM reservations r JOIN reservation_slots s ON s.id=r.slot_id
      WHERE ($1='' OR (s.starts_at AT TIME ZONE 'Asia/Tehran')::date=NULLIF($1,'')::date) AND ($2='' OR r.status=$2)
      ORDER BY s.starts_at DESC,r.created_at DESC LIMIT 300`,[date,status])).rows;
  }
  if(resource==='slots') {
    const data=await availability(params.get('date'));return data.slots;
  }
  if(user.role!=='admin') throw new AppError('این بخش مخصوص مدیر است.',403);
  if(resource==='settings') return (await query('SELECT * FROM restaurant_settings WHERE id=1')).rows[0];
  if(resource==='users') return (await query('SELECT id,username,role,active,created_at FROM admin_users ORDER BY username')).rows;
  if(resource==='audit') return (await query('SELECT a.*,u.username FROM audit_log a LEFT JOIN admin_users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 100')).rows;
  throw new AppError('بخش پیدا نشد.',404);
}
export async function adminWrite(resource,input,user) {
  if(['settings','users'].includes(resource)&&user.role!=='admin') throw new AppError('این عملیات مخصوص مدیر است.',403);
  if(resource==='reservations') return changeReservation(input.id,input.status,user.username);
  if(resource==='slots') {
    const result=await changeSlot(input);
    await query('INSERT INTO audit_log(id,actor_id,action,target) VALUES($1,$2,$3,$4)',[randomUUID(),user.id,'slots.update',input.id]);return result;
  }
  return transaction(async c=>{
    let target='';
    if(resource==='categories') {
      const id=identifier(input.id);target=id;
      if(id==='all') throw new AppError('شناسه all برای فیلتر همه رزرو شده است.');
      if(input.remove) {
        const {rows:[used]}=await c.query('SELECT count(*)::int n FROM menu_items WHERE category_id=$1',[id]);
        if(used.n) throw new AppError('ابتدا محصولات این دسته را جابه‌جا کنید.',409);
        await c.query('DELETE FROM categories WHERE id=$1',[id]);
      } else await c.query(`INSERT INTO categories(id,name,sort_order,active) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET name=excluded.name,sort_order=excluded.sort_order,active=excluded.active`,[id,text(input.name,1,60),integer(input.sort_order,0,1000),boolean(input.active)]);
    } else if(resource==='menu') {
      const id=identifier(input.id);target=id;
      if(input.remove) await c.query('UPDATE menu_items SET active=false,updated_at=now() WHERE id=$1',[id]);
      else {
        if(!imageNames.includes(input.image)) throw new AppError('تصویر را از فهرست موجود انتخاب کنید.');
        const ingredients=text(input.ingredients,1,500).split('،').map(v=>v.trim()).filter(Boolean);
        await c.query(`INSERT INTO menu_items(id,category_id,name,english_name,description,ingredients,image_path,image_alt,price_toman,available,active,sort_order)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(id) DO UPDATE SET category_id=excluded.category_id,name=excluded.name,english_name=excluded.english_name,
         description=excluded.description,ingredients=excluded.ingredients,image_path=excluded.image_path,image_alt=excluded.image_alt,price_toman=excluded.price_toman,
         available=excluded.available,active=excluded.active,sort_order=excluded.sort_order,updated_at=now()`,[id,identifier(input.category_id),text(input.name,1,80),text(input.english_name,1,100),text(input.description,1,1000),JSON.stringify(ingredients),`/brands/pizza/cavasaitaly/products/cutouts/${input.image}.webp`,text(input.name,1,80),integer(input.price_toman,1000,10000000),boolean(input.available),boolean(input.active),integer(input.sort_order,0,1000)]);
      }
    } else if(resource==='settings') {
      target='1';
      const times=text(input.slot_times,5,100).split(',').map(v=>v.trim());
      const minutes=integer(input.slot_minutes,30,240);
      if(times.some(t=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(t))||new Set(times).size!==times.length) throw new AppError('ساعت‌ها را به صورت 18:00,19:30 وارد کنید.');
      const starts=times.map(t=>Number(t.slice(0,2))*60+Number(t.slice(3))).sort((a,b)=>a-b);
      if(starts.some((v,i)=>i>0 && v-starts[i-1]<minutes)||starts[0]+1440-starts.at(-1)<minutes) throw new AppError('بازه‌های حضور نباید همپوشانی داشته باشند.');
      const instagram=text(input.instagram,0,100);if(instagram&&!/^[a-zA-Z0-9._]+$/.test(instagram)) throw new AppError('شناسه اینستاگرام معتبر نیست.');
      await c.query('SELECT id FROM restaurant_settings WHERE id=1 FOR UPDATE');
      await c.query('UPDATE restaurant_settings SET address=$1,phone=$2,hours=$3,instagram=$4,capacity=$5,max_guests=$6,horizon_days=$7,slot_times=$8,slot_minutes=$9 WHERE id=1',[
        text(input.address,1,300),text(input.phone,0,30),text(input.hours,1,200),instagram,integer(input.capacity,1,200),integer(input.max_guests,1,20),integer(input.horizon_days,1,90),JSON.stringify(times.sort()),minutes]);
    } else if(resource==='users') {
      target=identifier(input.username);
      const role=input.role;if(!['admin','staff'].includes(role)) throw new AppError('نقش معتبر نیست.');
      const active=boolean(input.active),password=input.password;
      // Serialize all account changes so two admins cannot disable one another concurrently.
      await c.query('SELECT pg_advisory_xact_lock(86420)');
      const {rows:[existing]}=await c.query('SELECT * FROM admin_users WHERE username=$1',[target]);
      if(existing?.id===user.id && (!active||role!=='admin')) throw new AppError('نقش یا فعالیت حساب فعلی خود را نمی‌توانید حذف کنید.');
      if(existing && existing.role==='admin' && existing.active && (!active||role!=='admin')) {
        const {rows:[others]}=await c.query("SELECT count(*)::int n FROM admin_users WHERE active AND role='admin' AND id<>$1",[existing.id]);
        if(!others.n) throw new AppError('حداقل یک مدیر فعال لازم است.');
      }
      if(existing) {
        const encoded=password?await hashPassword(password):existing.password_hash;
        await c.query('UPDATE admin_users SET role=$2,active=$3,password_hash=$4,session_version=session_version+1 WHERE id=$1',[existing.id,role,active,encoded]);
      } else await c.query('INSERT INTO admin_users(id,username,password_hash,role,active) VALUES($1,$2,$3,$4,$5)',[randomUUID(),target,await hashPassword(password),role,active]);
    } else throw new AppError('بخش پیدا نشد.',404);
    await c.query('INSERT INTO audit_log(id,actor_id,action,target) VALUES($1,$2,$3,$4)',[randomUUID(),user.id,`${resource}.${input.remove?'archive':'save'}`,target]);return {ok:true};
  });
}
