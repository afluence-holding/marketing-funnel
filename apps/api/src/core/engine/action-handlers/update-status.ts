import { supabaseAdmin } from '@marketing-funnel/db';
import type { ActionHandler } from '../../types';

export const updateStatusAction: ActionHandler = async (action, event) => {
  const status = action.status as string;
  if (!status) {
    console.error('[action:update_status] Missing status in action config');
    return;
  }

  const { error } = await supabaseAdmin
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', event.leadId);

  if (error) throw error;
  console.log(`[action:update_status] Set lead ${event.leadId} status to "${status}"`);
};
