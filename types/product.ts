export interface Product {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePresentation?: "photo" | "cutout";
  price?: number;
  description?: string;
  category: string;
  /** Descriptive display label, not a verified menu name. */
  temporaryLabel?: boolean;
}

export interface Category {
  id: string;
  name: string;
}
