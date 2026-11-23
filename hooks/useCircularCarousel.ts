"use client";

import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { responsiveCarouselConfig } from "@/lib/carousel/carousel.config";
import { carouselPosition, circularOffset, wrapIndex } from "@/lib/carousel/carousel.math";
import type { CarouselConfig } from "@/types/carousel";

gsap.registerPlugin(useGSAP);

interface Options {
  count: number;
  direction?: "rtl" | "ltr";
  config?: Partial<CarouselConfig>;
}

export function useCircularCarousel({ count, direction = "ltr", config }: Options) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controller = useRef<{
    move: (delta: number) => void;
    select: (index: number) => void;
  } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const drag = useRef<{ id: number; x: number; y: number; horizontal: boolean } | null>(null);
  const suppressClick = useRef(false);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container || count === 0) return;
    const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-carousel-item]"));
    const progress = { value: 0 };
    let target = 0;
    let currentIndex = 0;
    let settings = responsiveCarouselConfig(container.clientWidth, config);
    let tween: gsap.core.Tween | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = () => {
      nodes.forEach((node, index) => {
        const offset = circularOffset(index, progress.value, count);
        const position = carouselPosition(offset, settings, count);
        gsap.set(node, { ...position, x: position.x * (direction === "rtl" ? -1 : 1), xPercent: -50, yPercent: -50 });
        // Only the center and immediate neighbors participate in tab order.
        node.tabIndex = position.opacity > 0.3 ? 0 : -1;
        node.setAttribute("aria-hidden", String(position.opacity < 0.05));
        node.style.pointerEvents = position.opacity < 0.05 ? "none" : "auto";
        if (position.opacity < 0.05 && document.activeElement === node) {
          container.focus({ preventScroll: true });
        }
      });
      const nextIndex = wrapIndex(Math.round(progress.value), count);
      if (nextIndex !== currentIndex) {
        currentIndex = nextIndex;
        setActiveIndex(nextIndex);
      }
    };

    const animate = () => {
      tween?.kill();
      if (reducedMotion.matches) {
        progress.value = target;
        draw();
        return;
      }
      tween = gsap.to(progress, {
        value: target,
        duration: settings.duration,
        ease: "power3.inOut",
        onUpdate: draw,
        onComplete: () => {
          // Rebase by whole turns to avoid accumulating large float values.
          progress.value = target = wrapIndex(target, count);
          draw();
        },
      });
    };

    controller.current = {
      move(delta) { if (count > 1) { target += delta; animate(); } },
      select(index) {
        if (count > 1) {
          target += circularOffset(index, target, count);
          animate();
        }
      },
    };
    const resize = new ResizeObserver(() => {
      settings = responsiveCarouselConfig(container.clientWidth, config);
      draw();
    });
    resize.observe(container);
    const onMotionChange = () => { if (reducedMotion.matches) { tween?.kill(); progress.value = target; draw(); } };
    reducedMotion.addEventListener("change", onMotionChange);
    draw();
    return () => {
      tween?.kill();
      resize.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
      controller.current = null;
    };
  }, { scope: containerRef, dependencies: [count, config, direction], revertOnUpdate: true });

  const move = useCallback((delta: number) => controller.current?.move(delta), []);
  const select = useCallback((index: number) => {
    controller.current?.select(index);
  }, []);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const physicalDirection = event.key === "ArrowLeft" ? -1 : 1;
      move(direction === "rtl" ? -physicalDirection : physicalDirection);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      controller.current?.select(event.key === "Home" ? 0 : count - 1);
    }
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || count < 2) return;
    suppressClick.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Keep tracking through initial vertical drift and suppress clicks after a drag.
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
      suppressClick.current = true;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      start.horizontal = true;
    }
  };
  const finishDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    drag.current = null;
    if (cancelled) suppressClick.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dx = event.clientX - start.x;
    if (!cancelled && start.horizontal && Math.abs(dx) >= 32) {
      // RTL: swipe right brings the next product from the left edge.
      move(Math.sign(dx) * (direction === "rtl" ? 1 : -1));
    }
  };

  return {
    containerRef, activeIndex, move, select,
    interactionProps: {
      onKeyDown, onPointerDown, onPointerMove,
      onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => finishDrag(event),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finishDrag(event, true),
    },
  };
}
