'use client';

import { useEffect } from 'react';
import { trackLucasRetoViewContent } from '@/lib/tracking/lucas-meta';

export function RetoTracker() {
  useEffect(() => {
    trackLucasRetoViewContent();
  }, []);

  return null;
}
