/**
 * ============================================================================
 * EXAMPLE SEQUENCE — Reference for ALL step types
 * ============================================================================
 *
 * A sequence is an ordered list of steps executed over time.
 * The engine walks through them one by one:
 *   1. Execute the current step (send message, make call, etc.)
 *   2. If the next step is a "wait", schedule the step after it for later
 *   3. If the next step is a "manual_task", pause until a human resumes
 *   4. Otherwise, execute the next step immediately
 *
 * THIS FILE IS A REFERENCE CATALOG. Don't use it as-is.
 * Copy the steps you need into your own sequence file.
 *
 * KEY RULES:
 * - Every sequence needs a unique `key` (used in DB and workflow references)
 * - Steps run in order, top to bottom
 * - All text fields support {{lead_name}}, {{lead_email}}, {{lead_phone}}
 * - `wait` steps define the delay BEFORE the next step runs
 */

import type { SequenceDef } from '../../../../core/types';

export const exampleSequence: SequenceDef = {
  // Unique key — referenced by workflows and stored in sequence_enrollments.sequence_key
  // Convention: <bu-key>-<sequence-name>
  key: 'template-example',

  // Human-readable name (for logs)
  name: 'Example Sequence (Template BU)',

  steps: [

    // =========================================================================
    // WHATSAPP: TEXT
    // Plain text message. Simplest option.
    // =========================================================================
    {
      type: 'send_whatsapp',
      messageType: 'text',
      body: 'Hola {{lead_name}}, gracias por tu interes! Te cuento mas pronto.',
      // previewUrl: true,  // optional: renders link previews if body contains a URL
    },

    // =========================================================================
    // WAIT
    // Pauses the sequence. Next step runs after the delay.
    // =========================================================================
    { type: 'wait', hours: 48 },
    // Other examples:
    // { type: 'wait', hours: 1, minutes: 30 },  // 1.5 hours
    // { type: 'wait', minutes: 15 },             // 15 minutes

    // =========================================================================
    // EMAIL
    // Sends an email using a React Email template.
    // Template file: packages/email/src/templates/<templateId>.tsx
    // =========================================================================
    {
      type: 'send_email',
      templateId: 'template-welcome',  // file: packages/email/src/templates/template-welcome.tsx
      subject: '{{lead_name}}, bienvenido!',
      data: {                          // extra props passed to the React component
        ctaUrl: 'https://example.com/demo',
        offerCode: 'SAVE30',
      },
    },

    { type: 'wait', hours: 24 },

    // =========================================================================
    // WHATSAPP: TEMPLATE
    // Meta-approved template message. REQUIRED for first contact if >24h
    // since the user's last message (WhatsApp Business policy).
    // =========================================================================
    {
      type: 'send_whatsapp',
      messageType: 'template',
      templateName: 'followup_v1',              // name from Meta Business Manager
      language: 'es',                            // ISO language code
      bodyParams: ['{{lead_name}}', '30%'],      // fills {{1}}, {{2}} in the template body
      buttonParams: [                            // optional: button URL suffix or quick reply
        { index: 0, type: 'url', text: 'https://example.com/offer/123' },
      ],
    },

    { type: 'wait', hours: 48 },

    // =========================================================================
    // WHATSAPP: BUTTONS
    // Interactive reply buttons. Max 3 buttons.
    // =========================================================================
    {
      type: 'send_whatsapp',
      messageType: 'buttons',
      bodyText: '{{lead_name}}, te gustaria agendar una demo?',
      buttons: [
        { id: 'yes_demo', title: 'Si, agendar' },
        { id: 'more_info', title: 'Mas info' },
        { id: 'no_thanks', title: 'No gracias' },
      ],
      headerText: 'Demo disponible',  // optional
      footerText: 'Toca un boton',    // optional
    },

    { type: 'wait', hours: 24 },

    // =========================================================================
    // WHATSAPP: IMAGE
    // Sends an image with optional caption.
    // =========================================================================
    {
      type: 'send_whatsapp',
      messageType: 'image',
      imageUrl: 'https://cdn.example.com/promo-banner.jpg',
      caption: 'Mira lo que tenemos para ti, {{lead_name}}',  // optional
    },

    { type: 'wait', hours: 24 },

    // =========================================================================
    // WHATSAPP: VIDEO
    // Sends a video with optional caption.
    // =========================================================================
    {
      type: 'send_whatsapp',
      messageType: 'video',
      videoUrl: 'https://cdn.example.com/demo-video.mp4',
      caption: 'Un demo rapido de 2 minutos',  // optional
    },

    { type: 'wait', hours: 24 },

    // =========================================================================
    // WHATSAPP: DOCUMENT
    // Sends a PDF, spreadsheet, or any file.
    // =========================================================================
    {
      type: 'send_whatsapp',
      messageType: 'document',
      documentUrl: 'https://cdn.example.com/brochure.pdf',
      caption: 'Aqui tienes el brochure completo',  // optional
      filename: 'Brochure-2025.pdf',                 // optional: display name in chat
    },

    { type: 'wait', hours: 24 },

    // =========================================================================
    // WHATSAPP: LIST
    // Interactive list menu. Up to 10 items per section, multiple sections.
    // =========================================================================
    {
      type: 'send_whatsapp',
      messageType: 'list',
      bodyText: 'Elige el plan que mas te interesa:',
      buttonText: 'Ver planes',  // label on the button that opens the list
      sections: [
        {
          title: 'Planes mensuales',
          items: [
            { id: 'starter', title: 'Starter', description: '$29/mes — 1 usuario' },
            { id: 'pro', title: 'Pro', description: '$79/mes — 5 usuarios' },
            { id: 'enterprise', title: 'Enterprise', description: 'Personalizado' },
          ],
        },
        {
          title: 'Planes anuales',
          items: [
            { id: 'starter_annual', title: 'Starter Anual', description: '$290/ano — ahorra 2 meses' },
            { id: 'pro_annual', title: 'Pro Anual', description: '$790/ano — ahorra 2 meses' },
          ],
        },
      ],
      headerText: 'Nuestros planes',  // optional
      footerText: 'Selecciona uno',   // optional
    },

    { type: 'wait', hours: 48 },

    // =========================================================================
    // AI CALL
    // Initiates a phone call using ElevenLabs Conversational AI.
    // The agent speaks to the lead autonomously.
    // =========================================================================
    {
      type: 'ai_call',
      agentId: process.env.TEMPLATE_ELEVENLABS_AGENT_ID ?? '',
      firstMessage: 'Hola {{lead_name}}, te llamo para contarte mas sobre nuestro producto.',
      dynamicVariables: {  // optional: injected into the agent's context
        offer: 'descuento 30%',
        product: 'Plan Pro',
      },
    },

    { type: 'wait', hours: 24 },

    // =========================================================================
    // MANUAL TASK
    // Pauses the sequence until a human resumes it via API.
    // Use for: "review this lead", "approve this deal", "check CRM".
    // Resume endpoint: PATCH /api/enrollments/:id/resume
    // =========================================================================
    {
      type: 'manual_task',
      description: 'Review lead profile and decide if they should get a personalized offer',
      assignee: 'sales-team',  // optional: who should handle this
    },

    // After manual resume, the sequence continues from here:
    {
      type: 'send_whatsapp',
      messageType: 'text',
      body: '{{lead_name}}, tenemos una oferta especial para ti. Quieres saber mas?',
    },
  ],
};
