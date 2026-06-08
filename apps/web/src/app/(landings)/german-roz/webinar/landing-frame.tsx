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
      const data = e.data as
        | { type?: string; height?: number }
        | null
        | undefined;
      if (!data || typeof data !== 'object') return;

      if (
        data.type === 'iframe-height' &&
        typeof data.height === 'number' &&
        data.height > 0
      ) {
        setHeight((prev) =>
          Math.abs(prev - data.height!) > 1 ? data.height! : prev,
        );
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      style={{
        width: '100%',
        height: `${height}px`,
        border: 'none',
        display: 'block',
      }}
    />
  );
}
