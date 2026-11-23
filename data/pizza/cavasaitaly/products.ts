import type { Product } from "@/types/product";

export interface CasaProduct extends Product {
  englishName: string;
  ingredients: readonly string[];
}

const imageRoot = "/brands/pizza/cavasaitaly/products/cutouts";

// Names transcribed from the supplied menu; descriptive copy is for the demo.
// Prices were not supplied. Ingredient summaries are not allergen declarations.
export const casaProducts: readonly CasaProduct[] = [
  {
    id: "meatball", name: "میت‌بال", englishName: "MEATBALL", category: "meat",
    image: `${imageRoot}/meatball.webp`, imageAlt: "پیتزای میت‌بال با ریحان تازه و گوجه", imageWidth: 900, imageHeight: 900,
    description: "میت‌بال، پنیر کش‌دار و عطر ریحان تازه؛ یک ترکیب ایتالیاییِ دوست‌داشتنی.",
    ingredients: ["میت‌بال", "موزارلا", "گوجه", "ریحان تازه"],
  },
  {
    id: "steak", name: "سیر و استیک", englishName: "STEAK & GARLIC", category: "meat",
    image: `${imageRoot}/steak.webp`, imageAlt: "پیتزای سیر و استیک با برش‌های گوشت و پیازچه", imageWidth: 900, imageHeight: 900,
    description: "برش‌های استیک روی پنیر، با عطر سیر و تازگی پیازچه؛ پر از طعم، تا آخرین برش.",
    ingredients: ["استیک", "سیر", "پنیر", "پیازچه"],
  },
  {
    id: "chicken", name: "مرغ و اسفناج", englishName: "CHICKEN & SPINACH", category: "poultry",
    image: `${imageRoot}/chicken.webp`, imageAlt: "پیتزای مرغ و اسفناج با لبه‌های برشته", imageWidth: 900, imageHeight: 900,
    description: "مرغ، اسفناج و پنیر روی خمیر لطیف و برشته؛ ساده، خوش‌عطر و دل‌چسب.",
    ingredients: ["مرغ", "اسفناج", "پنیر"],
  },
  {
    id: "bacon", name: "بیکن و قارچ", englishName: "BACON & MUSHROOM", category: "meat",
    image: `${imageRoot}/bacon.webp`, imageAlt: "پیتزای بیکن و قارچ با سبزی تازه", imageWidth: 900, imageHeight: 900,
    description: "بیکن و قارچ در کنار پنیر و سبزی تازه؛ ترکیبی آشنا با حال‌وهوای کازا.",
    ingredients: ["بیکن", "قارچ", "پنیر", "سبزی تازه"],
  },
  {
    id: "eggplant", name: "بادمجان و پاپریکا", englishName: "EGGPLANT & PAPRIKA", category: "vegetarian",
    image: `${imageRoot}/eggplant.webp`, imageAlt: "پیتزای بادمجان و پاپریکا با روکولای تازه", imageWidth: 900, imageHeight: 900,
    description: "بادمجان، پاپریکا و یک مشت سبزی تازه؛ یک انتخاب رنگی برای سلیقه‌های سبز.",
    ingredients: ["بادمجان", "پاپریکا", "پنیر", "روکولا"],
  },
  {
    id: "brisket", name: "بریسکت", englishName: "BRISKET", category: "meat",
    image: `${imageRoot}/brisket.webp`, imageAlt: "پیتزای بریسکت با حلقه‌های پیاز و فلفل", imageWidth: 900, imageHeight: 900,
    description: "بریسکت، حلقه‌های پیاز و پنیر روی خمیر ناپولیتن؛ یک برش با شخصیت.",
    ingredients: ["بریسکت", "پیاز", "فلفل", "پنیر"],
  },
  {
    id: "pesto", name: "بوقلمون پستو", englishName: "TURKEY & PESTO", category: "poultry",
    image: `${imageRoot}/pesto.webp`, imageAlt: "پیتزای بوقلمون پستو با گوجه و پنیر", imageWidth: 900, imageHeight: 900,
    description: "عطر پستو، بوقلمون و گوجه در کنار پنیر؛ طعمی تازه از آشپزخانهٔ ایتالیایی.",
    ingredients: ["بوقلمون", "پستو", "گوجه", "پنیر"],
  },
];

export const casaCategories = [
  { id: "all", name: "همهٔ پیتزاها", icon: "pizza" },
  { id: "meat", name: "گوشت", icon: "flame" },
  { id: "poultry", name: "مرغ و بوقلمون", icon: "spark" },
  { id: "vegetarian", name: "گیاهی", icon: "leaf" },
] as const;
