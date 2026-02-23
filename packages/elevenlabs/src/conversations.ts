import { getElevenLabsClient } from './client';
import type { ConversationDetails, TranscriptMessage, ListConversationsFilters } from './types';

export async function getConversation(conversationId: string): Promise<ConversationDetails> {
  const client = getElevenLabsClient();
  const raw: any = await client.conversationalAi.conversations.get(conversationId);

  const transcript: TranscriptMessage[] = (raw.transcript ?? []).map((msg: any) => ({
    role: msg.role,
    message: msg.message,
    timeInCallSecs: msg.time_in_call_secs ?? msg.timeInCallSecs ?? 0,
  }));

  return {
    conversationId: raw.conversation_id ?? raw.conversationId ?? conversationId,
    agentId: raw.agent_id ?? raw.agentId ?? '',
    status: raw.status ?? 'done',
    transcript,
    metadata: {
      startTimeUnix: raw.metadata?.start_time_unix_secs ?? raw.metadata?.startTimeUnix ?? 0,
      callDurationSecs: raw.metadata?.call_duration_secs ?? raw.metadata?.callDurationSecs ?? 0,
    },
    hasAudio: raw.has_audio ?? raw.hasAudio ?? false,
    analysis: raw.analysis,
  };
}

export async function listConversations(filters?: ListConversationsFilters) {
  const client = getElevenLabsClient();
  return client.conversationalAi.conversations.list({
    agentId: filters?.agentId,
    pageSize: filters?.pageSize ?? 20,
    cursor: filters?.cursor,
    callSuccessful: filters?.callSuccessful as any,
  });
}

export async function getConversationAudio(conversationId: string) {
  const client = getElevenLabsClient();
  return client.conversationalAi.conversations.audio.get(conversationId);
}

export async function deleteConversation(conversationId: string) {
  const client = getElevenLabsClient();
  return client.conversationalAi.conversations.delete(conversationId);
}
