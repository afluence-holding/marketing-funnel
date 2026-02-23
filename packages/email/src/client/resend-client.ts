import { Resend } from 'resend';
import type { EmailConfig, ResendClient } from '../types';

let resendInstance: ResendClient | null = null;

export function initializeResendClient(config: EmailConfig): ResendClient {
  if (!resendInstance) {
    resendInstance = new Resend(config.apiKey);
  }
  return resendInstance;
}

export function getResendClient(): ResendClient {
  if (!resendInstance) {
    throw new Error('Resend client not initialized. Call initializeResendClient first.');
  }
  return resendInstance;
}
