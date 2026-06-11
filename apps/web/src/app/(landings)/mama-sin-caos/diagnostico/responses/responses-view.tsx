'use client';

import { Fragment, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

type LeadRow = Record<string, string>;

type LeadsResponse = {
  ok?: boolean;
  total?: number;
  storage?: string;
  data?: LeadRow[];
  error?: string;
  details?: string;
};

type Archetype = {
  name: string;
  short: string;
  emoji: string;
  color: string;
};

// Espejo de las definiciones del quiz (landing.html → RESULTS).
const ARCHETYPES: Record<string, Archetype> = {
  bombera: { name: 'La Mamá Bombera', short: 'Bombera', emoji: '🚒', color: '#C16744' },
  invisible: { name: 'La Mamá Invisible', short: 'Invisible', emoji: '🫥', color: '#7E8B6B' },
  olla: { name: 'La Mamá Olla a Presión', short: 'Olla a Presión', emoji: '🌋', color: '#A8512F' },
  gerente: { name: 'La Mamá Gerente General', short: 'Gerente General', emoji: '📋', color: '#9C6B3C' },
  culpa: { name: 'La Mamá Culpa Crónica', short: 'Culpa Crónica', emoji: '💭', color: '#B0654A' },
  piloto: { name: 'La Mamá Piloto Automático', short: 'Piloto Automático', emoji: '🌫️', color: '#6E7A8B' },
};

const ARCHETYPE_ORDER = ['bombera', 'invisible', 'olla', 'gerente', 'culpa', 'piloto'];

// Brand Mamá Sin Caos (crema / clay / espresso).
const CREAM = '#FAF4EC';
const CARD = '#FFFFFF';
const ESPRESSO = '#3A2A20';
const MUTED = '#9B8B7C';
const CLAY = '#C16744';
const CLAY_DARK = '#A8512F';
const LINE = 'rgba(58,42,32,0.12)';

const ACTION_COLUMN_STYLE: CSSProperties = {
  position: 'sticky',
  right: 0,
  zIndex: 1,
  minWidth: 96,
  whiteSpace: 'nowrap',
  boxShadow: '-6px 0 12px rgba(0, 0, 0, 0.06)',
};

const DISPLAY_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'created_at', label: 'Fecha' },
  { key: 'first_name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'WhatsApp' },
  { key: 'arquetipo', label: 'Arquetipo' },
];

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCell(key: string, value: string) {
  if (key === 'created_at' || key === 'updated_at') return formatDate(value);
  if (!value) return '—';
  return value;
}

function getDetailEntries(row: LeadRow) {
  return Object.entries(row).filter(
    ([key, value]) => value && !DISPLAY_COLUMNS.some((col) => col.key === key),
  );
}

function ArchetypeBadge({ value }: { value: string }) {
  const archetype = ARCHETYPES[value];
  if (!archetype) return <span style={{ color: MUTED }}>—</span>;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: `${archetype.color}1A`,
        color: archetype.color,
        border: `1px solid ${archetype.color}55`,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden>{archetype.emoji}</span>
      {archetype.short}
    </span>
  );
}

export default function MamaSinCaosResponsesView() {
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
      const { downloadLeadsCsv, downloadLeadsXlsx } = await import('@/lib/mama-sin-caos/export-leads');
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
        ? `/api/mama-sin-caos/diagnostico/responses?token=${encodeURIComponent(activeToken)}`
        : '/api/mama-sin-caos/diagnostico/responses';

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

  const archetypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of ARCHETYPE_ORDER) counts[key] = 0;
    for (const row of rows) {
      const key = row.arquetipo;
      if (key && counts[key] !== undefined) counts[key] += 1;
    }
    return counts;
  }, [rows]);

  const withArchetype = rows.filter((row) => row.arquetipo && ARCHETYPES[row.arquetipo]).length;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: CREAM,
        color: ESPRESSO,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: '32px 20px 64px',
      }}
    >
      <div style={{ maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              display: 'inline-block',
              background: CLAY,
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
            Mamá Sin Caos
          </p>
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              marginBottom: 8,
              letterSpacing: -0.5,
              fontWeight: 800,
            }}
          >
            Registros del diagnóstico
          </h1>
          <p style={{ color: MUTED, maxWidth: 680, lineHeight: 1.5 }}>
            Panel interno para revisar registros capturados desde{' '}
            <code>/mama-sin-caos/diagnostico</code>. Incluye contacto, arquetipo de
            supervivencia y distribución por tipo de mamá.
          </p>
        </header>

        {!loading && !error ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: CARD,
                border: `1px solid ${LINE}`,
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: ESPRESSO, marginTop: 4 }}>
                {total ?? rows.length}
              </div>
            </div>
            {ARCHETYPE_ORDER.map((key) => {
              const archetype = ARCHETYPES[key];
              return (
                <div
                  key={key}
                  style={{
                    background: CARD,
                    border: `1px solid ${LINE}`,
                    borderLeft: `4px solid ${archetype.color}`,
                    borderRadius: 14,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: MUTED,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span aria-hidden>{archetype.emoji}</span>
                    {archetype.short}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: archetype.color, marginTop: 4 }}>
                    {archetypeCounts[key] ?? 0}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {!loading && !error && withArchetype === 0 && rows.length > 0 ? (
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 16 }}>
            El arquetipo se registra desde que se activó su captura; los registros
            previos aparecen sin arquetipo.
          </p>
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
              background: CLAY,
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
              background: canExport ? ESPRESSO : '#E7DCCE',
              color: canExport ? CREAM : MUTED,
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
              background: canExport ? CARD : '#E7DCCE',
              color: canExport ? ESPRESSO : MUTED,
              border: `1px solid ${LINE}`,
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 700,
              cursor: canExport && !exporting ? 'pointer' : 'not-allowed',
            }}
          >
            {exporting === 'xlsx' ? 'Exportando…' : 'Excel'}
          </button>
          <span style={{ color: MUTED, fontSize: 14 }}>
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
                border: `1px solid ${LINE}`,
                borderRadius: 10,
                padding: '10px 12px',
                minWidth: 220,
                background: CARD,
                color: ESPRESSO,
              }}
            />
            <button
              type="button"
              onClick={() => void loadLeads(tokenInput)}
              style={{
                background: CARD,
                color: ESPRESSO,
                border: `1px solid ${LINE}`,
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
              background: `${CLAY}1A`,
              border: `1px solid ${CLAY}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              color: ESPRESSO,
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
            background: CARD,
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(58, 42, 32, 0.08)',
            border: `1px solid ${LINE}`,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: 900,
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: '#FBF5EC', textAlign: 'left' }}>
                {DISPLAY_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '10px 12px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      borderBottom: `1px solid ${LINE}`,
                      color: CLAY_DARK,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  style={{
                    padding: '10px 12px',
                    borderBottom: `1px solid ${LINE}`,
                    background: '#FBF5EC',
                    fontWeight: 700,
                    color: CLAY_DARK,
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
                    style={{ padding: 24, textAlign: 'center', color: MUTED }}
                  >
                    Todavía no hay registros guardados.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => {
                const rowId = row.lead_id ?? row.email;
                const isExpanded = expandedId === rowId;
                const detailEntries = isExpanded ? getDetailEntries(row) : [];

                return (
                  <Fragment key={rowId}>
                    <tr style={{ borderBottom: isExpanded ? 'none' : `1px solid ${LINE}` }}>
                      {DISPLAY_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: '10px 12px',
                            verticalAlign: 'top',
                            maxWidth: col.key === 'email' ? 220 : undefined,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {col.key === 'arquetipo' ? (
                            <ArchetypeBadge value={row.arquetipo ?? ''} />
                          ) : (
                            formatCell(col.key, row[col.key] ?? '')
                          )}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: '10px 12px',
                          verticalAlign: 'top',
                          background: CARD,
                          ...ACTION_COLUMN_STYLE,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : rowId)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${CLAY}`,
                            color: CLAY_DARK,
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
                      <tr style={{ borderBottom: `1px solid ${LINE}` }}>
                        <td
                          colSpan={DISPLAY_COLUMNS.length + 1}
                          style={{ padding: '0 14px 16px', background: CREAM }}
                        >
                          <div
                            style={{
                              borderRadius: 12,
                              padding: 16,
                              border: `1px solid ${LINE}`,
                              background: CARD,
                            }}
                          >
                            <h3 style={{ fontSize: 18, marginBottom: 12, fontWeight: 800 }}>
                              Detalle — {row.first_name || row.email || row.lead_id}
                            </h3>
                            {detailEntries.length === 0 ? (
                              <p style={{ color: MUTED }}>Sin campos adicionales.</p>
                            ) : (
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
                                      background: '#FBF5EC',
                                      borderRadius: 10,
                                      padding: 12,
                                      border: `1px solid ${LINE}`,
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        color: MUTED,
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
                            )}
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
