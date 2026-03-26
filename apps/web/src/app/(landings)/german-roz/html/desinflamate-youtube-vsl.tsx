'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const VIDEO_ID = '6hzpcpZQd6A';

type YtPlayer = {
  playVideo: () => void;
  setPlaybackRate: (rate: number) => void;
  unMute: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, config: Record<string, unknown>) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function ensureYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try {
          prev?.();
        } finally {
          resolve();
        }
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
    });
  }

  return apiPromise;
}

/**
 * VSL embebido: autoplay en silencio (política del navegador), 1.25×, botón para activar audio.
 */
export function DesinflamateYoutubeVsl() {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const [showAudioCta, setShowAudioCta] = useState(true);

  const activateAudio = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.unMute();
    } catch {
      /* */
    }
    try {
      p.setPlaybackRate(1.25);
    } catch {
      /* */
    }
    try {
      p.playVideo();
    } catch {
      /* */
    }
    setShowAudioCta(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void ensureYouTubeIframeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return;

      const player = new window.YT.Player(hostRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          controls: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: { target: YtPlayer }) => {
            const p = e.target;
            try {
              p.setPlaybackRate(1.25);
            } catch {
              /* not every embed supports rate */
            }
            try {
              p.playVideo();
            } catch {
              /* */
            }
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* */
      }
      playerRef.current = null;
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1024,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '1.5rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        aspectRatio: '16 / 9',
        position: 'relative',
      }}
    >
      <div ref={hostRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {showAudioCta ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)',
          }}
        >
          <button
            type="button"
            onClick={activateAudio}
            style={{
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.85)',
              borderRadius: '999px',
              padding: '1rem 1.75rem',
              fontSize: 'clamp(0.95rem, 2.8vw, 1.1rem)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#0a0a0a',
              background: 'linear-gradient(180deg, #fff 0%, #f0ebe3 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            aria-label="Activar audio del video"
          >
            Activar audio
          </button>
        </div>
      ) : null}
    </div>
  );
}
