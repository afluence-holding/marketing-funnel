export const afluenceOrganizationId =
  process.env.AFLUENCE_ORG_ID ?? process.env.PROJECT2_ORG_ID ?? process.env.PROJECT1_ORG_ID ?? '';

export interface AfluenceClickupChatConfig {
  enabled: boolean;
  apiToken: string;
  workspaceId: string;
  channelId: string;
}

export const afluenceClickupChatConfig: AfluenceClickupChatConfig = {
  enabled: (process.env.AFLUENCE_CLICKUP_CHAT_ENABLED ?? 'false') === 'true',
  apiToken: process.env.AFLUENCE_CLICKUP_CHAT_API_TOKEN ?? process.env.PROJECT2_CLICKUP_API_TOKEN ?? '',
  workspaceId: process.env.AFLUENCE_CLICKUP_CHAT_WORKSPACE_ID ?? '',
  channelId: process.env.AFLUENCE_CLICKUP_CHAT_CHANNEL_ID ?? '',
};
