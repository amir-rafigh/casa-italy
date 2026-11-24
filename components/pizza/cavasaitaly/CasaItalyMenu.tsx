"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { CircularCarousel } from "@/components/shared/carousel/CircularCarousel";
import { type CasaProduct } from "@/data/pizza/cavasaitaly/products";
import { CasaIcon } from "./CasaIcon";
import styles from "./CasaItalyMenu.module.css";

import type { MenuData } from "@/types/mvp";
import { useLiveMenu } from "@/components/mvp/useLiveMenu";

const classes = { stage: styles.stage, item: styles.item, controls: styles.controls, dots: styles.dots, counter: styles.counter };
const labels = { region: "پیتزاهای کازا ایتالی؛ برای تغییر ورق بزنید", previous: "پیتزای قبلی", next: "پیتزای بعدی", item: (name: string) => `نمایش پیتزای ${name}` };
const carouselConfig = { inactiveScale: 0.55, maxRotation: 17, duration: 0.85 };
const number = new Intl.NumberFormat("fa-IR");

export function CasaItalyMenu({ initialData }: { initialData: MenuData }) {
  const {data,error} = useLiveMenu(initialData);
  const {products} = data;
  const casaCategories = [{id:"all",name:"همهٔ پیتزاها",icon:"pizza"},...data.categories.map(c=>({...c,icon:c.id==="vegetarian"?"leaf":"pizza"}))];
  const [category, setCategory] = useState("all");
  const aboutRef = useRef<HTMLDialogElement>(null);
  const filtered = products.filter(product => category === "all" || product.category === category);

  return <div className={styles.page}>
    <div className={styles.topline} aria-hidden="true"><i /><i /><i /></div>
    <header className={styles.header}>
      <Link href="/landing" className={styles.brand} aria-label="بازگشت به صفحهٔ اصلی کازا ایتالی" title="بازگشت به صفحهٔ اصلی">
        <span className={styles.logoWindow}><Image src="/brands/pizza/cavasaitaly/logo/instagram-profile.png" width={887} height={474} alt="CASA ITALY" className={styles.logo} preload /></span>
        <span className={styles.brandCaption}>خانهٔ طعم‌های ایتالیایی<span lang="en" dir="ltr">NAPOLITAN PIZZA & PASTA</span></span>
      </Link>
      <nav className={styles.nav} aria-label="ناوبری اصلی">
        <a href="#menu" aria-current="page">منوی کازا<span /></a>
        <button onClick={() => aboutRef.current?.showModal()}>داستان کازا</button>
      </nav>
      <a className={styles.social} href="https://www.instagram.com/casaitaly.restaurant/" target="_blank" rel="noreferrer" aria-label="اینستاگرام کازا ایتالی">
        <span>کازا در اینستاگرام</span><CasaIcon name="instagram" size={19} />
      </a>
    </header>

    <main id="menu" className={styles.main}>
      {error && <p role="status" style={{textAlign:"center"}}>{error}</p>}
      <section className={styles.intro} aria-labelledby="menu-title">
        <p className={styles.eyebrow}><span />از ناپولی، با عشق<span /></p>
        <h1 id="menu-title">یک برش از <em>ایتالیا.</em></h1>
        <p className={styles.subtitle}>خمیرِ باحوصله، موادِ تازه، طعمی که یادت می‌ماند.</p>
      </section>

      <div className={styles.categories} role="group" aria-label="دسته‌بندی پیتزاها">
        {casaCategories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>
          <CasaIcon name={item.icon} size={18} /><span>{item.name}</span><small>{number.format(products.filter(product => item.id === "all" || product.category === item.id).length)}</small>
        </button>)}
      </div>

      <div className={styles.showcase}>
        <div className={styles.backgroundWord} aria-hidden="true" lang="en" dir="ltr">BUON APPETITO</div>
        <div className={styles.orbit} aria-hidden="true" />
        <div className={`${styles.craftNote} ${styles.doughNote}`} aria-hidden="true"><span className={styles.noteIcon}>۷۲</span><span>ساعت صبوری<small>برای یک خمیرِ بی‌نظیر</small></span></div>
        <div className={`${styles.craftNote} ${styles.freshNote}`} aria-hidden="true"><CasaIcon name="leaf" size={32} /><span>تازه، هر روز<small>از دل طبیعت تا میز شما</small></span></div>
        {filtered.length > 0 && <CircularCarousel key={`${category}:${filtered.map(p=>p.id).join(',')}`} items={filtered} direction="rtl" config={carouselConfig} classes={classes} labels={labels}
          renderDetails={product => <ProductDetails key={product.id} product={product} />} />}
        {!filtered.length && <p style={{textAlign:"center",padding:50}}>در این دسته محصولی برای نمایش وجود ندارد.</p>}
      </div>
      <p className={styles.gesture}><span aria-hidden="true">⟷</span> ورق بزن؛ طعمِ بعدی منتظرته.</p>
    </main>

    <footer className={styles.footer}>
      <span className={styles.address}><CasaIcon name="pin" size={16} />اردبیل، سعدی<span className={styles.footerDivider} />رستوران کازا ایتالی</span>
      <span className={styles.footerMotto} lang="en" dir="ltr">A LITTLE ITALY. A LOT OF LOVE.</span>
      <span className={styles.demoNote}>قیمت‌ها و رزروها آزمایشی‌اند<span className={styles.statusDot} /></span>
    </footer>

    <dialog ref={aboutRef} className={styles.dialog} onClick={event => { if (event.target === event.currentTarget) aboutRef.current?.close(); }}>
      <div className={styles.dialogInner}>
        <button className={styles.close} onClick={() => aboutRef.current?.close()} aria-label="بستن داستان کازا"><CasaIcon name="close" /></button>
        <p className={styles.eyebrow}>CASA یعنی خانه</p>
        <h2>یک تکه ایتالیا،<br />در قلب اردبیل.</h2>
        <p>در کازا ایتالی، قصه از خمیر شروع می‌شود؛ خمیری با ۷۲ ساعت تخمیر و ۷۰ درصد هیدراسیون، با لبه‌های پف‌دار و لکه‌های برشتهٔ سبک ناپولیتن.</p>
        <p>این دمو برای کشف پیتزاهاست. برای اطلاع از قیمت و ترکیبات دقیق، با رستوران در ارتباط باشید.</p>
        <Link href="/landing">کازا را بیشتر بشناسید</Link>
      </div>
    </dialog>
  </div>;
}

function ProductDetails({ product }: { product: CasaProduct }) {
  return <div className={styles.details}>
    <p className={styles.englishName} lang="en" dir="ltr">{product.englishName}</p>
    <h2>{product.name}</h2>
    <p className={styles.description}>{product.description}</p>
    <p className={styles.price}>{number.format(product.price || 0)} تومان <small>· قیمت آزمایشی</small> {product.available === false && <strong> · ناموجود</strong>}</p>
    <ul className={styles.ingredients} aria-label="ترکیبات نمایشی پیتزا">{product.ingredients.map(ingredient => <li key={ingredient}>{ingredient}</li>)}</ul>
  </div>;
}
