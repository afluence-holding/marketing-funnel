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
  boxShadow: '-6px 0 12px rgba(0, 0, 0, 0.25)',
};

const DISPLAY_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'created_at', label: 'Fecha' },
  { key: 'first_name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'WhatsApp' },
  { key: 'status', label: 'Estado' },
  { key: 'quiz_step', label: 'Paso' },
  { key: 'objetivo', label: 'Objetivo' },
  { key: 'sexo', label: 'Sexo' },
  { key: 'edad', label: 'Edad' },
  { key: 'peso', label: 'Peso' },
  { key: 'frecuencia', label: 'Frecuencia' },
  { key: 'proteina', label: 'Proteína' },
];

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'En progreso',
  abandoned: 'Abandonado',
  completed: 'Completado',
};

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCell(key: string, value: string) {
  if (key === 'created_at' || key === 'updated_at' || key === 'completed_at') {
    return formatDate(value);
  }
  if (key === 'status') return STATUS_LABELS[value] ?? value ?? '—';
  if (!value) return '—';
  return value;
}

function getDetailEntries(row: LeadRow) {
  return Object.entries(row).filter(
    ([key, value]) => value && !DISPLAY_COLUMNS.some((col) => col.key === key),
  );
}

export default function CaroFitnessResponsesView() {
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
      const { downloadLeadsCsv, downloadLeadsXlsx } = await import('@/lib/caro-fitness/export-leads');
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
        ? `/api/caro-fitness/progress?token=${encodeURIComponent(activeToken)}`
        : '/api/caro-fitness/progress';

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

  const completedCount = rows.filter((row) => row.status === 'completed').length;
  const inProgressCount = rows.filter((row) => row.status === 'in_progress').length;
  const abandonedCount = rows.filter((row) => row.status === 'abandoned').length;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#16120f',
        color: '#f4ece2',
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        padding: '32px 20px 64px',
      }}
    >
      <div style={{ maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              display: 'inline-block',
              background: '#c75c34',
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
            Caro Manrique
          </p>
          <h1
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: -0.5,
            }}
          >
            Registros del diagnóstico
          </h1>
          <p style={{ color: '#9a8d7e', maxWidth: 640, lineHeight: 1.5 }}>
            Panel interno para revisar registros capturados desde{' '}
            <code>/caro-fitness/diagnostico</code>. Incluye progreso parcial,
            abandonos y leads completados.
          </p>
        </header>

        {!loading && !error ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              { label: 'Total', value: total ?? rows.length, color: '#f4ece2' },
              { label: 'Completados', value: completedCount, color: '#7dd3a8' },
              { label: 'En progreso', value: inProgressCount, color: '#e07a4d' },
              { label: 'Abandonados', value: abandonedCount, color: '#9a8d7e' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#1f1a16',
                  border: '1px solid rgba(244,236,226,0.12)',
                  borderRadius: 14,
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 11, color: '#9a8d7e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginTop: 4 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

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
              background: '#c75c34',
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
              background: canExport ? '#f4ece2' : '#3a332c',
              color: canExport ? '#16120f' : '#9a8d7e',
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
              background: canExport ? '#262019' : '#3a332c',
              color: canExport ? '#f4ece2' : '#9a8d7e',
              border: '1px solid rgba(244,236,226,0.12)',
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 700,
              cursor: canExport && !exporting ? 'pointer' : 'not-allowed',
            }}
          >
            {exporting === 'xlsx' ? 'Exportando…' : 'Excel'}
          </button>
          <span style={{ color: '#9a8d7e', fontSize: 14 }}>
            {loading
              ? 'Cargando…'
              : `${total ?? rows.length} registro${(total ?? rows.length) === 1 ? '' : 's'}${
                  storage ? ` · ${storage}` : ''
                }`}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Token de acceso (si aplica)"
              style={{
                border: '1px solid rgba(244,236,226,0.12)',
                borderRadius: 10,
                padding: '10px 12px',
                minWidth: 220,
                background: '#1f1a16',
                color: '#f4ece2',
              }}
            />
            <button
              type="button"
              onClick={() => void loadLeads(tokenInput)}
              style={{
                background: '#262019',
                color: '#f4ece2',
                border: '1px solid rgba(244,236,226,0.12)',
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
              background: 'rgba(199,92,52,0.12)',
              border: '1px solid #c75c34',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              color: '#f4ece2',
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

        <div
          style={{
            overflowX: 'auto',
            background: '#1f1a16',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.28)',
            border: '1px solid rgba(244,236,226,0.12)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: 1200,
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: '#262019', textAlign: 'left' }}>
                {DISPLAY_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '10px 12px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid rgba(244,236,226,0.12)',
                      color: '#e07a4d',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid rgba(244,236,226,0.12)',
                    background: '#262019',
                    fontWeight: 700,
                    color: '#e07a4d',
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
                    style={{ padding: 24, textAlign: 'center', color: '#9a8d7e' }}
                  >
                    Todavía no hay registros guardados.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => {
                const rowId = row.session_id ?? row.lead_id ?? row.email;
                const isExpanded = expandedId === rowId;
                const detailEntries = isExpanded ? getDetailEntries(row) : [];

                return (
                  <Fragment key={rowId}>
                    <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid rgba(244,236,226,0.08)' }}>
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
                          background: '#1f1a16',
                          ...ACTION_COLUMN_STYLE,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : rowId)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #c75c34',
                            color: '#e07a4d',
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
                      <tr style={{ borderBottom: '1px solid rgba(244,236,226,0.08)' }}>
                        <td
                          colSpan={DISPLAY_COLUMNS.length + 1}
                          style={{ padding: '0 14px 16px', background: '#16120f' }}
                        >
                          <div
                            style={{
                              borderRadius: 12,
                              padding: 16,
                              border: '1px solid rgba(244,236,226,0.12)',
                              background: '#1f1a16',
                            }}
                          >
                            <h3
                              style={{
                                fontFamily: "'Anton', sans-serif",
                                fontSize: 18,
                                marginBottom: 12,
                                textTransform: 'uppercase',
                              }}
                            >
                              Detalle — {row.first_name || row.email || row.session_id}
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
                                    background: '#262019',
                                    borderRadius: 10,
                                    padding: 12,
                                    border: '1px solid rgba(244,236,226,0.08)',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                      color: '#9a8d7e',
                                      marginBottom: 6,
                                    }}
                                  >
                                    {key.replace(/_/g, ' ')}
                                  </div>
                                  <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                    {formatCell(key, value)}
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
