import Image from "next/image";
import type { CSSProperties } from "react";
import type { CarouselEntry } from "@/types/carousel";

interface Props {
  item: CarouselEntry;
  index: number;
  active: boolean;
  nearby: boolean;
  className: string;
  label: string;
  onSelect: () => void;
}

export function CarouselItem({ item, index, active, nearby, className, label, onSelect }: Props) {
  return (
    <button
      type="button"
      data-carousel-item
      data-presentation={item.imagePresentation ?? "cutout"}
      className={className}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      onClick={onSelect}
      tabIndex={index === 0 ? 0 : -1}
      style={{ opacity: index === 0 ? 1 : 0 } as CSSProperties}
    >
      {nearby && <Image
        src={encodeURI(item.image)}
        alt={item.imageAlt}
        width={item.imageWidth ?? 1408}
        height={item.imageHeight ?? 1128}
        sizes="(max-width: 600px) 90vw, (max-width: 1000px) 65vw, 540px"
        loading="eager"
        fetchPriority={index === 0 ? "high" : "auto"}
        draggable={false}
      />}
    </button>
  );
}
