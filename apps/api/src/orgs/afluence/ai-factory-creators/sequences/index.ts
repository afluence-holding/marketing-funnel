import type { SequenceDef } from '../../../../core/types';
import { agendarLlamarSequence } from './agendar-llamar';
import { llamadaAgendadaSequence } from './llamada-agendada';

export const sequences: Record<string, SequenceDef> = {
  [agendarLlamarSequence.key]: agendarLlamarSequence,
  [llamadaAgendadaSequence.key]: llamadaAgendadaSequence,
};
