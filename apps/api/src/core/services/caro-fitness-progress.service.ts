import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';
import { ensureCaroFitnessProgressTable } from '../bootstrap/ensure-caro-fitness-progress-table';

export interface CaroFitnessProgressRecord {
  id: string;
  sessionId: string;
  source: string;
  email: string;
  firstName: string;
  phone: string;
  quizStep: string;
  status: string;
  answers: Record<string, string>;
  utmData: Record<string, string>;
  leadId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type CaroFitnessProgressRow = {
  id: string;
  session_id: string;
  source: string;
  email: string;
  first_name: string;
  phone: string;
  quiz_step: string;
  status: string;
  answers: Record<string, string>;
  utm_data: Record<string, string>;
  lead_id: string | null;
  completed_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIso(value: string | Date | null): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function rowToRecord(row: CaroFitnessProgressRow): CaroFitnessProgressRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    source: row.source,
    email: row.email,
    firstName: row.first_name,
    phone: row.phone,
    quizStep: row.quiz_step,
    status: row.status,
    answers: row.answers ?? {},
    utmData: row.utm_data ?? {},
    leadId: row.lead_id,
    completedAt: toIso(row.completed_at),
    createdAt: toIso(row.created_at) ?? '',
    updatedAt: toIso(row.updated_at) ?? '',
  };
}

async function withClient<T>(fn: (client: Client) => Promise<T>) {
  await ensureCaroFitnessProgressTable();
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function upsertCaroFitnessProgress(input: {
  sessionId: string;
  source?: string;
  email?: string;
  firstName?: string;
  phone?: string;
  quizStep?: string;
  status?: string;
  answers?: Record<string, string>;
  utmData?: Record<string, string>;
  leadId?: string;
  completedAt?: string | null;
}): Promise<CaroFitnessProgressRecord> {
  const sessionId = input.sessionId.trim();
  if (!sessionId) {
    throw new Error('sessionId is required');
  }

  return withClient(async (client) => {
    const existing = await client.query<CaroFitnessProgressRow>(
      `SELECT *
       FROM marketing.caro_fitness_progress
       WHERE session_id = $1
       LIMIT 1`,
      [sessionId],
    );

    const email = (input.email ?? existing.rows[0]?.email ?? '').trim().toLowerCase();
    const firstName = (input.firstName ?? existing.rows[0]?.first_name ?? '').trim();
    const phone = (input.phone ?? existing.rows[0]?.phone ?? '').trim();
    const source = (input.source ?? existing.rows[0]?.source ?? 'landing-caro-fitness-diagnostico').trim();
    const quizStep = (input.quizStep ?? existing.rows[0]?.quiz_step ?? 'intro').trim();
    const status = (input.status ?? existing.rows[0]?.status ?? 'in_progress').trim();
    const answers = {
      ...(existing.rows[0]?.answers ?? {}),
      ...(input.answers ?? {}),
    };
    const utmData = {
      ...(existing.rows[0]?.utm_data ?? {}),
      ...(input.utmData ?? {}),
    };
    const leadId = input.leadId ?? existing.rows[0]?.lead_id ?? null;
    const completedAt =
      input.completedAt === undefined
        ? existing.rows[0]?.completed_at ?? null
        : input.completedAt;

    if (existing.rows[0]) {
      const result = await client.query<CaroFitnessProgressRow>(
        `UPDATE marketing.caro_fitness_progress
         SET email = $2,
             first_name = $3,
             phone = $4,
             source = $5,
             quiz_step = $6,
             status = $7,
             answers = $8::jsonb,
             utm_data = $9::jsonb,
             lead_id = $10,
             completed_at = $11,
             updated_at = now()
         WHERE session_id = $1
         RETURNING *`,
        [
          sessionId,
          email,
          firstName,
          phone,
          source,
          quizStep,
          status,
          JSON.stringify(answers),
          JSON.stringify(utmData),
          leadId,
          completedAt,
        ],
      );
      return rowToRecord(result.rows[0]);
    }

    const result = await client.query<CaroFitnessProgressRow>(
      `INSERT INTO marketing.caro_fitness_progress
        (id, session_id, source, email, first_name, phone, quiz_step, status, answers, utm_data, lead_id, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12)
       RETURNING *`,
      [
        randomUUID(),
        sessionId,
        source,
        email,
        firstName,
        phone,
        quizStep,
        status,
        JSON.stringify(answers),
        JSON.stringify(utmData),
        leadId,
        completedAt,
      ],
    );

    return rowToRecord(result.rows[0]);
  });
}

const BASE_HEADERS = [
  'session_id',
  'lead_id',
  'created_at',
  'updated_at',
  'first_name',
  'email',
  'phone',
  'status',
  'quiz_step',
  'source',
  'completed_at',
] as const;

export async function listCaroFitnessProgressForTable() {
  return withClient(async (client) => {
    const result = await client.query<CaroFitnessProgressRow>(
      `SELECT *
       FROM marketing.caro_fitness_progress
       ORDER BY created_at DESC`,
    );

    const records = result.rows.map(rowToRecord);
    const answerKeys = new Set<string>();
    const utmKeys = new Set<string>();

    for (const record of records) {
      for (const key of Object.keys(record.answers)) {
        answerKeys.add(key);
      }
      for (const key of Object.keys(record.utmData)) {
        utmKeys.add(key);
      }
    }

    const tableRows = records.map((record) => {
      const row: Record<string, string> = {
        session_id: record.sessionId,
        lead_id: record.leadId ?? '',
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        first_name: record.firstName,
        email: record.email,
        phone: record.phone,
        status: record.status,
        quiz_step: record.quizStep,
        source: record.source,
        completed_at: record.completedAt ?? '',
      };

      for (const key of answerKeys) {
        row[key] = record.answers[key] ?? '';
      }

      for (const key of utmKeys) {
        row[key] = record.utmData[key] ?? '';
      }

      return row;
    });

    return {
      ok: true as const,
      source: 'landing-caro-fitness-diagnostico',
      storage: 'supabase' as const,
      total: tableRows.length,
      headers: [
        ...BASE_HEADERS,
        ...Array.from(answerKeys).sort(),
        ...Array.from(utmKeys).sort(),
      ],
      data: tableRows,
    };
  });
}
