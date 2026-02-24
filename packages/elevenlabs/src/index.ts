// Client
export { getElevenLabsClient } from './client';

// Calls (core sequence step)
export { makeCall, makeBatchCalls } from './calls';

// Conversations
export { getConversation, listConversations, getConversationAudio, deleteConversation } from './conversations';

// Agent management
export { createAgent, getAgent, updateAgent, deleteAgent, listAgents } from './agents';

// Phone numbers
export { listPhoneNumbers, getPhoneNumber, updatePhoneNumber, deletePhoneNumber } from './phone-numbers';

// Webhooks
export { verifyElevenLabsWebhook, parseWebhookEvent } from './webhooks';

// Types
export type {
  CallOptions,
  CallResult,
  BatchCallRecipient,
  BatchCallOptions,
  BatchCallResult,
  TranscriptMessage,
  ConversationDetails,
  ListConversationsFilters,
  CreateAgentOptions,
  UpdateAgentOptions,
  CallOutcome,
  ElevenLabsWebhookEvent,
  WebhookTranscriptionEvent,
  WebhookAudioEvent,
  WebhookFailureEvent,
} from './types';
