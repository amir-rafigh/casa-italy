import type { CarouselConfig, CarouselPosition } from "@/types/carousel";

export function wrapIndex(value: number, count: number): number {
  return count > 0 ? ((value % count) + count) % count : 0;
}

export function circularOffset(index: number, progress: number, count: number) {
  return wrapIndex(index - progress + count / 2, count) - count / 2;
}

export function carouselPosition(
  offset: number,
  config: CarouselConfig,
  count = 4,
): CarouselPosition {
  const distance = Math.abs(offset);
  const angle = offset * config.angleStep;
  const depth = Math.min(distance, 1);
  // Vanish before the circular wrap seam; a four-item loop never teleports
  // a visible plate from one edge to the other.
  const seam = Math.min(1.8, count / 2);
  const visibility = Math.max(0, Math.min(1, (seam - distance) / 0.4));
  return {
    x: Math.sin(angle) * config.radiusX,
    y: (1 - Math.cos(angle)) * config.radiusY,
    scale: config.activeScale + (config.inactiveScale - config.activeScale) * depth,
    rotation: Math.sin(angle) * config.maxRotation,
    opacity: (1 - depth * 0.35) * visibility,
    zIndex: Math.round(100 - distance * 20),
  };
}
