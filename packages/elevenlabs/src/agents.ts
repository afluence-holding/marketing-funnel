import { getElevenLabsClient } from './client';
import type { CreateAgentOptions, UpdateAgentOptions } from './types';

export async function createAgent(options: CreateAgentOptions) {
  const client = getElevenLabsClient();
  const result = await client.conversationalAi.agents.create({
    name: options.name,
    tags: options.tags,
    conversationConfig: {
      agent: {
        firstMessage: options.conversationConfig.firstMessage,
        language: options.conversationConfig.language ?? 'en',
        prompt: {
          prompt: options.conversationConfig.prompt,
          llm: options.conversationConfig.llm as any,
        },
      },
      tts: options.conversationConfig.voiceId
        ? { voiceId: options.conversationConfig.voiceId }
        : undefined,
    },
  });
  return result;
}

export async function getAgent(agentId: string) {
  const client = getElevenLabsClient();
  return client.conversationalAi.agents.get(agentId);
}

export async function updateAgent(agentId: string, options: UpdateAgentOptions) {
  const client = getElevenLabsClient();
  return client.conversationalAi.agents.update(agentId, {
    name: options.name,
    tags: options.tags,
    conversationConfig: options.conversationConfig
      ? {
          agent: {
            firstMessage: options.conversationConfig.firstMessage,
            language: options.conversationConfig.language,
            prompt: options.conversationConfig.prompt
              ? {
                  prompt: options.conversationConfig.prompt,
                  llm: options.conversationConfig.llm as any,
                }
              : undefined,
          },
          tts: options.conversationConfig.voiceId
            ? { voiceId: options.conversationConfig.voiceId }
            : undefined,
        }
      : undefined,
  });
}

export async function deleteAgent(agentId: string) {
  const client = getElevenLabsClient();
  return client.conversationalAi.agents.delete(agentId);
}

export async function listAgents(filters?: {
  pageSize?: number;
  search?: string;
  cursor?: string;
}) {
  const client = getElevenLabsClient();
  return client.conversationalAi.agents.list({
    pageSize: filters?.pageSize ?? 20,
    search: filters?.search,
    cursor: filters?.cursor,
  });
}
