"use client";
import {useState,type FormEvent} from 'react';
import {signIn} from 'next-auth/react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import styles from '../admin.module.css';
export function LoginForm(){
 const router=useRouter();
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const data=new FormData(e.currentTarget);try{const result=await signIn('credentials',{username:data.get('username'),password:data.get('password'),redirect:false,callbackUrl:'/admin'});if(result?.error)setError('ورود انجام نشد؛ نام کاربری، گذرواژه و محدودیت تلاش را بررسی کنید.');else{router.push('/admin');router.refresh();}}catch{setError('ارتباط با سامانه برقرار نشد.');}finally{setBusy(false);}}
 return <main className={styles.shell}><section className={`${styles.panel} ${styles.login}`}><h1>ورود به مدیریت کازا</h1><p className={styles.notice}>نسخهٔ آزمایشی محلی</p><form className={styles.form} onSubmit={submit}><label>نام کاربری<input name="username" autoComplete="username" dir="ltr" required maxLength={60}/></label><label>گذرواژه<input name="password" type="password" autoComplete="current-password" required maxLength={128}/></label>{error&&<p role="alert" className={styles.error}>{error}</p>}<button className={styles.primary} disabled={busy}>{busy?'در حال ورود…':'ورود'}</button></form><Link href="/">بازگشت به منو</Link></section></main>;
}
