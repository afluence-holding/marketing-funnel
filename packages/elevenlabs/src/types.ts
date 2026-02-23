// ---------------------------------------------------------------------------
// Outbound calls
// ---------------------------------------------------------------------------

export interface CallOptions {
  agentId?: string;
  phoneNumberId?: string;
  toNumber: string;
  dynamicVariables?: Record<string, string>;
  conversationConfigOverride?: {
    firstMessage?: string;
    language?: string;
    prompt?: string;
    voiceId?: string;
  };
}

export interface CallResult {
  conversationId: string;
  callSid?: string;
}

// ---------------------------------------------------------------------------
// Batch calls
// ---------------------------------------------------------------------------

export interface BatchCallRecipient {
  id?: string;
  phoneNumber: string;
  dynamicVariables?: Record<string, string>;
}

export interface BatchCallOptions {
  callName: string;
  agentId?: string;
  phoneNumberId?: string;
  recipients: BatchCallRecipient[];
  scheduledTimeUnix?: number;
  timezone?: string;
}

export interface BatchCallResult {
  id: string;
  status: string;
  totalCallsScheduled: number;
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export interface TranscriptMessage {
  role: 'agent' | 'user';
  message: string;
  timeInCallSecs: number;
}

export interface ConversationDetails {
  conversationId: string;
  agentId: string;
  status: 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed';
  transcript: TranscriptMessage[];
  metadata: {
    startTimeUnix: number;
    callDurationSecs: number;
  };
  hasAudio: boolean;
  analysis?: Record<string, unknown>;
}

export interface ListConversationsFilters {
  agentId?: string;
  pageSize?: number;
  cursor?: string;
  callSuccessful?: 'success' | 'failure' | 'unknown';
  startAfterUnix?: number;
  startBeforeUnix?: number;
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export interface CreateAgentOptions {
  name: string;
  conversationConfig: {
    firstMessage?: string;
    language?: string;
    prompt: string;
    llm?: string;
    voiceId?: string;
  };
  tags?: string[];
}

export interface UpdateAgentOptions {
  name?: string;
  conversationConfig?: {
    firstMessage?: string;
    language?: string;
    prompt?: string;
    llm?: string;
    voiceId?: string;
  };
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Webhook events
// ---------------------------------------------------------------------------

export type CallOutcome = 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'failed';

export interface WebhookTranscriptionEvent {
  type: 'post_call_transcription';
  data: {
    agent_id: string;
    conversation_id: string;
    status: string;
    transcript: Array<{ role: string; message: string; time_in_call_secs: number }>;
    metadata: { start_time_unix_secs: number; call_duration_secs: number };
    analysis?: Record<string, unknown>;
  };
}

export interface WebhookAudioEvent {
  type: 'post_call_audio';
  data: {
    agent_id: string;
    conversation_id: string;
    audio_base64: string;
  };
}

export interface WebhookFailureEvent {
  type: 'call_initiation_failure';
  data: {
    agent_id: string;
    conversation_id?: string;
    error: string;
  };
}

export type ElevenLabsWebhookEvent =
  | WebhookTranscriptionEvent
  | WebhookAudioEvent
  | WebhookFailureEvent;
