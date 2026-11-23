export interface CarouselEntry {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePresentation?: "photo" | "cutout";
}

export interface CarouselConfig {
  radiusX: number;
  radiusY: number;
  angleStep: number;
  activeScale: number;
  inactiveScale: number;
  maxRotation: number;
  duration: number;
}

export interface CarouselPosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}
