import { Router, type Request, type Response } from 'express';
import {
  handleHotmartWebhookEvent,
  HotmartWebhookError,
} from '../services/hotmart-webhook.service';

const router = Router();

/**
 * Hotmart Postback v2.0.0 receiver (spike Fase 0 — captura cruda).
 * Configurar en el panel: Herramientas → Webhook → URL:
 *   https://<api>/api/webhooks/hotmart   (versión 2.0.0, eventos de compra)
 */
router.post('/webhooks/hotmart', async (req: Request, res: Response) => {
  try {
    const result = await handleHotmartWebhookEvent(req.body, req.headers);
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof HotmartWebhookError) {
      console.warn('[hotmart-webhook] rejected', { status: error.statusCode, message: error.message });
      res.status(error.statusCode).json({ ok: false, error: error.message });
      return;
    }
    console.error('[hotmart-webhook] unexpected error', error);
    res.status(500).json({ ok: false, error: 'internal error' });
  }
});

export default router;
