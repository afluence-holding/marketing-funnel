'use client';

import { useEffect } from 'react';
import { trackCustomEventForPixel } from '@/lib/tracking/events';
import { buildMetaTrackingPayload, createMetaEventId } from '@/lib/tracking/meta-capi';
import { LUCAS } from '../lucas-config';
import {
  LUCAS_RETO_VSL_MILESTONES,
  lucasRetoVslMilestone,
  trackLucasRetoViewContent,
} from '@/lib/tracking/lucas-meta';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Reto sales landing tracker:
 * - ViewContent on mount
 * - VSL_25/50/75/100 from iframe postMessage (YouTube progress)
 * - InitiateCheckout en /reto/checkout (embed Whop)
 */
export function RetoTracker() {
  useEffect(() => {
    trackLucasRetoViewContent();

    const pixelId = LUCAS.metaPixelId;
    if (!pixelId) return;

    const resolvedPixelId = pixelId;
    const fired = new Set<number>();

    async function sendMilestoneToCapi(
      eventName: string,
      eventId: string,
      milestone: number,
    ) {
      try {
        await fetch(
          `${API_URL}/api/orgs/lucas-con-lucas/bus/main/video-events`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventName,
              source: LUCAS.reto.source,
              contentName: LUCAS.reto.contentName,
              milestone,
              tracking: {
                meta: buildMetaTrackingPayload(eventId),
              },
            }),
          },
        );
      } catch (error) {
        console.warn('[lucas-reto-tracker] VSL CAPI sync failed', {
          eventName,
          milestone,
          error: error instanceof Error ? error.message : 'unknown',
        });
      }
    }

    function onMessage(e: MessageEvent) {
      if (e.data?.type !== 'vsl-milestone') return;
      const milestone = e.data.milestone as number;
      if (
        !LUCAS_RETO_VSL_MILESTONES.includes(
          milestone as (typeof LUCAS_RETO_VSL_MILESTONES)[number],
        ) ||
        fired.has(milestone)
      ) {
        return;
      }
      fired.add(milestone);

      const eventName = `VSL_${milestone}`;
      const eventId = createMetaEventId(`lucas-reto-vsl-${milestone}`);
      trackCustomEventForPixel(
        resolvedPixelId,
        eventName,
        lucasRetoVslMilestone(milestone),
        { eventId },
      );
      void sendMilestoneToCapi(eventName, eventId, milestone);
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return null;
}
