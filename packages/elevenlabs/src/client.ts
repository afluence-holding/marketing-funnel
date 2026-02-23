import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { env } from '@marketing-funnel/config';

let instance: ElevenLabsClient | null = null;

export function getElevenLabsClient(): ElevenLabsClient {
  if (!instance) {
    if (!env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is required. Set it in your .env file.');
    }
    instance = new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
  }
  return instance;
}
