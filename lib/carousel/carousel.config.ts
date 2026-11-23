import type { CarouselConfig } from "@/types/carousel";

export const carouselConfig: CarouselConfig = {
  radiusX: 260,
  radiusY: 160,
  angleStep: Math.PI / 4,
  activeScale: 1,
  inactiveScale: 0.57,
  maxRotation: 3,
  duration: 0.8,
};

export function responsiveCarouselConfig(
  width: number,
  overrides?: Partial<CarouselConfig>,
): CarouselConfig {
  return {
    ...carouselConfig,
    radiusX: Math.min(width * 0.76, 680),
    radiusY: Math.min(width * 0.52, 260),
    ...overrides,
  };
}
