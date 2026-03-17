'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Lock, CalendarCheck, DollarSign, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CalendarState, CalendarPrefill } from './lead-form';
import { META_EVENTS, trackCustomEvent, trackEvent } from '@/lib/tracking/events';
import { buildMetaTrackingPayload, createMetaEventId } from '@/lib/tracking/meta-capi';

const CALENDLY_SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

function debugLog(message: string, data?: Record<string, unknown>) {
  // debug flag is passed from server-side env to avoid client-side env drift.
  if (!globalThis.__BOOKING_DEBUG__) return;
  if (data) {
    console.info(`[booking-debug] ${message}`, data);
    return;
  }
  console.info(`[booking-debug] ${message}`);
}

declare global {
  var __BOOKING_DEBUG__: boolean | undefined;
}

interface CalendarBookingProps {
  calendarState: CalendarState;
  prefill?: CalendarPrefill | null;
  calendlyUrl: string;
  debugBooking: boolean;
}

export function CalendarBooking({
  calendarState,
  prefill,
  calendlyUrl,
  debugBooking,
}: CalendarBookingProps) {
  globalThis.__BOOKING_DEBUG__ = debugBooking;
  const [showUnlockedBadge, setShowUnlockedBadge] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initStatus, setInitStatus] = useState<'idle' | 'done' | 'skipped'>('idle');
  const [meetingScheduled, setMeetingScheduled] = useState(false);
  const calendlyHostRef = useRef<HTMLDivElement | null>(null);
  const hasSyncedMeetingRef = useRef(false);

  const isLocked = calendarState === 'locked';
  const isRejected =
    calendarState === 'rejected' || calendarState === 'rejected-whatsapp';
  const isUnlocked = calendarState === 'unlocked';

  useEffect(() => {
    if (!isUnlocked) {
      setMeetingScheduled(false);
      hasSyncedMeetingRef.current = false;
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      setShowUnlockedBadge(true);
      const timer = setTimeout(() => setShowUnlockedBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked || !calendlyUrl) return;
    const existing = document.querySelector(`script[src="${CALENDLY_SCRIPT}"]`) as HTMLScriptElement | null;
    if (existing) {
      setScriptLoaded(Boolean(window.Calendly));
      debugLog('calendar:script_already_present', { loaded: Boolean(window.Calendly) });
      return;
    }
    const script = document.createElement('script');
    script.src = CALENDLY_SCRIPT;
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      debugLog('calendar:script_loaded');
    };
    script.onerror = () => debugLog('calendar:script_error');
    document.body.appendChild(script);
    debugLog('calendar:script_injected');
  }, [isUnlocked, calendlyUrl]);

  const calendlyUrlWithPrefill = useMemo(() => {
    if (!calendlyUrl) return '';
    const queryParts: string[] = [];
    if (prefill?.name) {
      queryParts.push(`name=${encodeURIComponent(prefill.name)}`);
    }
    if (prefill?.email) {
      queryParts.push(`email=${encodeURIComponent(prefill.email)}`);
    }
    if (!queryParts.length) return calendlyUrl;
    const separator = calendlyUrl.includes('?') ? '&' : '?';
    return `${calendlyUrl}${separator}${queryParts.join('&')}`;
  }, [calendlyUrl, prefill?.name, prefill?.email]);

  useEffect(() => {
    debugLog('calendar:state', {
      isUnlocked,
      meetingScheduled,
      hasCalendlyUrl: Boolean(calendlyUrl),
      hasPrefillName: Boolean(prefill?.name),
      hasPrefillEmail: Boolean(prefill?.email),
    });
  }, [isUnlocked, meetingScheduled, calendlyUrl, prefill?.name, prefill?.email]);

  useEffect(() => {
    if (!isUnlocked) return;

    const syncMeetingScheduled = async (calendlyEventUri?: string, eventId?: string) => {
      if (hasSyncedMeetingRef.current) return true;

      const meetingUpdate = prefill?.meetingUpdate;
      if (!meetingUpdate?.leadId) {
        debugLog('calendar:meeting_sync_skipped', { reason: 'missing_sync_payload' });
        return false;
      }
      const body = {
        ...(meetingUpdate.entryId ? { entryId: meetingUpdate.entryId } : {}),
        scheduledAt: new Date().toISOString(),
        ...(calendlyEventUri ? { calendlyEventUri } : {}),
        ...(eventId
          ? {
              tracking: {
                meta: buildMetaTrackingPayload(eventId),
              },
            }
          : {}),
      };

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const response = await fetch(
            `${API_URL}/api/orgs/afluence/bus/ai-factory-creators/leads/${meetingUpdate.leadId}/meeting-scheduled`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            },
          );
          debugLog('calendar:meeting_sync_response', {
            attempt,
            status: response.status,
            ok: response.ok,
          });
          if (response.ok) {
            hasSyncedMeetingRef.current = true;
            return true;
          }
        } catch (error) {
          debugLog('calendar:meeting_sync_error', {
            attempt,
            message: error instanceof Error ? error.message : 'unknown',
          });
        }
      }

      return false;
    };

    const handleCalendlyMessage = (event: MessageEvent) => {
      if (!event.origin.includes('calendly.com')) return;
      const rawData = (() => {
        if (typeof event.data === 'string') {
          try {
            return JSON.parse(event.data);
          } catch {
            return undefined;
          }
        }
        return event.data;
      })();
      const payload = rawData as
        | { event?: string; payload?: { event?: { uri?: string } } }
        | undefined;
      if (!payload?.event?.startsWith('calendly.')) return;
      debugLog('calendar:message_received', { event: payload.event });
      if (payload.event !== 'calendly.event_scheduled') return;

      setMeetingScheduled(true);
      const eventUri = payload?.payload?.event?.uri;
      const scheduleEventId = createMetaEventId('schedule');
      debugLog('calendar:event_scheduled', { hasEventUri: Boolean(eventUri) });
      trackEvent(META_EVENTS.Schedule, {
        content_name: 'ai-factory-creators-v1',
        calendly_event_uri: eventUri ?? '',
      }, { eventId: scheduleEventId });
      trackCustomEvent('CalendlyEventScheduled', {
        landing: 'ai-factory-creators-v1',
        calendly_event_uri: eventUri ?? '',
      }, { eventId: scheduleEventId });
      void syncMeetingScheduled(eventUri, scheduleEventId);
    };

    window.addEventListener('message', handleCalendlyMessage);
    return () => window.removeEventListener('message', handleCalendlyMessage);
  }, [isUnlocked, prefill?.meetingUpdate]);

  useEffect(() => {
    if (!isUnlocked || meetingScheduled || !calendlyUrlWithPrefill || !scriptLoaded) return;
    if (!window.Calendly || !calendlyHostRef.current) {
      setInitStatus('skipped');
      debugLog('calendar:init_skipped', {
        hasCalendlyObject: Boolean(window.Calendly),
        hasHost: Boolean(calendlyHostRef.current),
      });
      return;
    }
    calendlyHostRef.current.innerHTML = '';
    window.Calendly.initInlineWidget({
      url: calendlyUrlWithPrefill,
      parentElement: calendlyHostRef.current,
    });
    setInitStatus('done');
    debugLog('calendar:init_done', { url: calendlyUrlWithPrefill });
  }, [isUnlocked, meetingScheduled, calendlyUrlWithPrefill, scriptLoaded]);

  return (
    <div className="relative rounded-2xl border border-brand-border bg-brand-surface/60 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.3)] overflow-hidden h-full flex flex-col min-h-[580px]">
      {(isLocked || isRejected) && (
        <div className="flex-1 p-5 md:p-6 flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent/50 to-[#a78bfa]/50 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-brand-muted" />
            </div>
            <div>
              <p className="text-[0.875rem] text-brand-text/70" style={{ fontWeight: 600 }}>
                Sesion estrategica
              </p>
              <p className="text-[0.6875rem] text-brand-muted">45 min</p>
            </div>
          </div>
          <div className="flex-1 rounded-xl border border-brand-border/50 bg-brand-surface-elevated/30 min-h-[400px]" />
        </div>
      )}

      {isUnlocked && meetingScheduled && (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-success/10 border border-brand-success/20 flex items-center justify-center mb-4">
            <CalendarCheck className="w-7 h-7 text-brand-success" />
          </div>
          <p className="text-[0.95rem] text-brand-text mb-2" style={{ fontWeight: 700 }}>
            Reunion agendada correctamente
          </p>
          <p className="text-[0.8125rem] text-brand-muted max-w-[300px]" style={{ lineHeight: 1.6 }}>
            Recibiras la confirmacion por email. Nuestro equipo revisara tu informacion y te
            contactara antes de la sesion.
          </p>
        </div>
      )}

      {isUnlocked && !meetingScheduled && calendlyUrl && (
        <div className="flex-1 p-5 md:p-6 transition-all duration-500">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-[#a78bfa] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[0.875rem] text-brand-text" style={{ fontWeight: 600 }}>
                Sesion estrategica
              </p>
              <p className="text-[0.6875rem] text-brand-muted">Selecciona fecha y hora</p>
            </div>
          </div>
          <div
            ref={calendlyHostRef}
            className="min-w-[320px] w-full rounded-xl overflow-hidden bg-white"
            style={{ height: 700 }}
          />
        </div>
      )}

      {isUnlocked && !calendlyUrl && (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-surface-elevated/80 border border-brand-border flex items-center justify-center mb-4">
            <CalendarCheck className="w-7 h-7 text-brand-muted" />
          </div>
          <p className="text-[0.875rem] text-brand-text mb-1" style={{ fontWeight: 600 }}>
            Calendario listo
          </p>
          <p className="text-[0.75rem] text-brand-muted max-w-[260px]">
            Configura <code className="text-brand-accent/80">NEXT_PUBLIC_CALENDLY_URL</code>{' '}
            con tu URL de Calendly para activar el agendamiento.
          </p>
        </div>
      )}

      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-surface-elevated/80 border border-brand-border flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <Lock className="w-6 h-6 text-brand-muted" />
            </div>
            <h4 className="text-[1rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>
              Completa el formulario para desbloquear
            </h4>
            <p
              className="text-[0.8125rem] text-brand-muted max-w-[260px]"
              style={{ lineHeight: 1.6 }}
            >
              Toma menos de 1 minuto.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {calendarState === 'rejected' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-brand-bg/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-[1rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>
              Nuestros desarrollos comienzan desde USD $7,000
            </h4>
            <p
              className="text-[0.8125rem] text-brand-muted max-w-[280px] mb-5"
              style={{ lineHeight: 1.6 }}
            >
              Actualmente no podemos desbloquear el calendario para este rango de inversion.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-[0.8125rem]"
              style={{ fontWeight: 600 }}
              onClick={() => window.open('https://byafluence.com', '_blank')}
            >
              Unirme a lista de espera
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {calendarState === 'rejected-whatsapp' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-brand-bg/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <MessageCircle className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-[1rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>
              Reservamos reuniones solo para proyectos confirmados
            </h4>
            <p
              className="text-[0.8125rem] text-brand-muted max-w-[280px] mb-5"
              style={{ lineHeight: 1.6 }}
            >
              La confirmacion por WhatsApp es necesaria para revisar tu proyecto antes de la
              sesion.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-[0.8125rem]"
              style={{ fontWeight: 600 }}
              onClick={() => window.open('https://byafluence.com', '_blank')}
            >
              Unirme a lista de espera
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnlockedBadge && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-success/15 border border-brand-success/25 backdrop-blur-xl shadow-[0_4px_30px_rgba(16,185,129,0.2)]">
              <CalendarCheck className="w-4 h-4 text-brand-success" />
              <span
                className="text-[0.75rem] text-brand-success whitespace-nowrap"
                style={{ fontWeight: 600 }}
              >
                Listo para agendar
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {debugBooking && (
        <div className="absolute bottom-2 right-2 z-30 rounded-md border border-brand-border bg-brand-bg/80 px-2 py-1 text-[11px] text-brand-muted">
          {`debug:on | url:${calendlyUrl ? 'yes' : 'no'} | unlocked:${isUnlocked ? 'yes' : 'no'} | scheduled:${meetingScheduled ? 'yes' : 'no'} | script:${scriptLoaded ? 'yes' : 'no'} | init:${initStatus}`}
        </div>
      )}
    </div>
  );
}
