import type { Metadata } from "next";
import { CasaLanding } from "@/components/pizza/cavasaitaly/landing/CasaLanding";
import { casaProducts } from "@/data/pizza/cavasaitaly/products";

export const metadata: Metadata = {
  title: "کازا ایتالی | به خانهٔ طعم‌های ایتالیایی خوش آمدید",
  description: "یک برش از ایتالیا، سر میز شما. منوی کازا ایتالی، رزرو میز و ارتباط با ما در یک نگاه.",
  robots: { index: false, follow: false },
};

export default function CasaLandingPage() {
  const selection = ["meatball", "steak", "pesto"].flatMap(id =>
    casaProducts.filter(product => product.id === id),
  );

  return <CasaLanding products={selection} />;
}