'use client';

/**
 * Franja-carrusel de video-testimonios — v4 (re-skin editorial DESINFLÁMATE).
 *
 * Mismo comportamiento performante de v3 (poster-first: 0 iframes hasta el click,
 * máx 1 video vivo), pero el DISEÑO matchea el VSL de German: editorial y cálido
 * (fondo claro, texto navy #303841, acento naranja #FF5722) en vez del look oscuro
 * "digital". Reusa las CSS vars de fuente del propio VSL (--font-display / --font-sans),
 * porque la franja se renderiza vía portal DENTRO del iframe del VSL.
 */

import { useEffect, useRef, useState } from 'react';

type TestimonialVideo = {
  id: string; // YouTube id (debe permitir inserción)
  name: string; // nombre y apellido
  age: number | null; // edad
  review: string; // reseña corta
};

// TODO(germán): reemplazar por testimonios reales embebibles (Shorts, 2–3 basta).
const TESTIMONIAL_VIDEOS: TestimonialVideo[] = [
  { id: 'MXugMSBXo4Y', name: 'Giulia Chiappe', age: null, review: 'Su experiencia con Desinflámate.' },
  { id: 'aqz-KE-bpKQ', name: 'Testimonio demo', age: 38, review: 'Reseña de ejemplo — reemplazar por real.' },
  { id: 'ScMzIvxBSi4', name: 'Testimonio demo', age: 45, review: 'Reseña de ejemplo — reemplazar por real.' },
];

const REPEATS = 3;
const ORANGE = '#FF5722';
const NAVY = '#303841';
const NAVY_SOFT = '#5a6470';
const SANS = 'var(--font-sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)';
const DISPLAY = 'var(--font-display, var(--font-sans, Georgia, serif))';

function poster(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
function embedSrc(id: string): string {
  const p = new URLSearchParams({
    autoplay: '1', playsinline: '1', rel: '0', modestbranding: '1', controls: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${p.toString()}`;
}

function Slot({
  video, slotKey, active, onSelect,
}: {
  video: TestimonialVideo; slotKey: string; active: boolean; onSelect: (k: string) => void;
}) {
  return (
    <div
      data-slot-key={slotKey}
      onClick={() => onSelect(slotKey)}
      style={{ flex: '0 0 auto', width: 208, cursor: 'pointer' }}
    >
      <div
        style={{
          position: 'relative', width: '100%', aspectRatio: '9 / 16',
          borderRadius: 16, overflow: 'hidden', background: '#efe9e1',
          border: active ? `2px solid ${ORANGE}` : '1px solid rgba(48,56,65,.08)',
          boxShadow: active
            ? '0 16px 34px -12px rgba(255,87,34,.35)'
            : '0 10px 26px -12px rgba(48,56,65,.3)',
          transition: 'box-shadow .25s, transform .25s, border-color .25s',
          transform: active ? 'translateY(-2px)' : 'none',
        }}
      >
        {active ? (
          <iframe
            src={embedSrc(video.id)}
            title={`Testimonio de ${video.name}`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <>
            <img
              src={poster(video.id)} alt={`Testimonio de ${video.name}`} loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(48,56,65,.55) 100%)' }} />
            <span
              style={{
                position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 52, height: 52, borderRadius: '50%', background: ORANGE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(255,87,34,.45)',
              }}
            >
              <span style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '15px solid #fff', marginLeft: 4 }} />
            </span>
          </>
        )}
      </div>

      <div style={{ padding: '11px 2px 0', textAlign: 'left' }}>
        <strong style={{ display: 'block', fontFamily: SANS, fontSize: 15, fontWeight: 700, color: NAVY }}>
          {video.name}{video.age ? `, ${video.age}` : ''}
        </strong>
        <p style={{ margin: '3px 0 0', fontFamily: SANS, fontSize: 12.5, lineHeight: 1.4, color: NAVY_SOFT }}>
          {video.review}
        </p>
      </div>
    </div>
  );
}

export function TestimonialVideoCarousel() {
  const rootRef = useRef<HTMLElement>(null);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const reel = Array.from({ length: REPEATS }, () => TESTIMONIAL_VIDEOS).flat();
  const loop = [...reel, ...reel];

  useEffect(() => {
    if (!activeKey) return;
    const doc = rootRef.current?.ownerDocument ?? document;
    const onDocClick = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t.closest(`[data-slot-key="${activeKey}"]`)) setActiveKey(null);
    };
    doc.addEventListener('click', onDocClick, true);
    return () => doc.removeEventListener('click', onDocClick, true);
  }, [activeKey]);

  const paused = hoverPaused || activeKey !== null;

  return (
    <section
      ref={rootRef}
      style={{
        background: 'linear-gradient(180deg,#ffffff 0%,#faf7f2 100%)',
        padding: '44px 0 48px', overflow: 'hidden', fontFamily: SANS,
        borderTop: '1px solid rgba(48,56,65,.06)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28, padding: '0 22px' }}>
        <p style={{ color: ORANGE, fontFamily: SANS, fontWeight: 800, letterSpacing: '.16em', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>
          Historias reales · en video
        </p>
        <h2 style={{ color: NAVY, fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, margin: '8px auto 0', maxWidth: 320, lineHeight: 1.12 }}>
          Lo que dicen las que ya lo hicieron
        </h2>
      </div>

      <div
        className="vsl-marquee"
        style={{ maskImage: 'linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)' }}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onTouchStart={() => setHoverPaused(true)}
      >
        <div
          className="vsl-marquee-track"
          style={{ display: 'flex', gap: 16, width: 'max-content', padding: '6px 18px', animationPlayState: paused ? 'paused' : 'running' }}
        >
          {loop.map((v, i) => {
            const slotKey = `${v.id}-${i}`;
            return (
              <Slot
                key={slotKey} video={v} slotKey={slotKey}
                active={activeKey === slotKey}
                onSelect={(k) => setActiveKey((cur) => (cur === k ? null : k))}
              />
            );
          })}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: NAVY_SOFT, fontFamily: SANS, fontSize: 12.5, margin: '20px 22px 0' }}>
        Tocá un video para reproducirlo con audio
      </p>

      <style>{`
        .vsl-marquee { width: 100%; }
        .vsl-marquee-track { animation: vsl-scroll 52s linear infinite; will-change: transform; }
        @keyframes vsl-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .vsl-marquee-track { animation: none; }
          .vsl-marquee { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
      `}</style>
    </section>
  );
}
