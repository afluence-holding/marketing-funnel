/**
 * Responses module — source registry (the only creator-specific code).
 *
 * Each entry describes an existing landing table in the `marketing` schema and
 * how to present it. The repository reads the table and flattens every row
 * generically; this file only declares *which* columns to surface.
 *
 * To onboard a new creator whose intake lives outside `marketing.leads`:
 *   1. add a `ResponseSource` here, and
 *   2. map its `${organizer}/${bu}` in `TENANT_SOURCES` below.
 * Then enable the `responses` module for that tenant in `lib/modules/registry.ts`.
 */

import type { ResponseSource } from './types';

const COMMON_LEAD_COLUMNS = [
  { key: 'created_at', label: 'Fecha' },
  { key: 'first_name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'WhatsApp' },
] as const;

export const RESPONSE_SOURCES: Record<string, ResponseSource> = {
  // Bukku — English test survey + interactive level test + guide download.
  bukku: {
    id: 'bukku',
    label: 'Test de inglés',
    creatorLabel: 'Bukku Education',
    table: 'bukku_leads',
    jsonbColumns: ['custom_fields'],
    utmColumn: 'utm_data',
    columns: [
      ...COMMON_LEAD_COLUMNS,
      { key: 'nivel_ingles_autorreportado', label: 'Nivel (autorreportado)' },
      { key: 'test_level', label: 'Nivel test' },
      { key: 'test_cefr', label: 'CEFR' },
      { key: 'test_total', label: 'Puntaje' },
      { key: 'aviso_lanzamiento', label: 'Quiere aviso' },
      { key: 'guide_level', label: 'Guía descargada' },
    ],
    limit: 5000,
  },

  // Mamá Sin Caos — "lista secreta" waitlist.
  'mama-sin-caos': {
    id: 'mama-sin-caos',
    label: 'Lista secreta',
    creatorLabel: 'Mamá Sin Caos',
    table: 'mama_sin_caos_leads',
    jsonbColumns: ['custom_fields'],
    utmColumn: 'utm_data',
    // Real landing column (not the utm channel) drives the campaign facet.
    sourceColumn: 'landing',
    columns: [
      ...COMMON_LEAD_COLUMNS,
      { key: 'landing', label: 'Landing' },
      { key: 'subscribed_at', label: 'Suscripción' },
    ],
    limit: 5000,
  },

  // German Roz — landing form leads. Unlike the creators above, German's intake
  // lives in the shared CRM `marketing.leads` table, so it's scoped by org id.
  'german-roz': {
    id: 'german-roz',
    label: 'Leads de landings',
    creatorLabel: 'German Roz',
    table: 'leads',
    filter: { column: 'organization_id', value: '614e43c9-5f3f-499b-8734-2fa256b3785c' },
    jsonbColumns: [],
    columns: [
      ...COMMON_LEAD_COLUMNS,
      { key: 'source', label: 'Landing' },
      { key: 'status', label: 'Estado' },
    ],
    limit: 5000,
  },

  // Caro Fitness — multi-step diagnostic quiz (tracks partial progress).
  'caro-fitness': {
    id: 'caro-fitness',
    label: 'Diagnóstico',
    creatorLabel: 'Caro Fitness',
    table: 'caro_fitness_progress',
    jsonbColumns: ['answers'],
    utmColumn: 'utm_data',
    statusColumn: 'status',
    statusValues: ['completed', 'in_progress', 'abandoned'],
    columns: [
      ...COMMON_LEAD_COLUMNS,
      { key: 'status', label: 'Estado' },
      { key: 'quiz_step', label: 'Paso' },
      { key: 'objetivo', label: 'Objetivo' },
      { key: 'sexo', label: 'Sexo' },
      { key: 'edad', label: 'Edad' },
      { key: 'frecuencia', label: 'Frecuencia' },
    ],
    limit: 5000,
  },
};

/** Which response sources belong to a given admin tenant (`${organizer}/${bu}`). */
export const TENANT_SOURCES: Record<string, string[]> = {
  'bukku/main': ['bukku'],
  'mama-sin-caos/main': ['mama-sin-caos'],
  'caro-fitness/main': ['caro-fitness'],
  // German lives in the CRM; its responses sit alongside campaigns + launch.
  'german-roz/di21': ['german-roz'],
};

/** Resolve the ordered list of sources for a tenant (empty if none configured). */
export function sourcesForTenant(organizer: string, bu: string): ResponseSource[] {
  const ids = TENANT_SOURCES[`${organizer}/${bu}`] ?? [];
  return ids.map((id) => RESPONSE_SOURCES[id]).filter((s): s is ResponseSource => Boolean(s));
}

/** Tenants that expose the Responses module (for navigation + registry). */
export function responsesTenants(): Array<{ organizer: string; bu: string; creatorLabel: string }> {
  return Object.keys(TENANT_SOURCES).map((key) => {
    const [organizer, bu] = key.split('/');
    const first = RESPONSE_SOURCES[(TENANT_SOURCES[key] ?? [])[0] ?? ''];
    return { organizer, bu, creatorLabel: first?.creatorLabel ?? organizer };
  });
}
