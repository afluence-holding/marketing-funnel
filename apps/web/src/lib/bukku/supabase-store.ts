import { randomUUID } from 'node:crypto';
import type { BukkuLeadRecord } from './leads-store';

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

type SupabaseRow = {
  id: string;
  email: string;
  first_name: string;
  phone: string;
  source: string;
  custom_fields: Record<string, string>;
  utm_data: Record<string, string>;
  created_at: string;
  updated_at: string;
};

const BASE_HEADERS = [
  'lead_id',
  'email',
  'first_name',
  'phone',
  'source',
  'created_at',
  'updated_at',
] as const;

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url: url.replace(/\/$/, ''), serviceRoleKey };
}

function buildHeaders(config: SupabaseConfig, prefer?: string) {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function rowToRecord(row: SupabaseRow): BukkuLeadRecord {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    phone: row.phone,
    source: row.source,
    customFields: row.custom_fields ?? {},
    utmData: row.utm_data ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Supabase request failed (${response.status})`);
  }
  return text ? (JSON.parse(text) as T) : ([] as T);
}

export function isBukkuSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}

export async function upsertBukkuLeadInSupabase(input: {
  email: string;
  firstName?: string;
  phone?: string;
  source?: string;
  customFields?: Record<string, string>;
  utmData?: Record<string, string>;
}): Promise<BukkuLeadRecord> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase is not configured for Bukku storage');
  }

  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const existingResponse = await fetch(
    `${config.url}/rest/v1/bukku_leads?select=*&email=eq.${encodeURIComponent(email)}&limit=1`,
    {
      headers: buildHeaders(config),
      cache: 'no-store',
    },
  );
  const existingRows = await parseJsonResponse<SupabaseRow[]>(existingResponse);
  const existing = existingRows[0];

  if (existing) {
    const payload = {
      first_name: input.firstName?.trim() || existing.first_name,
      phone: input.phone?.trim() || existing.phone,
      source: input.source || existing.source,
      custom_fields: {
        ...(existing.custom_fields ?? {}),
        ...(input.customFields ?? {}),
      },
      utm_data: {
        ...(existing.utm_data ?? {}),
        ...(input.utmData ?? {}),
      },
      updated_at: now,
    };

    const updateResponse = await fetch(
      `${config.url}/rest/v1/bukku_leads?id=eq.${encodeURIComponent(existing.id)}`,
      {
        method: 'PATCH',
        headers: buildHeaders(config, 'return=representation'),
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );
    const updatedRows = await parseJsonResponse<SupabaseRow[]>(updateResponse);
    return rowToRecord(updatedRows[0] ?? { ...existing, ...payload, email });
  }

  const createdPayload = {
    id: randomUUID(),
    email,
    first_name: input.firstName?.trim() ?? '',
    phone: input.phone?.trim() ?? '',
    source: input.source ?? 'landing-bukku-test-ingles',
    custom_fields: input.customFields ?? {},
    utm_data: input.utmData ?? {},
    created_at: now,
    updated_at: now,
  };

  const createResponse = await fetch(`${config.url}/rest/v1/bukku_leads`, {
    method: 'POST',
    headers: buildHeaders(config, 'return=representation'),
    body: JSON.stringify(createdPayload),
    cache: 'no-store',
  });
  const createdRows = await parseJsonResponse<SupabaseRow[]>(createResponse);
  return rowToRecord(createdRows[0] ?? createdPayload);
}

export async function listBukkuLeadsFromSupabase() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase is not configured for Bukku storage');
  }

  const response = await fetch(
    `${config.url}/rest/v1/bukku_leads?select=*&order=created_at.desc`,
    {
      headers: buildHeaders(config),
      cache: 'no-store',
    },
  );
  const rows = await parseJsonResponse<SupabaseRow[]>(response);
  const records = rows.map(rowToRecord);
  const customFieldKeys = new Set<string>();

  for (const record of records) {
    for (const key of Object.keys(record.customFields)) {
      customFieldKeys.add(key);
    }
  }

  const tableRows = records.map((record) => {
    const row: Record<string, string> = {
      lead_id: record.id,
      email: record.email,
      first_name: record.firstName,
      phone: record.phone,
      source: record.source,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    };

    for (const key of customFieldKeys) {
      row[key] = record.customFields[key] ?? '';
    }

    return row;
  });

  return {
    ok: true as const,
    source: 'landing-bukku-test-ingles',
    storage: 'supabase' as const,
    total: tableRows.length,
    headers: [...BASE_HEADERS, ...Array.from(customFieldKeys).sort()],
    data: tableRows,
  };
}
