import type { ActionHandler } from '../../types';

export const notifyAction: ActionHandler = async (action, event) => {
  // Placeholder: integrate Slack, Discord, internal notifications, etc.
  const channel = (action.channel as string) ?? 'console';
  const message = (action.message as string) ?? `Event ${event.type} for lead ${event.leadId}`;

  console.log(`[action:notify] [${channel}] ${message}`);
};
