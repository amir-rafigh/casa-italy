"use client";

import { useState, type FormEvent } from "react";
import { LandingIcon } from "./LandingIcon";
import styles from "./CasaLanding.module.css";

const reservationKey = "casa-italy:demo-reservation:v1";
const feedbackKey = "casa-italy:demo-feedback:v1";
const slots = ["18:00", "19:30", "21:00", "22:30"];
const persianNumber = new Intl.NumberFormat("fa-IR");

type Reservation = { id: string; name: string; phone: string; guests: number; date: string; time: string; status: "pending" | "cancelled" };

function demoId() {
  // randomUUID needs HTTPS; getRandomValues also works for a phone's LAN preview.
  return globalThis.crypto.randomUUID?.() ?? Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16)).join("-");
}

function digits(value: string) {
  return value.replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function today() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

function readReservation(): Reservation | null {
  try {
    const item = JSON.parse(localStorage.getItem(reservationKey) ?? "null");
    if (item && typeof item.id === "string" && typeof item.name === "string" && typeof item.phone === "string" &&
      Number.isInteger(item.guests) && item.guests >= 1 && item.guests <= 8 &&
      typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && slots.includes(item.time) &&
      Number.isFinite(Date.parse(`${item.date}T${item.time}:00+03:30`)) && ["pending", "cancelled"].includes(item.status)) return item;
  } catch { /* A blocked or cleared browser store must not break the landing. */ }
  return null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran", weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00+03:30`));
}

export function ReservationPanel() {
  const [reservation, setReservation] = useState<Reservation | null>(readReservation);
  const [error, setError] = useState("");
  const minDate = today();
  const maxDay = new Date(`${minDate}T12:00:00+03:30`);
  maxDay.setUTCDate(maxDay.getUTCDate() + 30);
  const maxDate = maxDay.toISOString().slice(0, 10);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = digits(String(data.get("phone") ?? "")).replace(/[\s()\-]/g, "").replace(/^(?:\+98|0098)/, "0");
    const guests = Number(data.get("guests"));
    const date = String(data.get("date") ?? "");
    const time = String(data.get("time") ?? "");
    const scheduled = Date.parse(`${date}T${time}:00+03:30`);
    if (name.length < 2) { setError("لطفاً نام خود را کامل وارد کنید."); return; }
    if (!/^09\d{9}$/.test(phone)) { setError("شماره موبایل را به‌صورت ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید."); return; }
    if (!Number.isInteger(guests) || guests < 1 || guests > 8 || !slots.includes(time) || !Number.isFinite(scheduled) || scheduled <= Date.now() || date < minDate || date > maxDate) {
      setError("لطفاً تاریخ و ساعتی در آینده، حداکثر تا ۳۰ روز دیگر انتخاب کنید."); return;
    }
    const next: Reservation = { id: demoId(), name, phone, guests, date, time, status: "pending" };
    try { localStorage.setItem(reservationKey, JSON.stringify(next)); }
    catch { setError("ذخیره در مرورگر ممکن نشد. دسترسی به فضای ذخیره‌سازی مرورگر را بررسی کنید."); return; }
    setError("");
    setReservation(next);
  }

  function cancel() {
    if (!reservation) return;
    const next: Reservation = { ...reservation, status: "cancelled" };
    try { localStorage.setItem(reservationKey, JSON.stringify(next)); setReservation(next); setError(""); }
    catch { setError("تغییر ذخیره نشد. دوباره تلاش کنید."); }
  }

  if (reservation) {
    // Preserve the source demo's per-render cancellation cutoff during migration.
    // eslint-disable-next-line react-hooks/purity
    const canCancel = Date.parse(`${reservation.date}T${reservation.time}:00+03:30`) - Date.now() >= 30 * 60 * 1000;
    return <div className={styles.result}>
      <span className={styles.resultIcon}><LandingIcon name={reservation.status === "pending" ? "check" : "calendar"} size={30} /></span>
      <h3>{reservation.status === "pending" ? "درخواست نمایشی ذخیره شد" : "رزرو نمایشی لغو شد"}</h3>
      <p>{reservation.name} عزیز، {reservation.status === "pending" ? "جزئیات درخواست شما:" : "می‌توانید درخواست تازه‌ای ثبت کنید."}</p>
      <dl className={styles.reservationDetails}>
        <div><dt>تاریخ</dt><dd>{formatDate(reservation.date)}</dd></div>
        <div><dt>ساعت</dt><dd>{digits(reservation.time).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])}</dd></div>
        <div><dt>مهمان‌ها</dt><dd>{persianNumber.format(reservation.guests)} نفر</dd></div>
        <div><dt>وضعیت</dt><dd>{reservation.status === "pending" ? "در انتظار بررسی · نمایشی" : "لغو شده · نمایشی"}</dd></div>
      </dl>
      <p className={styles.demoNotice}>این درخواست فقط در همین مرورگر ذخیره شده و به رستوران ارسال نشده است. رزرو واقعی انجام نشده است.</p>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      {reservation.status === "pending" && (canCancel ? <button type="button" className={styles.secondaryButton} onClick={cancel}>لغو درخواست نمایشی</button> : <p className={styles.fieldHint}>لغو درخواست تا ۳۰ دقیقه قبل از زمان انتخابی امکان‌پذیر است.</p>)}
      {reservation.status === "cancelled" && <button type="button" className={styles.primaryButton} onClick={() => { setReservation(null); setError(""); }}>درخواست جدید</button>}
    </div>;
  }

  return <form className={styles.form} onSubmit={submit}>
    <p className={styles.panelIntro}>برای یک دورهمی خوش‌طعم، میزتان را انتخاب کنید.</p>
    <p className={styles.demoNotice}>دموی رزرو: اطلاعات و ساعت‌ها نمایشی‌اند؛ درخواست فقط در همین مرورگر ذخیره می‌شود و به رستوران ارسال نمی‌شود.</p>
    <label>نام و نام خانوادگی<input name="name" autoComplete="name" required minLength={2} maxLength={60} placeholder="نام شما" /></label>
    <label>شماره موبایل<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} dir="ltr" placeholder="0912 345 6789" /></label>
    <div className={styles.formRow}>
      <label>تعداد مهمان<select name="guests" defaultValue="2">{Array.from({ length: 8 }, (_, i) => <option key={i} value={i + 1}>{persianNumber.format(i + 1)} نفر</option>)}</select></label>
      <label>تاریخ<input name="date" type="date" min={minDate} max={maxDate} defaultValue={minDate} required /></label>
    </div>
    <fieldset className={styles.timeSlots}>
      <legend>ساعت حضور <span>· نمایشی</span></legend>
      <div>{slots.map(time => <label key={time}><input type="radio" name="time" value={time} required /><span>{time.replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])}</span></label>)}</div>
    </fieldset>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <button className={styles.primaryButton} type="submit"><LandingIcon name="calendar" size={20} />ثبت درخواست نمایشی</button>
  </form>;
}

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

export function ContactPanel({ onReserve }: { onReserve: () => void }) {
  return <div className={styles.contact}>
    <p className={styles.panelIntro}>یک تکه ایتالیا، در قلب اردبیل.</p>
    <div className={styles.contactAddress}><span><LandingIcon name="pin" size={26} /></span><div><h3>کازا ایتالی</h3><p>اردبیل، سعدی</p></div></div>
    <a className={styles.contactLink} href="https://www.google.com/maps/search/?api=1&query=%DA%A9%D8%A7%D8%B2%D8%A7%20%D8%A7%DB%8C%D8%AA%D8%A7%D9%84%DB%8C%20%D8%A7%D8%B1%D8%AF%D8%A8%DB%8C%D9%84%20%D8%B3%D8%B9%D8%AF%DB%8C" target="_blank" rel="noreferrer"><LandingIcon name="pin" />جست‌وجوی کازا روی نقشه<span>نقشه</span></a>
    <a className={styles.contactLink} href="https://www.instagram.com/casaitaly.restaurant/" target="_blank" rel="noreferrer"><LandingIcon name="instagram" /><div>کازا در اینستاگرام<small dir="ltr">@casaitaly.restaurant</small></div></a>
    <p className={styles.contactNote}>برای ارتباط با کازا، در اینستاگرام پیام دهید.</p>
    <button type="button" className={styles.secondaryButton} onClick={onReserve}><LandingIcon name="calendar" size={20} />پیش‌نمایش رزرو میز</button>
  </div>;
}
