'use client';

import { useId } from 'react';

export function AfluenceWordmark({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const rawId = useId().replace(/:/g, '');
  const gradId = `${rawId}-sail`;
  const isFooter = variant === 'footer';
  const iconPx = isFooter ? 28 : 32;

  return (
    <span className="inline-flex items-center gap-2 md:gap-2.5 select-none">
      <svg width={iconPx} height={iconPx} viewBox="0 0 32 32" className="shrink-0" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="10" y1="5" x2="10" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#c9a227" />
          </linearGradient>
        </defs>
        <path d="M6 26 L16 5 L26 26 Z" fill={`url(#${gradId})`} />
      </svg>
      <span className="flex flex-col items-start justify-center leading-tight">
        <span
          className={`tracking-tight text-brand-text ${isFooter ? 'text-[1rem]' : 'text-[1.0625rem] md:text-[1.25rem]'}`}
          style={{ fontWeight: 700 }}
        >
          Afluence
        </span>
        <span
          className={`text-brand-text-secondary ${isFooter ? 'text-[0.5625rem] mt-0.5' : 'text-[0.625rem] md:text-[0.6875rem] mt-0.5'}`}
          style={{ fontWeight: 500 }}
        >
          Building your empire
        </span>
      </span>
    </span>
  );
}
