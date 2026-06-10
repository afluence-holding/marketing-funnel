'use client';

/**
 * SPIKE — Franja-carrusel de video-testimonios (YouTube), v2.
 *
 * Cada SLOT = video vertical (9:16) + bloque de texto ALINEADO debajo
 * (nombre y apellido · edad · reseña corta). Todo junto conforma el slot.
 *
 * Comportamiento de video:
 *  - Todos arrancan en AUTOPLAY MUTEADO (loop) → "muro de videos" vivo.
 *  - Al SELECCIONAR un slot: la cinta se detiene, ese video reinicia (seek 0) y
 *    se DESMUTEA (audio on).
 *  - Al hacer click FUERA del slot: ese video se PAUSA y se MUTEA, y la cinta
 *    vuelve a moverse.
 *
 * El control del player se hace por postMessage a la IFrame API de YouTube
 * (`enablejsapi=1`). Estilos INLINE a propósito: el componente se inyecta vía
 * portal DENTRO del iframe `srcDoc` del VSL, que no tiene el Tailwind del parent.
 *
 * ⚠️ Los videos deben PERMITIR INSERCIÓN (público/no-listado + embedding ON).
 */

import { useEffect, useRef, useState } from 'react';

type TestimonialVideo = {
  id: string; // YouTube id (debe permitir inserción)
  name: string; // nombre y apellido
  age: number | null; // edad
  review: string; // reseña corta
};

// TODO(germán): completar edad y reseña reales; sumar 2–3 testimonios más.
const TESTIMONIAL_VIDEOS: TestimonialVideo[] = [
  // Real — https://youtube.com/shorts/MXugMSBXo4Y (⚠️ activar "Permitir inserción").
  { id: 'MXugMSBXo4Y', name: 'Giulia Chiappe', age: null, review: 'Su experiencia con Desinflámate.' },
  // PLACEHOLDERS embebibles (solo para validar diseño/comportamiento) — reemplazar:
  { id: 'aqz-KE-bpKQ', name: 'Testimonio demo', age: 38, review: 'Reseña de ejemplo — reemplazar por testimonio real.' },
  { id: 'ScMzIvxBSi4', name: 'Testimonio demo', age: 45, review: 'Reseña de ejemplo — reemplazar por testimonio real.' },
];

const REPEATS = 2; // repeticiones de la lista en la cinta (ilusión de "muchos").
const ORANGE = '#FF5722';

function ytEmbedSrc(id: string): string {
  const p = new URLSearchParams({
    enablejsapi: '1',
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    controls: '0',
    modestbranding: '1',
    playsinline: '1',
    rel: '0',
    disablekb: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${p.toString()}`;
}

function postCmd(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
}

function Slot({
  video,
  slotKey,
  active,
  onSelect,
}: {
  video: TestimonialVideo;
  slotKey: string;
  active: boolean;
  onSelect: (k: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const f = iframeRef.current;
    if (active) {
      postCmd(f, 'seekTo', [0, true]);
      postCmd(f, 'unMute');
      postCmd(f, 'setVolume', [100]);
      postCmd(f, 'playVideo');
    } else {
      postCmd(f, 'pauseVideo');
      postCmd(f, 'mute');
    }
  }, [active]);

  return (
    <div
      data-slot-key={slotKey}
      onClick={() => onSelect(slotKey)}
      style={{ flex: '0 0 auto', width: 210, cursor: 'pointer' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '9 / 16',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#000',
          boxShadow: active
            ? `0 0 0 3px ${ORANGE}, 0 10px 28px rgba(0,0,0,.5)`
            : '0 8px 24px rgba(0,0,0,.45)',
          transition: 'box-shadow .2s',
        }}
      >
        <iframe
          ref={iframeRef}
          src={ytEmbedSrc(video.id)}
          title={`Testimonio de ${video.name}`}
          allow="autoplay; encrypted-media"
          // pointerEvents none → el click lo recibe el slot (no el player), así
          // controlamos play/mute nosotros y detectamos click-afuera.
          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
        />
        {/* Indicador de estado: muteado (tap para oír) vs reproduciendo. */}
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: active ? ORANGE : 'rgba(0,0,0,.6)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 9px',
            borderRadius: 999,
          }}
        >
          {active ? '🔊 Con audio' : '🔇 Tocar'}
        </span>
      </div>

      {/* Bloque de texto ALINEADO con el video (mismo ancho). */}
      <div style={{ padding: '10px 2px 0', textAlign: 'left', color: '#fff' }}>
        <strong style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>
          {video.name}
          {video.age ? `, ${video.age}` : ''}
        </strong>
        <p style={{ margin: '3px 0 0', fontSize: 13, lineHeight: 1.35, color: 'rgba(255,255,255,.82)' }}>
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

  // Click FUERA del slot activo → pausa + mutea (y reanuda la cinta).
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
        background: 'linear-gradient(180deg,#0f0f12 0%,#17171c 100%)',
        padding: '40px 0 48px',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28, padding: '0 20px' }}>
        <p style={{ color: ORANGE, fontWeight: 800, letterSpacing: '0.18em', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>
          Historias reales
        </p>
        <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '6px 0 0' }}>
          Lo que dicen las que ya lo hicieron
        </h2>
      </div>

      <div
        className="vsl-marquee"
        style={{ maskImage: 'linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)' }}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onTouchStart={() => setHoverPaused(true)}
      >
        <div
          className="vsl-marquee-track"
          style={{ display: 'flex', gap: 16, width: 'max-content', animationPlayState: paused ? 'paused' : 'running' }}
        >
          {loop.map((v, i) => {
            const slotKey = `${v.id}-${i}`;
            return (
              <Slot
                key={slotKey}
                video={v}
                slotKey={slotKey}
                active={activeKey === slotKey}
                onSelect={(k) => setActiveKey((cur) => (cur === k ? null : k))}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        .vsl-marquee { width: 100%; }
        .vsl-marquee-track { animation: vsl-scroll 46s linear infinite; }
        @keyframes vsl-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .vsl-marquee-track { animation: none; }
          .vsl-marquee { overflow-x: auto; }
        }
      `}</style>
    </section>
  );
}
