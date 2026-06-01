import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

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

function resolveDataDir(): string {
  if (process.env.BUKKU_DATA_DIR) {
    return path.resolve(process.env.BUKKU_DATA_DIR);
  }

  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'bukku');
  }

  return path.join(process.cwd(), '.data/bukku');
}

const DATA_DIR = resolveDataDir();
const DATA_FILE = path.join(DATA_DIR, 'leads.json');

const BASE_HEADERS = [
  'lead_id',
  'email',
  'first_name',
  'phone',
  'source',
  'created_at',
  'updated_at',
] as const;

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

async function readAll(): Promise<BukkuLeadRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as BukkuLeadRecord[]) : [];
}

async function writeAll(records: BukkuLeadRecord[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export function getBukkuDataFilePath() {
  return DATA_FILE;
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

  const records = await readAll();
  const index = records.findIndex((record) => record.email === email);
  const now = new Date().toISOString();

  if (index >= 0) {
    const existing = records[index];
    const updated: BukkuLeadRecord = {
      ...existing,
      firstName: input.firstName?.trim() || existing.firstName,
      phone: input.phone?.trim() || existing.phone,
      source: input.source || existing.source,
      customFields: {
        ...existing.customFields,
        ...(input.customFields ?? {}),
      },
      utmData: {
        ...existing.utmData,
        ...(input.utmData ?? {}),
      },
      updatedAt: now,
    };
    records[index] = updated;
    await writeAll(records);
    return updated;
  }

  const created: BukkuLeadRecord = {
    id: randomUUID(),
    email,
    firstName: input.firstName?.trim() ?? '',
    phone: input.phone?.trim() ?? '',
    source: input.source ?? 'landing-bukku-test-ingles',
    customFields: input.customFields ?? {},
    utmData: input.utmData ?? {},
    createdAt: now,
    updatedAt: now,
  };

  records.unshift(created);
  await writeAll(records);
  return created;
}

export async function listBukkuLeadsForTable() {
  const records = await readAll();
  const customFieldKeys = new Set<string>();

  for (const record of records) {
    for (const key of Object.keys(record.customFields)) {
      customFieldKeys.add(key);
    }
  }

  const headers = [...BASE_HEADERS, ...Array.from(customFieldKeys).sort()];
  const rows = records.map((record) => {
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
    storage: 'local-file' as const,
    dataFile: DATA_FILE,
    total: rows.length,
    headers,
    data: rows,
  };
}
