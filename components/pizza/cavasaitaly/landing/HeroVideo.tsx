"use client";

import { useEffect, useRef, useState } from "react";
import { LandingIcon } from "./LandingIcon";
import styles from "./CasaLanding.module.css";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wantsPlayback = useRef(true);
  const visible = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    wantsPlayback.current = !motion.matches;
    const syncPlayback = () => {
      if (wantsPlayback.current && visible.current && !document.hidden) {
        void video.play().catch(() => setPlaying(false));
      } else video.pause();
    };
    const onMotion = () => { wantsPlayback.current = !motion.matches; syncPlayback(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.1 });
    observer.observe(video);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    wantsPlayback.current = video.paused;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }

  return <section className={styles.videoSection} aria-label="از آشپزخانهٔ کازا ایتالی">
    <video ref={videoRef} className={styles.heroVideo} width={1280} height={720}
      poster="/brands/pizza/cavasaitaly/landing/casa-kitchen-poster.jpg"
      src="/brands/pizza/cavasaitaly/landing/casa-kitchen.mp4" muted={muted} loop playsInline preload="metadata"
      aria-label="نمایی از تنور، آماده‌سازی و پیتزاهای کازا ایتالی"
      onPlay={() => { setPlaying(true); setFailed(false); }} onPause={() => setPlaying(false)}
      onVolumeChange={event => setMuted(event.currentTarget.muted)} onError={() => setFailed(true)}>
      مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
    </video>
    <div className={styles.videoScrim} />
    <span className={styles.videoCaption}>از آشپزخانهٔ کازا، با عشق</span>
    <div className={styles.videoControls}>
      <button type="button" onClick={() => setMuted(value => !value)} aria-label={muted ? "فعال کردن صدای ویدئو" : "بی‌صدا کردن ویدئو"} aria-pressed={!muted}>
        <LandingIcon name={muted ? "mute" : "sound"} size={19} />
      </button>
      <button type="button" onClick={togglePlayback} aria-label={playing ? "توقف ویدئو" : "پخش ویدئو"}>
        <LandingIcon name={playing ? "pause" : "play"} size={18} />
      </button>
    </div>
    {failed && <div className={styles.videoError} role="status">
      <p>پخش ویدئو ممکن نشد.</p>
      <button type="button" onClick={() => { const video = videoRef.current; if (video) { setFailed(false); wantsPlayback.current = true; video.load(); void video.play().catch(() => setFailed(true)); } }}>تلاش دوباره</button>
    </div>}
  </section>;
}
