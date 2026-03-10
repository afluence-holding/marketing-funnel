import type { SequenceDef } from '../../../../core/types';

export const agendarLlamarSequence: SequenceDef = {
  key: 'ai-factory-creators-agendar-llamar',
  name: 'Agendar llamada (AI Factory Creators)',
  steps: [
    {
      type: 'send_whatsapp',
      messageType: 'text',
      body: 'Hola {{lead_name}}! Gracias por tu interes. Te comparto el link para agendar una llamada: https://cal.com/afluence/ai-factory-creators',
    },
    { type: 'wait', hours: 24 },
    {
      type: 'send_whatsapp',
      messageType: 'text',
      body: 'Te ayudo con la agenda, {{lead_name}}? Si prefieres, respondeme por aqui y coordinamos juntos.',
    },
  ],
};
