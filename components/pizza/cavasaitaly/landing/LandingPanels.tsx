"use client";

import { useState, type FormEvent } from "react";
import { LandingIcon } from "./LandingIcon";
import styles from "./CasaLanding.module.css";

export { ReservationPanel } from "@/components/mvp/ReservationPanel";
import type { Settings } from "@/types/mvp";
const feedbackKey = "casa-italy:demo-feedback:v1";
const persianNumber = new Intl.NumberFormat("fa-IR");
function demoId() { return globalThis.crypto.randomUUID?.() ?? Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16)).join("-"); }

export function FeedbackPanel() {
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = String(data.get("message") ?? "").trim();
    if (!rating || message.length < 3) { setError("لطفاً امتیاز و چند کلمه دربارهٔ تجربه‌تان بنویسید."); return; }
    try {
      let previous: unknown;
      try { previous = JSON.parse(localStorage.getItem(feedbackKey) ?? "[]"); } catch { previous = []; }
      const entries = Array.isArray(previous) ? previous.slice(-19) : [];
      localStorage.setItem(feedbackKey, JSON.stringify([...entries, { id: demoId(), rating, message, createdAt: new Date().toISOString() }]));
    } catch { setError("ذخیره در مرورگر ممکن نشد. دسترسی به فضای ذخیره‌سازی مرورگر را بررسی کنید."); return; }
    setSaved(true);
  }

  if (saved) return <div className={styles.result} role="status">
    <span className={styles.resultIcon}><LandingIcon name="check" size={30} /></span>
    <h3>سپاس از همراهی‌تان</h3>
    <p>نظر شما در این دمو ذخیره شد.</p>
    <p className={styles.demoNotice}>این بازخورد فقط در همین مرورگر ذخیره شده و به رستوران ارسال نشده است.</p>
    <button type="button" className={styles.secondaryButton} onClick={() => { setSaved(false); setRating(0); setError(""); }}>نوشتن بازخورد دیگر</button>
  </div>;

  return <form className={styles.form} onSubmit={submit}>
    <p className={styles.panelIntro}>تجربه‌ات در کازا چطور بود؟<br /><span>شنیدن نظرت، شروع یک تجربهٔ بهتر است.</span></p>
    <fieldset className={styles.rating}>
      <legend>به تجربه‌تان چه امتیازی می‌دهید؟</legend>
      <div dir="ltr">{[1, 2, 3, 4, 5].map(value => <label key={value} data-filled={value <= rating}>
        <input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} required aria-label={`${persianNumber.format(value)} از ۵ ستاره`} />
        <LandingIcon name="star" size={32} />
      </label>)}</div>
    </fieldset>
    <label>نظرات و پیشنهادهای شما<textarea name="message" rows={4} minLength={3} maxLength={1000} required placeholder="از طعم غذا، فضای کازا یا پیشنهادهایتان بنویسید…" /></label>
    <p className={styles.demoNotice}>دموی بازخورد: نظر شما فقط در همین مرورگر ذخیره می‌شود و به رستوران ارسال نمی‌شود.</p>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <button className={styles.primaryButton} type="submit"><LandingIcon name="message" size={20} />ذخیرهٔ نظر در دمو</button>
  </form>;
}

export function ContactPanel({ onReserve, settings }: { onReserve: () => void; settings: Settings }) {
  return <div className={styles.contact}>
    <p className={styles.panelIntro}>یک تکه ایتالیا، در قلب اردبیل.</p>
    <div className={styles.contactAddress}><span><LandingIcon name="pin" size={26} /></span><div><h3>کازا ایتالی</h3><p>{settings.address}</p><p>{settings.hours}</p>{settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}</div></div>
    <a className={styles.contactLink} href="https://www.google.com/maps/search/?api=1&query=%DA%A9%D8%A7%D8%B2%D8%A7%20%D8%A7%DB%8C%D8%AA%D8%A7%D9%84%DB%8C%20%D8%A7%D8%B1%D8%AF%D8%A8%DB%8C%D9%84%20%D8%B3%D8%B9%D8%AF%DB%8C" target="_blank" rel="noreferrer"><LandingIcon name="pin" />جست‌وجوی کازا روی نقشه<span>نقشه</span></a>
    <a className={styles.contactLink} href={`https://www.instagram.com/${settings.instagram}/`} target="_blank" rel="noreferrer"><LandingIcon name="instagram" /><div>کازا در اینستاگرام<small dir="ltr">@{settings.instagram}</small></div></a>
    <p className={styles.contactNote}>برای ارتباط با کازا، در اینستاگرام پیام دهید.</p>
    <button type="button" className={styles.secondaryButton} onClick={onReserve}><LandingIcon name="calendar" size={20} />ثبت و پیگیری رزرو میز</button>
  </div>;
}
