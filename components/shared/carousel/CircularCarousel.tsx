"use client";

import type { ReactNode } from "react";
import { CarouselItem } from "./CarouselItem";
import { useCircularCarousel } from "@/hooks/useCircularCarousel";
import type { CarouselConfig, CarouselEntry } from "@/types/carousel";
import { circularOffset } from "@/lib/carousel/carousel.math";

interface Props<T extends CarouselEntry> {
  items: readonly T[];
  direction?: "rtl" | "ltr";
  config?: Partial<CarouselConfig>;
  classes: { stage: string; item: string; controls: string; dots: string; counter: string };
  labels: { region: string; previous: string; next: string; item: (name: string) => string };
  renderDetails: (item: T, index: number) => ReactNode;
}

export function CircularCarousel<T extends CarouselEntry>({ items, direction = "ltr", config, classes, labels, renderDetails }: Props<T>) {
  const { containerRef, activeIndex, move, select, interactionProps } = useCircularCarousel({ count: items.length, direction, config });
  const active = items[activeIndex];
  // Keep the pagination compact even for large collections.
  const firstDot = Math.max(0, Math.min(activeIndex - 2, items.length - 5));
  const paginationItems = items.slice(firstDot, firstDot + 5);
  if (!active) return null;
  return (
    <section role="region" aria-roledescription="carousel" aria-label={labels.region} dir={direction}>
      <div ref={containerRef} className={classes.stage} tabIndex={0} aria-label={labels.region} {...interactionProps}>
        {items.map((item, index) => (
          <CarouselItem key={item.id} item={item} index={index} active={index === activeIndex}
            nearby={Math.abs(circularOffset(index, activeIndex, items.length)) <= 2}
            className={classes.item} label={labels.item(item.name)} onSelect={() => select(index)} />
        ))}
      </div>
      <div aria-live="polite" aria-atomic="true">{renderDetails(active, activeIndex)}</div>
      <div className={classes.controls} onKeyDown={interactionProps.onKeyDown}>
        <button type="button" aria-label={labels.previous} disabled={items.length < 2} onClick={() => move(-1)}>
          <Arrow left={direction !== "rtl"} />
        </button>
        <div className={classes.dots}>
          {paginationItems.map((item, localIndex) => { const index = firstDot + localIndex; return <button type="button" key={item.id} aria-label={labels.item(item.name)}
            aria-current={index === activeIndex ? "true" : undefined} onClick={() => select(index)} />; })}
        </div>
        <button type="button" aria-label={labels.next} disabled={items.length < 2} onClick={() => move(1)}>
          <Arrow left={direction === "rtl"} />
        </button>
      </div>
      <div className={classes.counter} dir="ltr" aria-hidden="true">
        <span>{String(activeIndex + 1).padStart(2, "0")}</span><i />{String(items.length).padStart(2, "0")}
      </div>
    </section>
  );
}

function Arrow({ left }: { left: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: left ? undefined : "rotate(180deg)" }}>
    <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
