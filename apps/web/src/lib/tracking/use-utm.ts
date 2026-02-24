'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const UTM_KEYS: (keyof UtmParams)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

/**
 * Reads UTM parameters from the current URL query string.
 * Returns only the params that are present (no undefined keys).
 */
export function useUtm(): UtmParams {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const params: UtmParams = {};
    for (const key of UTM_KEYS) {
      const value = searchParams.get(key);
      if (value) params[key] = value;
    }
    return params;
  }, [searchParams]);
}
