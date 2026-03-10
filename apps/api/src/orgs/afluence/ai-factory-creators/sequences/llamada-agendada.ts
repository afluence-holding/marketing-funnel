import type { SequenceDef } from '../../../../core/types';

export const llamadaAgendadaSequence: SequenceDef = {
  key: 'ai-factory-creators-llamada-agendada',
  name: 'Llamada agendada (AI Factory Creators)',
  steps: [
    {
      type: 'send_whatsapp',
      messageType: 'text',
      body: 'Perfecto {{lead_name}}! Confirmamos tu llamada agendada. Si necesitas reprogramar, avisame por este medio.',
    },
    { type: 'wait', hours: 2 },
    {
      type: 'manual_task',
      description: 'Revisar datos del lead antes de la llamada y preparar contexto comercial.',
    },
  ],
};
