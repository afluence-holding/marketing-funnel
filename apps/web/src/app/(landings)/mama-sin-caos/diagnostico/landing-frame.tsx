'use client';

import { useEffect, useRef, useState } from 'react';

export default function LandingFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(900);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as { type?: string; height?: number } | null | undefined;
      if (!data || typeof data !== 'object') return;
      if (
        data.type === 'iframe-height' &&
        typeof data.height === 'number' &&
        data.height > 0
      ) {
        setHeight((prev) => (Math.abs(prev - data.height!) > 1 ? data.height! : prev));
      }
      // Al cambiar de pantalla dentro del iframe, subir el padre al tope del iframe.
      if (data.type === 'iframe-scroll-top' && ref.current) {
        ref.current.scrollIntoView({ block: 'start' });
      }
      if (data.type === 'iframe-height') applyPhotoMax();
    }
    // Mismo origen → seteamos la CSS var directo en el documento del iframe
    // (determinístico, sin depender del timing de postMessage). Acota la foto
    // del hero según el viewport real para dejar el CTA sobre el fold.
    function applyPhotoMax() {
      try {
        const doc = ref.current?.contentDocument;
        if (!doc) return;
        const ph = Math.max(110, Math.min(320, window.innerHeight - 590));
        doc.documentElement.style.setProperty('--photo-max', `${ph}px`);
      } catch {
        /* cross-origin guard — no aplica (mismo origen) */
      }
    }
    const iframe = ref.current;
    iframe?.addEventListener('load', applyPhotoMax);
    const tick = window.setInterval(applyPhotoMax, 400);
    const stop = window.setTimeout(() => window.clearInterval(tick), 4000);
    window.addEventListener('message', onMessage);
    window.addEventListener('resize', applyPhotoMax);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stop);
      iframe?.removeEventListener('load', applyPhotoMax);
      window.removeEventListener('message', onMessage);
      window.removeEventListener('resize', applyPhotoMax);
    };
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      style={{ width: '100%', height: `${height}px`, border: 'none', display: 'block' }}
    />
  );
}
