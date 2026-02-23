import { env } from '@marketing-funnel/config';

/**
 * WhatsApp Client Configuration
 * 
 * Lee las credenciales desde packages/config y las adapta
 * al formato esperado por @kapso/whatsapp-cloud-api
 */

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  webhookVerifyToken?: string;
  businessAccountId?: string;
  apiVersion?: string;
  baseUrl?: string;
  kapsoApiKey?: string;
  appSecret?: string; // Para verificar webhooks
  timeout?: number;
}

/**
 * Obtiene la configuración del cliente WhatsApp desde variables de entorno
 */
export function getWhatsAppConfig(): WhatsAppConfig {
  // Validar que existan las credenciales requeridas
  if (!env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WHATSAPP_ACCESS_TOKEN is required. Please set it in your .env file');
  }

  if (!env.WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID is required. Please set it in your .env file');
  }

  return {
    // Credenciales requeridas
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    
    // Credenciales opcionales
    webhookVerifyToken: env.WHATSAPP_WEBHOOK_TOKEN,
    businessAccountId: env.WHATSAPP_BUSINESS_ID,
    appSecret: (env as any).META_APP_SECRET, // Para verificar webhooks (opcional, puede agregarse a @carlazaplana/config)
    
    // Kapso proxy (opcional)
    kapsoApiKey: (env as any).KAPSO_API_KEY,
    
    // Configuración opcional con defaults
    apiVersion: env.WHATSAPP_API_VERSION || 'v21.0',
    baseUrl: env.WHATSAPP_BASE_URL || (env as any).KAPSO_BASE_URL, // Puede ser Kapso proxy
    timeout: 60000, // 60 segundos
  };
}

/**
 * Valida que las credenciales de WhatsApp estén configuradas
 */
export function validateWhatsAppConfig(): boolean {
  try {
    getWhatsAppConfig();
    return true;
  } catch (error) {
    return false;
  }
}

