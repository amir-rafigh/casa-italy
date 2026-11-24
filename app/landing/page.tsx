import type { Metadata } from "next";
import { CasaLanding } from "@/components/pizza/cavasaitaly/landing/CasaLanding";
import { Suspense } from "react";
import { connection } from "next/server";
import { getMenu } from "@/server/data";

export const metadata: Metadata = {
  title: "کازا ایتالی | به خانهٔ طعم‌های ایتالیایی خوش آمدید",
  description: "یک برش از ایتالیا، سر میز شما. منوی کازا ایتالی، رزرو میز و ارتباط با ما در یک نگاه.",
  robots: { index: false, follow: false },
};

export default function CasaLandingPage() {
  return <Suspense fallback={<p style={{padding:40}}>در حال دریافت اطلاعات…</p>}><Content /></Suspense>;
}
async function Content(){await connection();return <CasaLanding initialData={await getMenu()} />;}
