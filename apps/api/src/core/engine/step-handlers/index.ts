import type { StepHandlerMap } from '../../types';
import { sendWhatsAppHandler } from './send-whatsapp';
import { sendEmailHandler } from './send-email';
import { aiCallHandler } from './ai-call';
import { waitHandler } from './wait';
import { manualTaskHandler } from './manual-task';

export const stepHandlerMap: StepHandlerMap = {
  send_whatsapp: sendWhatsAppHandler,
  send_email: sendEmailHandler,
  ai_call: aiCallHandler,
  wait: waitHandler,
  manual_task: manualTaskHandler,
};
