import type { CSSProperties, ReactNode } from "react";

export function CasaIcon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  const paths: Record<string, ReactNode> = {
    pizza: <><path d="M4 4c5-3 11-1 15 4l-8 13L4 4Z" /><path d="M5 8c4-2 7-1 11 2" /><circle cx="10" cy="11" r=".8" /><circle cx="12" cy="16" r=".8" /><circle cx="14" cy="11" r=".8" /></>,
    flame: <path d="M13 3c1 6 6 7 6 12a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 1 4 2 4 2-2 2-5 2-9Z" />,
    leaf: <><path d="M20 3c1 10-3 17-10 16-8-2-7-12 10-16Z" /><path d="m4 22 11-13M9 16l-1-5m4 2h5" /></>,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" /></>,
    pin: <><path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name] ?? paths.spark}</svg>;
}
