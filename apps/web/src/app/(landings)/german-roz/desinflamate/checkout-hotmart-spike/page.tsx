import type { Metadata } from 'next';
import { HotmartSpikeEmbed } from './spike-embed';

/**
 * SPIKE Fase 0 — hotmart-embedded-checkout (THROWAWAY, eliminar tras el spike).
 *
 * Página de diagnóstico para resolver los [CONFIRM] del brief contra la
 * librería real de Hotmart: identificador de init, montaje del inline embed,
 * round-trip de atribución (sck portando el purchaseEventId) y comportamiento
 * iOS. NO está enlazada desde ningún lado, noindex, y NO toca el funnel Whop.
 *
 * Plan: funcionalidades-por-desarrollar/hotmart-embedded-checkout/USER-STORIES.md (FASE 0)
 */

export const metadata: Metadata = {
  title: 'SPIKE — Hotmart inline checkout',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function HotmartSpikePage() {
  return <HotmartSpikeEmbed />;
}
