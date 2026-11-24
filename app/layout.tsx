import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: "../public/fonts/Vazirmatn-variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "کازا ایتالی | یک برش از ایتالیا",
  description: "منوی پیتزاهای ناپولیتن کازا ایتالی؛ یک سفر کوچک به ایتالیا، در قلب اردبیل.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body><div lang="fa" dir="rtl">{children}</div></body>
    </html>
  );
}
