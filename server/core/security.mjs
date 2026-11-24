import { randomBytes, scrypt as rawScrypt, timingSafeEqual, createHash, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { query } from './db.mjs';
const scrypt = promisify(rawScrypt);
export class AppError extends Error { constructor(message, status=400) { super(message); this.status=status; } }
export const hash = value => createHash('sha256').update(value).digest('hex');
export async function hashPassword(password) {
  if(typeof password !== 'string' || password.length<12 || password.length>128) throw new AppError('گذرواژه باید بین ۱۲ تا ۱۲۸ نویسه باشد.');
  const salt=randomBytes(16).toString('hex');
  const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  if(typeof password!=='string' || password.length>128) return false;
  const [salt, encoded]=stored.split(':');
  const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
  const expected=Buffer.from(encoded,'hex');
  return expected.length===key.length && timingSafeEqual(key,expected);
}
export async function limit(key, max, seconds) {
  if(!process.env.NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET is required');
  const safeKey=createHmac('sha256',process.env.NEXTAUTH_SECRET).update(key).digest('hex');
  const {rows}=await query(`INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<=now() THEN 1 ELSE rate_limits.count+1 END,
    expires_at=CASE WHEN rate_limits.expires_at<=now() THEN excluded.expires_at ELSE rate_limits.expires_at END RETURNING count`,[safeKey,seconds]);
  if(rows[0].count>max) throw new AppError('درخواست‌های زیادی ثبت شده؛ کمی بعد دوباره تلاش کنید.',429);
}
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function text(value,min=1,max=200) {
  if(typeof value!=='string' || value.trim().length<min || value.trim().length>max) throw new AppError('طول متن واردشده معتبر نیست.');
  return value.trim();
}
export function integer(value,min,max) {
  if(typeof value!=='number' || !Number.isInteger(value) || value<min || value>max) throw new AppError('عدد واردشده خارج از محدوده است.');
  return value;
}
export function boolean(value) { if(typeof value!=='boolean') throw new AppError('وضعیت واردشده معتبر نیست.'); return value; }
export function identifier(value) { const result=text(value,1,60); if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) throw new AppError('شناسه فقط حروف کوچک لاتین، عدد و خط تیره دارد.'); return result; }
