import { supabaseAdmin } from '@marketing-funnel/db';
import type { ActionHandler } from '../../types';

export const unenrollSequenceAction: ActionHandler = async (action, event) => {
  const sequenceKey = action.sequenceKey as string;
  if (!sequenceKey) {
    console.error('[action:unenroll_sequence] Missing sequenceKey in action config');
    return;
  }

  const { error } = await supabaseAdmin
    .from('sequence_enrollments')
    .update({
      status: 'unenrolled',
      next_step_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('sequence_key', sequenceKey)
    .eq('lead_id', event.leadId)
    .eq('status', 'active');

  if (error) throw error;
  console.log(`[action:unenroll_sequence] Unenrolled lead ${event.leadId} from "${sequenceKey}"`);
};
