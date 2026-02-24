import { Router } from 'express';
import { z } from 'zod';
import { env } from '@marketing-funnel/config';
import { verifyElevenLabsWebhook, parseWebhookEvent } from '@marketing-funnel/elevenlabs';
import { callLead, handleCallCompleted, handleCallFailed } from '../services/call.service';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Webhook: receives post-call events from ElevenLabs ─────────────────────

router.post(
  '/webhook',
  (req, res, next) => {
    if (env.ELEVENLABS_WEBHOOK_SECRET) {
      return verifyElevenLabsWebhook(env.ELEVENLABS_WEBHOOK_SECRET)(req, res, next);
    }
    next();
  },
  async (req, res) => {
    const event = parseWebhookEvent(req.body);

    if (!event) {
      res.status(400).json({ error: 'Unrecognized webhook event' });
      return;
    }

    try {
      switch (event.type) {
        case 'post_call_transcription':
          await handleCallCompleted(event.data.conversation_id);
          break;

        case 'call_initiation_failure':
          await handleCallFailed(
            event.data.conversation_id,
            event.data.error,
            event.data.agent_id,
          );
          break;

        case 'post_call_audio':
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error('[elevenlabs-webhook] Error handling event:', err);
      res.status(500).json({ error: 'Internal error processing webhook' });
    }
  },
);

// ─── Manual call trigger (internal use) ─────────────────────────────────────

const callSchema = z.object({
  leadId: z.string().uuid(),
  orgId: z.string().uuid(),
  pipelineEntryId: z.string().uuid().optional(),
  firstMessage: z.string().optional(),
  dynamicVariables: z.record(z.string(), z.string()).optional(),
  agentId: z.string().optional(),
});

router.post('/call', validate(callSchema), async (req, res) => {
  try {
    const { leadId, orgId, pipelineEntryId, firstMessage, dynamicVariables, agentId } = req.body;

    const result = await callLead(leadId, {
      orgId,
      pipelineEntryId,
      firstMessage,
      dynamicVariables,
      agentId,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[elevenlabs] Call failed:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
