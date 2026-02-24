import { getWhatsAppClient } from '@marketing-funnel/whatsapp-client';
import type { StepHandler, WhatsAppStep, StepLeadContext } from '../../types';

export const sendWhatsAppHandler: StepHandler = async (step, lead, _enrollment) => {
  if (step.type !== 'send_whatsapp') return {};

  if (!lead.phone) {
    console.warn(`[send_whatsapp] Lead ${lead.id} has no phone — skipping`);
    return {};
  }

  const wa = getWhatsAppClient();
  const s = step as WhatsAppStep;

  switch (s.messageType) {
    case 'text':
      await wa.sendText(lead.phone, interpolate(s.body, lead), { previewUrl: s.previewUrl });
      break;

    case 'template':
      await wa.sendTemplate(
        lead.phone,
        s.templateName,
        s.language,
        s.bodyParams?.map((p) => interpolate(p, lead)),
        s.buttonParams,
      );
      break;

    case 'image':
      await wa.sendImage(lead.phone, s.imageUrl, { caption: s.caption ? interpolate(s.caption, lead) : undefined });
      break;

    case 'video':
      await wa.sendVideo(lead.phone, s.videoUrl, { caption: s.caption ? interpolate(s.caption, lead) : undefined });
      break;

    case 'document':
      await wa.sendDocument(lead.phone, s.documentUrl, {
        caption: s.caption ? interpolate(s.caption, lead) : undefined,
        filename: s.filename,
      });
      break;

    case 'buttons':
      await wa.sendButtons(lead.phone, {
        bodyText: interpolate(s.bodyText, lead),
        buttons: s.buttons,
        headerText: s.headerText ? interpolate(s.headerText, lead) : undefined,
        footerText: s.footerText,
      });
      break;

    case 'list':
      await wa.sendList(lead.phone, {
        bodyText: interpolate(s.bodyText, lead),
        buttonText: s.buttonText,
        sections: s.sections,
        headerText: s.headerText ? interpolate(s.headerText, lead) : undefined,
        footerText: s.footerText,
      });
      break;

    default: {
      const _exhaustive: never = s;
      console.error(`[send_whatsapp] Unknown messageType: ${(s as any).messageType}`);
    }
  }

  console.log(`[send_whatsapp] Sent ${s.messageType} to ${lead.phone} (lead: ${lead.id})`);
  return {};
};

function interpolate(template: string, lead: StepLeadContext): string {
  const leadName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'there';
  return template
    .replace(/\{\{lead_name\}\}/g, leadName)
    .replace(/\{\{lead_email\}\}/g, lead.email ?? '')
    .replace(/\{\{lead_phone\}\}/g, lead.phone ?? '');
}
