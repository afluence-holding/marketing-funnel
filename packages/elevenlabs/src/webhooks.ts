import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { ElevenLabsWebhookEvent } from './types';

/**
 * Express middleware that verifies the HMAC signature from ElevenLabs webhooks.
 * Attach this to your webhook route BEFORE the JSON body parser
 * or use express.raw() for that specific route.
 */
export function verifyElevenLabsWebhook(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['elevenlabs-signature'] as string | undefined;

    if (!signature) {
      res.status(401).json({ error: 'Missing ElevenLabs-Signature header' });
      return;
    }

    if (!secret) {
      console.warn('[elevenlabs-webhook] No webhook secret configured, skipping verification');
      next();
      return;
    }

    try {
      const rawBody = typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body);

      const expected = createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const signatureBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expected, 'hex');

      if (signatureBuffer.length !== expectedBuffer.length ||
          !timingSafeEqual(signatureBuffer, expectedBuffer)) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }

      next();
    } catch (err) {
      console.error('[elevenlabs-webhook] Signature verification error:', err);
      res.status(401).json({ error: 'Signature verification failed' });
    }
  };
}

/**
 * Parse a raw webhook payload into a typed event.
 */
export function parseWebhookEvent(payload: any): ElevenLabsWebhookEvent | null {
  if (!payload || typeof payload !== 'object') return null;

  const type = payload.type ?? payload.event_type;
  const data = payload.data ?? payload;

  if (type === 'post_call_transcription') {
    return { type: 'post_call_transcription', data } as ElevenLabsWebhookEvent;
  }

  if (type === 'post_call_audio') {
    return { type: 'post_call_audio', data } as ElevenLabsWebhookEvent;
  }

  if (type === 'call_initiation_failure') {
    return { type: 'call_initiation_failure', data } as ElevenLabsWebhookEvent;
  }

  // If no explicit type field, try to infer from data shape
  if (data?.transcript && data?.conversation_id) {
    return { type: 'post_call_transcription', data } as ElevenLabsWebhookEvent;
  }

  if (data?.audio_base64) {
    return { type: 'post_call_audio', data } as ElevenLabsWebhookEvent;
  }

  if (data?.error) {
    return { type: 'call_initiation_failure', data } as ElevenLabsWebhookEvent;
  }

  return null;
}
