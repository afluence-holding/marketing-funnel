import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
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
  custom_fields: Record<string, string>;
  utm_data: Record<string, string>;
  created_at: string | Date;
  updated_at: string | Date;
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

function rowToRecord(row: BukkuLeadRow): BukkuLeadRecord {
  const createdAt =
    row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
  const updatedAt =
    row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at);

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    phone: row.phone,
    source: row.source,
    customFields: row.custom_fields ?? {},
    utmData: row.utm_data ?? {},
    createdAt,
    updatedAt,
  };
}

async function withClient<T>(fn: (client: Client) => Promise<T>) {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
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

  return withClient(async (client) => {
    const existing = await client.query<BukkuLeadRow>(
      `SELECT id, email, first_name, phone, source, custom_fields, utm_data, created_at, updated_at
       FROM marketing.bukku_leads
       WHERE lower(email) = $1
       LIMIT 1`,
      [email],
    );

    const now = new Date();

    if (existing.rows[0]) {
      const row = existing.rows[0];
      const customFields = {
        ...(row.custom_fields ?? {}),
        ...(input.customFields ?? {}),
      };
      const utmData = {
        ...(row.utm_data ?? {}),
        ...(input.utmData ?? {}),
      };

      const updated = await client.query<BukkuLeadRow>(
        `UPDATE marketing.bukku_leads
         SET first_name = $2,
             phone = $3,
             source = $4,
             custom_fields = $5::jsonb,
             utm_data = $6::jsonb,
             updated_at = $7
         WHERE id = $1
         RETURNING id, email, first_name, phone, source, custom_fields, utm_data, created_at, updated_at`,
        [
          row.id,
          input.firstName?.trim() || row.first_name,
          input.phone?.trim() || row.phone,
          input.source || row.source,
          JSON.stringify(customFields),
          JSON.stringify(utmData),
          now,
        ],
      );

      return rowToRecord(updated.rows[0]);
    }

    const created = await client.query<BukkuLeadRow>(
      `INSERT INTO marketing.bukku_leads
         (id, email, first_name, phone, source, custom_fields, utm_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $8)
       RETURNING id, email, first_name, phone, source, custom_fields, utm_data, created_at, updated_at`,
      [
        randomUUID(),
        email,
        input.firstName?.trim() ?? '',
        input.phone?.trim() ?? '',
        input.source ?? 'landing-bukku-test-ingles',
        JSON.stringify(input.customFields ?? {}),
        JSON.stringify(input.utmData ?? {}),
        now,
      ],
    );

    return rowToRecord(created.rows[0]);
  });
}

export async function listBukkuLeadsForTable() {
  return withClient(async (client) => {
    const result = await client.query<BukkuLeadRow>(
      `SELECT id, email, first_name, phone, source, custom_fields, utm_data, created_at, updated_at
       FROM marketing.bukku_leads
       ORDER BY created_at DESC`,
    );

    const records = result.rows.map(rowToRecord);
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
  });
}
