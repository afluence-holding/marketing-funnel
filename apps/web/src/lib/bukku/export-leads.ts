type LeadRow = Record<string, string>;

const BASE_COLUMN_ORDER = [
  'lead_id',
  'created_at',
  'updated_at',
  'first_name',
  'email',
  'phone',
  'source',
  'nivel_ingles_autorreportado',
  'test_level',
  'test_cefr',
  'test_total',
  'aviso_lanzamiento',
  'guide_level',
];

const COLUMN_LABELS: Record<string, string> = {
  lead_id: 'ID',
  created_at: 'Fecha',
  updated_at: 'Actualizado',
  first_name: 'Nombre',
  email: 'Email',
  phone: 'WhatsApp',
  source: 'Source',
  nivel_ingles_autorreportado: 'Nivel (autorreportado)',
  test_level: 'Nivel test',
  test_cefr: 'CEFR',
  test_total: 'Puntaje',
  aviso_lanzamiento: 'Quiere aviso',
  guide_level: 'Guía descargada',
  ocupacion: 'Ocupación',
  ingreso_mensual_usd: 'Ingreso mensual USD',
  metodos_probados: 'Métodos probados',
  frustracion: 'Frustración',
  cambio_vida: 'Cambio de vida',
  proposito_principal: 'Propósito principal',
  preferencia_producto: 'Preferencia producto',
  interes_ia: 'Interés IA',
  survey_submitted_at: 'Encuesta enviada',
  test_level_key: 'Nivel test (key)',
  test_percentage: 'Test %',
  test_score_grammar: 'Score grammar',
  test_score_listening: 'Score listening',
  test_score_reading: 'Score reading',
  test_max: 'Test máximo',
  test_completed_at: 'Test completado',
  guide_opened_at: 'Guía abierta',
};

function exportFilename(ext: 'csv' | 'xlsx') {
  const date = new Date().toISOString().slice(0, 10);
  return `bukku-leads-${date}.${ext}`;
}

export function collectExportColumns(rows: LeadRow[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) keys.add(key);
  }

  const ordered = BASE_COLUMN_ORDER.filter((key) => keys.has(key));
  const rest = [...keys].filter((key) => !ordered.includes(key)).sort();
  return [...ordered, ...rest];
}

function columnLabel(key: string) {
  return COLUMN_LABELS[key] ?? key.replace(/_/g, ' ');
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadLeadsCsv(rows: LeadRow[]) {
  const columns = collectExportColumns(rows);
  const headerRow = columns.map(columnLabel).map(escapeCsvCell).join(',');
  const dataRows = rows.map((row) =>
    columns.map((col) => escapeCsvCell(row[col] ?? '')).join(','),
  );
  const csv = `\uFEFF${[headerRow, ...dataRows].join('\n')}\n`;
  triggerDownload(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    exportFilename('csv'),
  );
}

export async function downloadLeadsXlsx(rows: LeadRow[]) {
  const XLSX = await import('xlsx');
  const columns = collectExportColumns(rows);
  const sheetRows = rows.map((row) => {
    const out: Record<string, string> = {};
    for (const col of columns) {
      out[columnLabel(col)] = row[col] ?? '';
    }
    return out;
  });

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, exportFilename('xlsx'));
}
