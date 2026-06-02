import { randomUUID } from 'node:crypto';
import { env } from '@marketing-funnel/config';

export interface BukkuLeadRecord {
  id: string;
  email: string;
  firstName: string;
  phone: string;
  source: string;
  customFields: Record<string, string>;
  utmData: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

type BukkuLeadRow = {
  id: string;
  email: string;
  first_name: string;
  phone: string;
  source: string;
  custom_fields: Record<string, string> | null;
  utm_data: Record<string, string> | null;
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

function buildHeaders(prefer?: string) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Accept-Profile': 'marketing',
    'Content-Profile': 'marketing',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function rowToRecord(row: BukkuLeadRow): BukkuLeadRecord {
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

export async function upsertBukkuLead(input: {
  email: string;
  firstName?: string;
  phone?: string;
  source?: string;
  customFields?: Record<string, string>;
  utmData?: Record<string, string>;
}): Promise<BukkuLeadRecord> {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw new Error('Email is required');
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/$/, '');
  const now = new Date().toISOString();

  const existingResponse = await fetch(
    `${baseUrl}/rest/v1/bukku_leads?select=*&email=eq.${encodeURIComponent(email)}&limit=1`,
    { headers: buildHeaders(), cache: 'no-store' },
  );
  const existingRows = await parseJsonResponse<BukkuLeadRow[]>(existingResponse);
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
      `${baseUrl}/rest/v1/bukku_leads?id=eq.${encodeURIComponent(existing.id)}`,
      {
        method: 'PATCH',
        headers: buildHeaders('return=representation'),
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );
    const updatedRows = await parseJsonResponse<BukkuLeadRow[]>(updateResponse);
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

  const createResponse = await fetch(`${baseUrl}/rest/v1/bukku_leads`, {
    method: 'POST',
    headers: buildHeaders('return=representation'),
    body: JSON.stringify(createdPayload),
    cache: 'no-store',
  });
  const createdRows = await parseJsonResponse<BukkuLeadRow[]>(createResponse);
  return rowToRecord(createdRows[0] ?? createdPayload);
}

export async function listBukkuLeadsForTable() {
  const baseUrl = env.SUPABASE_URL.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/rest/v1/bukku_leads?select=*&order=created_at.desc`, {
    headers: buildHeaders(),
    cache: 'no-store',
  });
  const rows = await parseJsonResponse<BukkuLeadRow[]>(response);
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
