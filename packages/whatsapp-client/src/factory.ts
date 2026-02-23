import { getWhatsAppConfig } from './config';
import { WhatsAppClientCore } from './core';
import { WhatsAppSender, DirectWhatsAppSender } from './sender';

let instance: WhatsAppSender | null = null;

export function getWhatsAppClient(): WhatsAppSender {
  if (!instance) {
    const config = getWhatsAppConfig();
    const core = new WhatsAppClientCore(config);
    instance = new DirectWhatsAppSender(core);
  }
  return instance;
}
