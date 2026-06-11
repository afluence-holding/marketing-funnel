'use client';

/**
 * Franja de video-testimonios — v6: rieles corridos (marquesina infinita) con las
 * tarjetas anchas (video + reseña AL COSTADO). Corre solo en bucle ("con pocos
 * parecen muchos"); se pausa al hover/touch o cuando hay un video reproduciéndose.
 * Performante: poster-first (0 iframes hasta el click, máx 1 video vivo); click
 * afuera vuelve al poster y reanuda la corrida. Diseño editorial DESINFLÁMATE
 * (claro, navy, naranja), reusa las fonts del VSL (portal dentro del iframe).
 */

import { useEffect, useRef, useState } from 'react';

type TestimonialVideo = {
  id: string; name: string; age: number | null; review: string;
};

// TODO(germán): reemplazar por testimonios reales embebibles (2–3 basta; corren en loop).
const TESTIMONIAL_VIDEOS: TestimonialVideo[] = [
  { id: 'MXugMSBXo4Y', name: 'Giulia Chiappe', age: null, review: '"Bajé la hinchazón en la primera semana y por fin entendí qué me estaba inflamando. Comiendo rico, sin dietas imposibles."' },
  { id: 'aqz-KE-bpKQ', name: 'Testimonio demo', age: 38, review: '"Reseña de ejemplo más larga — acá va el testimonio real de la alumna, con su resultado concreto y por qué recomienda el reto." (placeholder)' },
  { id: 'ScMzIvxBSi4', name: 'Testimonio demo', age: 45, review: '"Reseña de ejemplo — reemplazar por el testimonio real, con espacio para más detalle ahora que hay menos videos." (placeholder)' },
];

const REPEATS = 2; // repeticiones en el riel (ilusión de "muchos" con pocos clips).
const ORANGE = '#FF5722';
const NAVY = '#303841';
const NAVY_SOFT = '#5a6470';
const SANS = 'var(--font-sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)';
const DISPLAY = 'var(--font-display, var(--font-sans, Georgia, serif))';

const poster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const embedSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?` +
  new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0', modestbranding: '1', controls: '1' }).toString();

function Card({
  video, slotKey, active, onSelect,
}: { video: TestimonialVideo; slotKey: string; active: boolean; onSelect: (k: string) => void }) {
  return (
    <article
      data-slot-key={slotKey}
      onClick={() => onSelect(slotKey)}
      style={{
        flex: '0 0 340px', display: 'flex', gap: 14, alignItems: 'stretch',
        background: '#ffffff', border: '1px solid rgba(48,56,65,.08)',
        borderRadius: 18, padding: 12, cursor: 'pointer',
        boxShadow: active ? '0 16px 34px -14px rgba(255,87,34,.3)' : '0 12px 28px -16px rgba(48,56,65,.35)',
        transition: 'box-shadow .25s',
      }}
    >
      {/* Video (teléfono vertical) */}
      <div
        style={{
          position: 'relative', flex: '0 0 130px', aspectRatio: '9 / 16',
          borderRadius: 13, overflow: 'hidden', background: '#efe9e1', alignSelf: 'center',
          boxShadow: active ? `0 0 0 2px ${ORANGE}` : 'none',
        }}
      >
        {active ? (
          <iframe
            src={embedSrc(video.id)} title={`Testimonio de ${video.name}`}
            allow="autoplay; encrypted-media; fullscreen" allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <>
            <img src={poster(video.id)} alt={`Testimonio de ${video.name}`} loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(48,56,65,.5) 100%)' }} />
            <span style={{
              position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 46, height: 46, borderRadius: '50%', background: ORANGE,
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 14px rgba(255,87,34,.45)',
            }}>
              <span style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '13px solid #fff', marginLeft: 3 }} />
            </span>
          </>
        )}
      </div>

      {/* Texto AL COSTADO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, padding: '4px 2px' }}>
        <span style={{ color: ORANGE, fontFamily: SANS, fontWeight: 800, fontSize: 11, letterSpacing: '.12em' }}>★★★★★</span>
        <strong style={{ display: 'block', fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: NAVY, margin: '4px 0 0', lineHeight: 1.15 }}>
          {video.name}{video.age ? `, ${video.age}` : ''}
        </strong>
        <p style={{ margin: '7px 0 0', fontFamily: SANS, fontSize: 13.5, lineHeight: 1.45, color: NAVY_SOFT }}>
          {video.review}
        </p>
        {!active && (
          <span style={{ marginTop: 10, color: ORANGE, fontFamily: SANS, fontSize: 12.5, fontWeight: 700 }}>▶ Ver testimonio</span>
        )}
      </div>
    </article>
  );
}

export function TestimonialVideoCarousel() {
  const rootRef = useRef<HTMLElement>(null);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const reel = Array.from({ length: REPEATS }, () => TESTIMONIAL_VIDEOS).flat();
  const loop = [...reel, ...reel]; // duplicado → loop sin costura (translateX -50%)

  // Click FUERA de la tarjeta activa → vuelve a poster y reanuda la corrida.
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
        padding: '44px 0 46px', overflow: 'hidden', fontFamily: SANS,
        borderTop: '1px solid rgba(48,56,65,.06)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 26, padding: '0 22px' }}>
        <p style={{ color: ORANGE, fontFamily: SANS, fontWeight: 800, letterSpacing: '.16em', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>
          Historias reales · en video
        </p>
        <h2 style={{ color: NAVY, fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, margin: '8px auto 0', maxWidth: 320, lineHeight: 1.12 }}>
          Lo que dicen las que ya lo hicieron
        </h2>
      </div>

      <div
        className="vsl-marquee"
        style={{ maskImage: 'linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)' }}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onTouchStart={() => setHoverPaused(true)}
      >
        <div
          className="vsl-marquee-track"
          style={{ display: 'flex', gap: 16, width: 'max-content', padding: '6px 16px 8px', animationPlayState: paused ? 'paused' : 'running' }}
        >
          {loop.map((v, i) => {
            const slotKey = `${v.id}-${i}`;
            return (
              <Card key={slotKey} video={v} slotKey={slotKey}
                active={activeKey === slotKey}
                onSelect={(k) => setActiveKey((cur) => (cur === k ? null : k))} />
            );
          })}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: NAVY_SOFT, fontFamily: SANS, fontSize: 12.5, margin: '18px 22px 0' }}>
        Tocá un video para reproducirlo con audio
      </p>

      <style>{`
        .vsl-marquee { width: 100%; }
        .vsl-marquee-track { animation: vsl-scroll 48s linear infinite; will-change: transform; }
        @keyframes vsl-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .vsl-marquee-track { animation: none; }
          .vsl-marquee { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
      `}</style>
    </section>
  );
}
