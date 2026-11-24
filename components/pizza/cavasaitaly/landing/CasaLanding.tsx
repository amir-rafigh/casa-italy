"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MenuData } from "@/types/mvp";
import { useLiveMenu } from "@/components/mvp/useLiveMenu";
import { HeroVideo } from "./HeroVideo";
import { LandingIcon, type LandingIconName } from "./LandingIcon";
import { ContactPanel, FeedbackPanel, ReservationPanel } from "./LandingPanels";
import styles from "./CasaLanding.module.css";

type Panel = "reservation" | "contact" | "feedback";
const panels: { id: Panel; title: string; label: string; icon: LandingIconName }[] = [
  { id: "reservation", title: "رزرو میز", label: "رزرو میز", icon: "calendar" },
  { id: "contact", title: "ارتباط با ما", label: "ارتباط با ما", icon: "phone" },
  { id: "feedback", title: "نظرات و پیشنهادها", label: "نظرات و پیشنهادها", icon: "message" },
];

export function CasaLanding({ initialData }: { initialData: MenuData }) {
  const {data,error}=useLiveMenu(initialData);
  const products=data.products.filter(p=>["meatball","steak","pesto"].includes(p.id));
  const [panel, setPanel] = useState<Panel | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!panel) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [panel]);

  function openPanel(next: Panel) {
    if (!dialogRef.current?.open) lastTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPanel(next);
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }

  function onClose() {
    setPanel(null);
    lastTrigger.current?.focus({ preventScroll: true });
  }

  return <div className={styles.page} id="casa-top">
    <a className={styles.skipLink} href="#casa-welcome">رفتن به محتوای صفحه</a>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a className={styles.brand} href="#casa-top" aria-label="کازا ایتالی، خانهٔ طعم‌های ایتالیایی">
          <span className={styles.persianBrand}>کازا ایتالی</span>
          <span className={styles.brandDivider} />
          <span className={styles.wordmark} lang="en" dir="ltr">CASA ITALY<span className={styles.tricolor} aria-hidden="true"><i /><i /><i /></span></span>
        </a>
        <Link href="/" className={styles.headerMenu}><LandingIcon name="menu" size={17} />منو</Link>
      </div>
    </header>

    <main>
      {error && <p role="status">{error}</p>}
      <HeroVideo />
      <section className={styles.welcome} id="casa-welcome" aria-labelledby="casa-title">
        <p className={styles.eyebrow} lang="it" dir="ltr"><span />BENVENUTI A CASA<span /></p>
        <p className={styles.greeting}>به کازا خوش آمدید</p>
        <h1 id="casa-title">یک برش از ایتالیا،<br />سر میز شما.</h1>
        <p className={styles.subtitle}>طعم‌های ایتالیایی، لحظه‌های به‌یادماندنی</p>
        <Link className={styles.mainCta} href="/"><LandingIcon name="menu" size={23} />مشاهده منو</Link>
      </section>

      <section className={styles.selection} aria-labelledby="casa-selection-title">
        <div className={styles.ornament} aria-hidden="true"><span /><LandingIcon name="leaf" size={28} /><span /></div>
        <div className={styles.sectionHeading}><h2 id="casa-selection-title">از طعم‌های کازا</h2><Link href="/">همهٔ منو<LandingIcon name="menu" size={16} /></Link></div>
        <div className={styles.pizzaGrid}>
          {products.map((product, index) => <Link href="/" className={`${styles.pizza} ${index === 0 ? styles.featuredPizza : ""}`} key={product.id} aria-label={`مشاهدهٔ ${product.name} و دیگر پیتزاها در منوی کازا`}>
            <div className={styles.pizzaVisual}><Image src={product.image} width={900} height={900} alt={product.imageAlt} sizes={index === 0 ? "(max-width: 700px) 67vw, 380px" : "(max-width: 700px) 45vw, 340px"} /></div>
            <div className={styles.pizzaText}><span className={styles.pizzaEnglish} lang="en" dir="ltr">{product.englishName}</span><h3>{product.name}</h3><span className={styles.pizzaRule} /><p>{new Intl.NumberFormat("fa-IR").format(product.price || 0)} تومان · آزمایشی {product.available === false && "· ناموجود"}</p>{index === 0 && <p>موزارلا، گوجه<br className={styles.mobileBreak} /> و ریحان تازه</p>}</div>
          </Link>)}
        </div>
      </section>

      <footer className={styles.footer}><span /><a href="#casa-top" lang="en" dir="ltr" aria-label="کازا ایتالی، بازگشت به بالای صفحه">CASA ITALY</a><span /></footer>
    </main>

    <nav className={styles.bottomNav} aria-label="دسترسی سریع کازا ایتالی">
      <div className={styles.bottomNavInner}>
        <Link href="/" className={styles.menuTab}><span className={styles.tabIcon}><LandingIcon name="menu" size={25} /></span><span>منو</span></Link>
        {panels.map(item => <button key={item.id} type="button" onClick={() => openPanel(item.id)} aria-controls="casa-service-panel" aria-expanded={panel === item.id} data-active={panel === item.id}>
          <span className={styles.tabIcon}><LandingIcon name={item.icon} size={25} /></span><span>{item.label}</span>
        </button>)}
      </div>
    </nav>

    <dialog id="casa-service-panel" ref={dialogRef} className={styles.sheet} aria-labelledby="casa-panel-title" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className={styles.sheetHandle} aria-hidden="true" />
      <div className={styles.sheetHeading}><div><p lang="en" dir="ltr">CASA ITALY</p><h2 id="casa-panel-title">{panels.find(item => item.id === panel)?.title}</h2></div><button type="button" className={styles.closeButton} aria-label="بستن پنجره" onClick={() => dialogRef.current?.close()}><LandingIcon name="close" /></button></div>
      <div className={styles.sheetContent} key={panel}>
        {panel === "reservation" && <ReservationPanel />}
        {panel === "contact" && <ContactPanel settings={data.settings} onReserve={() => openPanel("reservation")} />}
        {panel === "feedback" && <FeedbackPanel />}
      </div>
    </dialog>
  </div>;
}
