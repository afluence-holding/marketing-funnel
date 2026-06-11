type LeadRow = Record<string, string>;

const BASE_COLUMN_ORDER = [
  'lead_id',
  'created_at',
  'updated_at',
  'first_name',
  'email',
  'phone',
  'arquetipo',
  'source',
];

const COLUMN_LABELS: Record<string, string> = {
  lead_id: 'Lead ID',
  created_at: 'Fecha',
  updated_at: 'Actualizado',
  first_name: 'Nombre',
  email: 'Email',
  phone: 'WhatsApp',
  arquetipo: 'Arquetipo',
  source: 'Source',
  utm_source: 'UTM source',
  utm_medium: 'UTM medium',
  utm_campaign: 'UTM campaign',
  utm_content: 'UTM content',
  utm_term: 'UTM term',
};

function exportFilename(ext: 'csv' | 'xlsx') {
  const date = new Date().toISOString().slice(0, 10);
  return `mama-sin-caos-diagnostico-${date}.${ext}`;
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
