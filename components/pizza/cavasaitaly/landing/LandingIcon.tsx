import type { ReactNode } from "react";

export type LandingIconName = "menu" | "calendar" | "phone" | "message" | "close" | "pin" | "instagram" | "pause" | "play" | "sound" | "mute" | "check" | "leaf" | "star";

const paths: Record<LandingIconName, ReactNode> = {
  menu: <><path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z" /><path d="M12 5v15M5 8h4M5 12h4M15 8h4M15 12h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 11h18M7 15h1M12 15h1M17 15h.1M7 18h1M12 18h1" /></>,
  phone: <path d="m7 3 3 5-2 2c1 3 3 5 6 6l2-2 5 3c0 3-2 5-5 4C8 19 3 14 2 7c0-3 2-5 5-4Z" />,
  message: <><path d="M21 11a9 9 0 0 1-9 9 11 11 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5Z" /><path d="M8 11h.1M12 11h.1M16 11h.1" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" /></>,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  play: <path d="m8 4 12 8-12 8V4Z" />,
  sound: <><path d="m11 4-6 5H2v6h3l6 5V4ZM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16" /></>,
  mute: <><path d="m11 4-6 5H2v6h3l6 5V4ZM16 9l6 6M16 15l6-6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  leaf: <><path d="M4 21 20 3M10 15C1 15 2 8 3 5c7 0 9 3 7 10ZM13 11c-2-8 4-10 9-9 0 7-3 10-9 9ZM6 19c3-7 8-6 12-4-3 6-8 8-12 4Z" /></>,
  star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" />,
};

export function LandingIcon({ name, size = 24 }: { name: LandingIconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
