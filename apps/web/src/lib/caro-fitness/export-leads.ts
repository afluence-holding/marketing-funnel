type LeadRow = Record<string, string>;

const BASE_COLUMN_ORDER = [
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
  'sexo',
  'objetivo',
  'edad',
  'peso',
  'frecuencia',
  'tipo',
  'proteina',
  'sueno',
  'frustracion',
];

const COLUMN_LABELS: Record<string, string> = {
  session_id: 'Session ID',
  lead_id: 'Lead ID',
  created_at: 'Fecha',
  updated_at: 'Actualizado',
  first_name: 'Nombre',
  email: 'Email',
  phone: 'WhatsApp',
  status: 'Estado',
  quiz_step: 'Paso quiz',
  source: 'Source',
  completed_at: 'Completado',
  sexo: 'Sexo',
  objetivo: 'Objetivo',
  edad: 'Edad',
  peso: 'Peso (kg)',
  frecuencia: 'Frecuencia',
  tipo: 'Tipo entrenamiento',
  proteina: 'Proteína',
  sueno: 'Sueño',
  frustracion: 'Frustración',
  utm_source: 'UTM source',
  utm_medium: 'UTM medium',
  utm_campaign: 'UTM campaign',
  utm_content: 'UTM content',
  utm_term: 'UTM term',
};

function exportFilename(ext: 'csv' | 'xlsx') {
  const date = new Date().toISOString().slice(0, 10);
  return `caro-fitness-diagnostico-${date}.${ext}`;
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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
  XLSX.writeFile(workbook, exportFilename('xlsx'));
}
