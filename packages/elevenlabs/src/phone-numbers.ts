import { getElevenLabsClient } from './client';

export async function listPhoneNumbers() {
  const client = getElevenLabsClient();
  return client.conversationalAi.phoneNumbers.list();
}

export async function getPhoneNumber(phoneNumberId: string) {
  const client = getElevenLabsClient();
  return client.conversationalAi.phoneNumbers.get(phoneNumberId);
}

export async function updatePhoneNumber(phoneNumberId: string, patch: { agentId?: string; label?: string }) {
  const client = getElevenLabsClient();
  return client.conversationalAi.phoneNumbers.update(phoneNumberId, patch as any);
}

export async function deletePhoneNumber(phoneNumberId: string) {
  const client = getElevenLabsClient();
  return client.conversationalAi.phoneNumbers.delete(phoneNumberId);
}
