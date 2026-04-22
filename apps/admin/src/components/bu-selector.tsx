'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { BuOption } from '@/lib/dashboard/bu-options';

interface BuSelectorProps {
  options: BuOption[];
  currentPath: string; // e.g. `/german-roz/di21`
}

export function BuSelector({ options, currentPath }: BuSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (options.length <= 1) {
    return null; // no point in showing a selector with one option
  }

  return (
    <select
      value={currentPath}
      disabled={isPending}
      onChange={(e) => {
        const nextPath = e.target.value;
        if (nextPath && nextPath !== currentPath) {
          startTransition(() => router.push(nextPath));
        }
      }}
      title="Cambiar de business unit"
      style={{
        appearance: 'none',
        background: 'transparent',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        padding: '6px 28px 6px 12px',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        cursor: isPending ? 'wait' : 'pointer',
        opacity: isPending ? 0.6 : 1,
        backgroundImage:
          'linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)',
        backgroundPosition:
          'calc(100% - 14px) 50%, calc(100% - 9px) 50%',
        backgroundSize: '5px 5px, 5px 5px',
        backgroundRepeat: 'no-repeat',
        minWidth: 200,
      }}
    >
      {options.map((opt) => (
        <option key={opt.path} value={opt.path} style={{ background: 'var(--color-surface)' }}>
          {opt.organizer_name} · {opt.bu_name}
        </option>
      ))}
    </select>
  );
}
