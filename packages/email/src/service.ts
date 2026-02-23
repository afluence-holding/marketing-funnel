import { getResendClient, initializeResendClient } from './client/resend-client';
import { renderTemplate } from './templates';
import type { EmailConfig, EmailResult } from './types';

export interface SendOptions {
  template: string;
  to: string | string[];
  subject: string;
  data: Record<string, unknown>;
  tags?: string[];
}

export interface BulkRecipient {
  email: string;
  data: Record<string, unknown>;
}

export interface SendBulkOptions {
  template: string;
  subject: string;
  recipients: BulkRecipient[];
}

export class EmailService {
  private config: EmailConfig;
  private initialized = false;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  initialize(): void {
    if (this.initialized) return;
    initializeResendClient(this.config);
    this.initialized = true;
  }

  async send(options: SendOptions): Promise<EmailResult> {
    this.ensureInitialized();

    try {
      const { html, text } = await renderTemplate(options.template, options.data);
      const resend = getResendClient();

      const result = await resend.emails.send({
        from: `${this.config.defaultFrom.name} <${this.config.defaultFrom.email}>`,
        to: options.to,
        subject: options.subject,
        html,
        text,
        reply_to: this.config.replyTo,
        tags: options.tags?.map(tag => ({ name: tag, value: tag })),
      });

      if (result.error) {
        console.error('[EmailService] Send failed:', result.error);
        return { id: '', success: false, error: result.error.message };
      }

      return { id: result.data?.id || '', success: true, messageId: result.data?.id };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Error:', message);
      return { id: '', success: false, error: message };
    }
  }

  async sendBulk(options: SendBulkOptions): Promise<EmailResult[]> {
    this.ensureInitialized();
    console.log(`[EmailService] Sending bulk to ${options.recipients.length} recipients`);

    const results: EmailResult[] = [];

    for (const recipient of options.recipients) {
      const result = await this.send({
        template: options.template,
        to: recipient.email,
        subject: options.subject,
        data: recipient.data,
      });
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const ok = results.filter(r => r.success).length;
    console.log(`[EmailService] Bulk done: ${ok}/${options.recipients.length} sent`);
    return results;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('EmailService not initialized. Call initialize() first.');
    }
  }
}

let instance: EmailService | null = null;

export function getEmailService(config?: EmailConfig): EmailService {
  if (!instance) {
    if (!config) throw new Error('EmailService not initialized. Provide config on first call.');
    instance = new EmailService(config);
    instance.initialize();
  }
  return instance;
}
