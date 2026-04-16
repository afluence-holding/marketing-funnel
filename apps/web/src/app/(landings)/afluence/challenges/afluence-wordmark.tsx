'use client';

import Image from 'next/image';
import logoTransparent from './afluence-logo-transparent.png';

export function AfluenceWordmark({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const isFooter = variant === 'footer';

  return (
    <Image
      src={logoTransparent}
      alt="Afluence Building your empire"
      height={isFooter ? 32 : 36}
      className="w-auto select-none"
      priority={!isFooter}
    />
  );
}
