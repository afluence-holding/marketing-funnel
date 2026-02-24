import type { SequenceDef } from '../../../../core/types';
import { IDS } from '../config';

export const welcomeSequence: SequenceDef = {
  key: 'company1-welcome',
  name: 'Welcome Sequence (Company-1)',
  steps: [
    // 1. WhatsApp template message (pre-approved by Meta, supports buttons)
    {
      type: 'send_whatsapp',
      messageType: 'template',
      templateName: 'welcome_faktory_v1',
      language: 'es',
      bodyParams: ['{{lead_name}}'],
    },

    // 2. Wait 2 days
    { type: 'wait', hours: 48 },

    // 3. Follow-up email with CTA
    {
      type: 'send_email',
      templateId: 'company1-followup',
      subject: '{{lead_name}}, no te pierdas esto',
      data: { ctaUrl: 'https://faktory.ai/demo' },
    },

    // 4. Wait 1 day
    { type: 'wait', hours: 24 },

    // 5. WhatsApp text with personal touch
    {
      type: 'send_whatsapp',
      messageType: 'text',
      body: 'Hola {{lead_name}}! Te enviamos un email ayer con info sobre AI Faktory. Tienes alguna duda? Estamos para ayudarte 🙌',
    },

    // 6. Wait 2 days
    { type: 'wait', hours: 48 },

    // 7. AI call via ElevenLabs
    {
      type: 'ai_call',
      agentId: process.env.COMPANY1_ELEVENLABS_AGENT_ID ?? '',
      firstMessage: 'Hola {{lead_name}}, te llamo de AI Faktory para contarte como podemos ayudarte.',
    },
  ],
};
