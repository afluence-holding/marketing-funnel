import { getEmailService } from '@marketing-funnel/email';
import type { StepHandler, SendEmailStep, StepLeadContext } from '../../types';

export const sendEmailHandler: StepHandler = async (step, lead, _enrollment) => {
  if (step.type !== 'send_email') return {};

  const s = step as SendEmailStep;
  const emailService = getEmailService();
  const leadName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'there';

  const data: Record<string, unknown> = {
    lead_name: leadName,
    lead_email: lead.email,
    lead_phone: lead.phone ?? '',
    ...s.data,
  };

  await emailService.send({
    to: lead.email,
    subject: interpolate(s.subject, lead),
    template: s.templateId,
    data,
  });

  console.log(`[send_email] Sent "${s.templateId}" to ${lead.email} (lead: ${lead.id})`);
  return {};
};

function interpolate(template: string, lead: StepLeadContext): string {
  const leadName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'there';
  return template
    .replace(/\{\{lead_name\}\}/g, leadName)
    .replace(/\{\{lead_email\}\}/g, lead.email ?? '')
    .replace(/\{\{lead_phone\}\}/g, lead.phone ?? '');
}
