import type { Resend } from 'resend';

export interface EmailConfig {
  apiKey: string;
  defaultFrom: {
    name: string;
    email: string;
  };
  replyTo?: string;
}

export interface EmailResult {
  id: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export type ResendClient = InstanceType<typeof Resend>;
