import { env } from '@marketing-funnel/config';
import { getElevenLabsClient } from './client';
import type { CallOptions, CallResult, BatchCallOptions, BatchCallResult } from './types';

/**
 * Make a single outbound phone call via Twilio.
 * Falls back to ELEVENLABS_AGENT_ID / ELEVENLABS_PHONE_NUMBER_ID from env.
 */
export async function makeCall(options: CallOptions): Promise<CallResult> {
  const client = getElevenLabsClient();
  const agentId = options.agentId ?? env.ELEVENLABS_AGENT_ID;
  const phoneNumberId = options.phoneNumberId ?? env.ELEVENLABS_PHONE_NUMBER_ID;

  if (!agentId) {
    throw new Error('agentId is required. Pass it directly or set ELEVENLABS_AGENT_ID.');
  }
  if (!phoneNumberId) {
    throw new Error('phoneNumberId is required. Pass it directly or set ELEVENLABS_PHONE_NUMBER_ID.');
  }

  const overrides = options.conversationConfigOverride;
  const conversationInitiationClientData: any = {};

  if (options.dynamicVariables && Object.keys(options.dynamicVariables).length > 0) {
    conversationInitiationClientData.dynamicVariables = options.dynamicVariables;
  }

  if (overrides) {
    const agentOverride: any = {};
    if (overrides.firstMessage) agentOverride.firstMessage = overrides.firstMessage;
    if (overrides.language) agentOverride.language = overrides.language;
    if (overrides.prompt) agentOverride.prompt = { prompt: overrides.prompt };

    const ttsOverride = overrides.voiceId ? { voiceId: overrides.voiceId } : undefined;

    conversationInitiationClientData.conversationConfigOverride = {
      agent: Object.keys(agentOverride).length > 0 ? agentOverride : undefined,
      tts: ttsOverride,
    };
  }

  const result = await client.conversationalAi.twilio.outboundCall({
    agentId,
    agentPhoneNumberId: phoneNumberId,
    toNumber: options.toNumber,
    ...(Object.keys(conversationInitiationClientData).length > 0 && {
      conversationInitiationClientData,
    }),
  });

  return {
    conversationId: (result as any).conversationId ?? (result as any).conversation_id ?? '',
    callSid: (result as any).callSid ?? (result as any).call_sid,
  };
}

/**
 * Submit a batch of outbound calls (campaign).
 */
export async function makeBatchCalls(options: BatchCallOptions): Promise<BatchCallResult> {
  const client = getElevenLabsClient();
  const agentId = options.agentId ?? env.ELEVENLABS_AGENT_ID;
  const phoneNumberId = options.phoneNumberId ?? env.ELEVENLABS_PHONE_NUMBER_ID;

  if (!agentId) {
    throw new Error('agentId is required. Pass it directly or set ELEVENLABS_AGENT_ID.');
  }

  const recipients = options.recipients.map((r) => ({
    phoneNumber: r.phoneNumber,
    ...(r.id && { id: r.id }),
    ...(r.dynamicVariables && {
      conversationInitiationClientData: { dynamicVariables: r.dynamicVariables },
    }),
  }));

  const result: any = await client.conversationalAi.batchCalls.create({
    callName: options.callName,
    agentId,
    ...(phoneNumberId && { agentPhoneNumberId: phoneNumberId }),
    recipients,
    ...(options.scheduledTimeUnix && { scheduledTimeUnix: options.scheduledTimeUnix }),
    ...(options.timezone && { timezone: options.timezone }),
  });

  return {
    id: result.id ?? '',
    status: result.status ?? 'pending',
    totalCallsScheduled: result.totalCallsScheduled ?? result.total_calls_scheduled ?? 0,
  };
}
