import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const root = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),

  // WhatsApp (optional — only needed when using whatsapp-client)
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_WEBHOOK_TOKEN: z.string().optional(),
  WHATSAPP_BUSINESS_ID: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().optional(),
  WHATSAPP_BASE_URL: z.string().optional(),

  // ElevenLabs (optional — only needed when using elevenlabs package)
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().optional(),
  ELEVENLABS_PHONE_NUMBER_ID: z.string().optional(),
  ELEVENLABS_WEBHOOK_SECRET: z.string().optional(),

  // Admin dashboard cron triggers (optional — only used by the scheduled jobs
  // in apps/api that hit the admin app to refresh Meta Ads data hourly).
  // If either is missing the pull jobs log a warning and no-op, so local dev
  // and non-admin deploys keep working.
  ADMIN_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(1).optional(),

  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
