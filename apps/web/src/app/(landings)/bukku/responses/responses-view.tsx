'use client';

import { Fragment, useCallback, useEffect, useState, type CSSProperties } from 'react';

type LeadRow = Record<string, string>;

type LeadsResponse = {
  ok?: boolean;
  total?: number;
  storage?: string;
  data?: LeadRow[];
  error?: string;
  details?: string;
};

const ACTION_COLUMN_STYLE: CSSProperties = {
  position: 'sticky',
  right: 0,
  zIndex: 1,
  minWidth: 96,
  whiteSpace: 'nowrap',
  boxShadow: '-6px 0 12px rgba(45, 36, 56, 0.06)',
};

const DISPLAY_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'created_at', label: 'Fecha' },
  { key: 'first_name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'WhatsApp' },
  { key: 'nivel_ingles_autorreportado', label: 'Nivel (autorreportado)' },
  { key: 'test_level', label: 'Nivel test' },
  { key: 'test_cefr', label: 'CEFR' },
  { key: 'test_total', label: 'Puntaje' },
  { key: 'aviso_lanzamiento', label: 'Quiere aviso' },
  { key: 'guide_level', label: 'Guía descargada' },
];

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCell(key: string, value: string) {
  if (key === 'created_at') return formatDate(value);
  if (!value) return '—';
  return value;
}

function getDetailEntries(row: LeadRow) {
  return Object.entries(row).filter(
    ([key, value]) => value && !DISPLAY_COLUMNS.some((col) => col.key === key),
  );
}

export default function BukkuResponsesView() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [storage, setStorage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);

  const canExport = !loading && !error && rows.length > 0;

  async function handleExport(format: 'csv' | 'xlsx') {
    if (!canExport || exporting) return;
    setExporting(format);
    try {
      const { downloadLeadsCsv, downloadLeadsXlsx } = await import('@/lib/bukku/export-leads');
      if (format === 'csv') {
        downloadLeadsCsv(rows);
      } else {
        await downloadLeadsXlsx(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar');
    } finally {
      setExporting(null);
    }
  }

  const loadLeads = useCallback(async (token?: string) => {
    setLoading(true);
    setError('');
    setErrorDetails('');

    try {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token') ?? '';
      const activeToken = token ?? tokenFromUrl;

      const url = activeToken
        ? `/api/bukku/leads?token=${encodeURIComponent(activeToken)}`
        : '/api/bukku/leads';

      const res = await fetch(url, { cache: 'no-store' });
      const payload = (await res.json()) as LeadsResponse;

      if (!res.ok) {
        setRows([]);
        setTotal(null);
        setStorage('');
        setError(payload.error ?? `Error ${res.status}`);
        setErrorDetails(payload.details ?? '');
        return;
      }

      const data = Array.isArray(payload.data) ? payload.data : [];
      setRows(data);
      setTotal(typeof payload.total === 'number' ? payload.total : data.length);
      setStorage(payload.storage ?? '');
    } catch (err) {
      setRows([]);
      setTotal(null);
      setStorage('');
      setError(err instanceof Error ? err.message : 'No se pudo cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#FFFBF5',
        color: '#2D2438',
        fontFamily: 'Nunito, system-ui, sans-serif',
        padding: '32px 20px 64px',
      }}
    >
      <div style={{ maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              display: 'inline-block',
              background: '#F27A95',
              color: 'white',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Bukku Education
          </p>
          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
              marginBottom: 8,
            }}
          >
            Respuestas del test de inglés
          </h1>
          <p style={{ color: '#8B6F8B', maxWidth: 640, lineHeight: 1.5 }}>
            Panel interno para revisar leads capturados desde la landing{' '}
            <code>/bukku</code>. Los datos se guardan en Supabase vía la API
            y persisten aunque haya redeploys.
          </p>
        </header>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => void loadLeads()}
            style={{
              background: '#316B9D',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
          <button
            type="button"
            disabled={!canExport || exporting !== null}
            onClick={() => void handleExport('csv')}
            style={{
              background: canExport ? '#2D2438' : '#C4B8C4',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 700,
              cursor: canExport && !exporting ? 'pointer' : 'not-allowed',
            }}
          >
            {exporting === 'csv' ? 'Exportando…' : 'CSV'}
          </button>
          <button
            type="button"
            disabled={!canExport || exporting !== null}
            onClick={() => void handleExport('xlsx')}
            style={{
              background: canExport ? '#0DAA65' : '#A8DCC4',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 700,
              cursor: canExport && !exporting ? 'pointer' : 'not-allowed',
            }}
          >
            {exporting === 'xlsx' ? 'Exportando…' : 'Excel'}
          </button>
          <span style={{ color: '#8B6F8B', fontSize: 14 }}>
            {loading
              ? 'Cargando…'
              : `${total ?? rows.length} respuesta${(total ?? rows.length) === 1 ? '' : 's'}${
                  storage ? ` · ${storage}` : ''
                }`}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Token de acceso (si aplica)"
              style={{
                border: '1px solid #E8DAC0',
                borderRadius: 10,
                padding: '10px 12px',
                minWidth: 220,
                background: 'white',
              }}
            />
            <button
              type="button"
              onClick={() => void loadLeads(tokenInput)}
              style={{
                background: '#0DAA65',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Acceder
            </button>
          </div>
        </div>

        {error ? (
          <div
            style={{
              background: '#FFF0F3',
              border: '1px solid #F27A95',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              color: '#8B2347',
            }}
          >
            {error === 'Unauthorized'
              ? 'Acceso no autorizado. Agrega ?token=TU_TOKEN en la URL o usa el campo de token.'
              : error}
            {errorDetails ? (
              <p style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>{errorDetails}</p>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && storage && storage !== 'supabase' ? (
          <div
            style={{
              background: '#FFF8E8',
              border: '1px solid #E8DAC0',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              color: '#6A4A12',
            }}
          >
            Los datos vienen de <code>{storage}</code>, no de Supabase. Puede no coincidir con la
            base de datos.
          </div>
        ) : null}

        <div
          style={{
            overflowX: 'auto',
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(45, 36, 56, 0.08)',
            border: '1px solid #F2E8D5',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: 1100,
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: '#FFF6E8', textAlign: 'left' }}>
                {DISPLAY_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '10px 12px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid #F2E8D5',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #F2E8D5',
                    background: '#FFF6E8',
                    fontWeight: 700,
                    ...ACTION_COLUMN_STYLE,
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={DISPLAY_COLUMNS.length + 1}
                    style={{ padding: 24, textAlign: 'center', color: '#8B6F8B' }}
                  >
                    Todavía no hay respuestas guardadas.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => {
                const isExpanded = expandedId === row.lead_id;
                const detailEntries = isExpanded ? getDetailEntries(row) : [];

                return (
                  <Fragment key={row.lead_id}>
                    <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid #F7F0E4' }}>
                      {DISPLAY_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: '10px 12px',
                            verticalAlign: 'top',
                            maxWidth: col.key === 'email' ? 200 : undefined,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {formatCell(col.key, row[col.key] ?? '')}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: '10px 12px',
                          verticalAlign: 'top',
                          background: 'white',
                          ...ACTION_COLUMN_STYLE,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : (row.lead_id ?? null))
                          }
                          style={{
                            background: 'transparent',
                            border: '1px solid #316B9D',
                            color: '#316B9D',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          {isExpanded ? 'Ocultar' : 'Ver más'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr style={{ borderBottom: '1px solid #F7F0E4' }}>
                        <td
                          colSpan={DISPLAY_COLUMNS.length + 1}
                          style={{ padding: '0 14px 16px', background: '#FFFBF5' }}
                        >
                          <div
                            style={{
                              borderRadius: 12,
                              padding: 16,
                              border: '1px solid #F2E8D5',
                              background: 'white',
                            }}
                          >
                            <h3
                              style={{
                                fontFamily: 'Fraunces, Georgia, serif',
                                fontSize: 18,
                                marginBottom: 12,
                              }}
                            >
                              Detalle — {row.first_name || row.email}
                            </h3>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: 12,
                              }}
                            >
                              {detailEntries.map(([key, value]) => (
                                <div
                                  key={key}
                                  style={{
                                    background: '#FFFBF5',
                                    borderRadius: 10,
                                    padding: 12,
                                    border: '1px solid #F7F0E4',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                      color: '#8B6F8B',
                                      marginBottom: 6,
                                    }}
                                  >
                                    {key.replace(/_/g, ' ')}
                                  </div>
                                  <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                    {value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
