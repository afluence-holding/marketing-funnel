'use client';

/**
 * Franja-carrusel de video-testimonios — v3 TOPE DE LÍNEA (premium + performante).
 *
 * Cambio clave vs v2 (performance): NO se montan N iframes de YouTube en autoplay
 * (mataba el móvil). Cada slot muestra un POSTER liviano (thumbnail) con play; el
 * iframe de YouTube se monta SOLO al seleccionar un slot, y hay MÁXIMO 1 video vivo
 * a la vez. Click afuera → vuelve al poster (desmonta el iframe). Marquesina en loop
 * (ilusión de "muchos") que se pausa al hover/touch y mientras hay un video activo.
 *
 * Estilos INLINE + <style> propio a propósito: se inyecta vía portal DENTRO del
 * iframe srcDoc del VSL (que no hereda el Tailwind del parent).
 * Branding DESINFLÁMATE: naranja #FF5722, navy #303841.
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

const REPEATS = 3; // repeticiones en la cinta (ilusión de "muchos" con pocos clips).
const ORANGE = '#FF5722';

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
      style={{ flex: '0 0 auto', width: 212, cursor: 'pointer' }}
    >
      <div
        style={{
          position: 'relative', width: '100%', aspectRatio: '9 / 16',
          borderRadius: 18, overflow: 'hidden', background: '#0b0b0d',
          boxShadow: active
            ? `0 0 0 3px ${ORANGE}, 0 18px 40px -12px rgba(0,0,0,.7)`
            : '0 10px 30px -10px rgba(0,0,0,.55)',
          transition: 'box-shadow .25s, transform .25s', transform: active ? 'translateY(-2px)' : 'none',
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
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.06) 45%,rgba(0,0,0,.72) 100%)' }} />
            <span
              style={{
                position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 56, height: 56, borderRadius: '50%', background: ORANGE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(255,87,34,.55)',
              }}
            >
              <span style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '16px solid #fff', marginLeft: 4 }} />
            </span>
            <span
              style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 999 }}
            >
              ▶ Testimonio
            </span>
          </>
        )}
      </div>

      <div style={{ padding: '12px 2px 0', textAlign: 'left', color: '#fff' }}>
        <strong style={{ display: 'block', fontSize: 15.5, fontWeight: 800, letterSpacing: '-.01em' }}>
          {video.name}{video.age ? `, ${video.age}` : ''}
        </strong>
        <p style={{ margin: '3px 0 0', fontSize: 13, lineHeight: 1.4, color: 'rgba(255,255,255,.78)' }}>
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

  // Click FUERA del slot activo → desmonta el video (vuelve a poster) y reanuda.
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
        background: 'radial-gradient(120% 100% at 50% 0%, #1a1a20 0%, #0f0f12 70%)',
        padding: '46px 0 52px', overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 30, padding: '0 22px' }}>
        <p style={{ color: ORANGE, fontWeight: 800, letterSpacing: '.2em', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>
          Historias reales · en video
        </p>
        <h2 style={{ color: '#fff', fontSize: 27, fontWeight: 800, margin: '8px 0 0', letterSpacing: '-.02em' }}>
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
          style={{ display: 'flex', gap: 18, width: 'max-content', padding: '0 18px', animationPlayState: paused ? 'paused' : 'running' }}
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

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: 12.5, margin: '22px 22px 0' }}>
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
