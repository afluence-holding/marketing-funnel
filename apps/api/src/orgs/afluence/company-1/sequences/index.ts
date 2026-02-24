import type { SequenceDef } from '../../../../core/types';
import { welcomeSequence } from './welcome';

export const sequences: Record<string, SequenceDef> = {
  [welcomeSequence.key]: welcomeSequence,
};
