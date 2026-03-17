import type { ActionHandler } from '../../types';
import { sendAfluenceLeadCreatedToClickupChannel } from '../../services/clickup-chat.service';

export const notifyClickupChannelAction: ActionHandler = async (_action, event) => {
  await sendAfluenceLeadCreatedToClickupChannel(event);
};
