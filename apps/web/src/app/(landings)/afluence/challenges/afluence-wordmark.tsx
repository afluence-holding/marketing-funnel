'use client';

import Image from 'next/image';
import logoTransparent from './afluence-logo-transparent.png';

export function AfluenceWordmark({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const isFooter = variant === 'footer';

  return (
    <Image
      src={logoTransparent}
      alt="Afluence Building your empire"
      width={256}
      height={83}
      className={isFooter ? 'h-8 w-auto select-none' : 'h-9 w-auto select-none'}
      priority={!isFooter}
    />
  );
}
