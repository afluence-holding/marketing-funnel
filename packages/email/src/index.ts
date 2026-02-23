export { EmailService, getEmailService } from './service';
export type { SendOptions, SendBulkOptions, BulkRecipient } from './service';

export type { EmailConfig, EmailResult } from './types';

export { initializeResendClient, getResendClient } from './client/resend-client';

export { renderTemplate, getAvailableTemplates } from './templates';
