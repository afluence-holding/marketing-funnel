'use client';

import { Fragment, useCallback, useEffect, useState, type CSSProperties } from 'react';

type LeadRow = Record<string, string>;

type LeadsResponse = {
  ok?: boolean;
  total?: number;
  data?: LeadRow[];
  error?: string;
};

const ACTION_COLUMN_STYLE: CSSProperties = {
  position: 'sticky',
  right: 0,
  zIndex: 1,
  minWidth: 96,
  whiteSpace: 'nowrap',
  boxShadow: '-6px 0 12px rgba(45, 20, 4, 0.06)',
};

const DISPLAY_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'created_at', label: 'Fecha' },
  { key: 'first_name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'landing', label: 'Landing' },
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

export default function MamaSinCaosResponsesView() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');

  const loadLeads = useCallback(async (token?: string) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token') ?? '';
      const activeToken = token ?? tokenFromUrl;

      const url = activeToken
        ? `/api/mama-sin-caos/leads?token=${encodeURIComponent(activeToken)}`
        : '/api/mama-sin-caos/leads';

      const res = await fetch(url, { cache: 'no-store' });
      const payload = (await res.json()) as LeadsResponse;

      if (!res.ok) {
        setRows([]);
        setError(payload.error ?? `Error ${res.status}`);
        return;
      }

      setRows(Array.isArray(payload.data) ? payload.data : []);
    } catch (err) {
      setRows([]);
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
        background: '#fcfaf6',
        color: '#1f0d02',
        fontFamily: 'Fraunces, Georgia, serif',
        padding: '32px 20px 64px',
      }}
    >
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              display: 'inline-block',
              fontFamily: 'Nixie One, monospace',
              background: '#8b3a0e',
              color: '#fcfaf6',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Afluence · Mamá Sin Caos
          </p>
          <h1
            style={{
              fontFamily: 'Nixie One, monospace',
              fontSize: 'clamp(28px, 4vw, 40px)',
              marginBottom: 8,
              fontWeight: 400,
            }}
          >
            Lista secreta — respuestas
          </h1>
          <p style={{ color: '#3d1a02', maxWidth: 640, lineHeight: 1.5, fontSize: 17 }}>
            Panel interno para revisar leads capturados desde{' '}
            <code>/afluence/mama-sin-caos/lista-secreta</code>. Los datos se guardan en Supabase
            vía la API y persisten aunque haya redeploys.
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
              background: '#0f0500',
              color: '#fcfaf6',
              border: 'none',
              borderRadius: 999,
              padding: '10px 18px',
              fontFamily: 'Nixie One, monospace',
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
          <span style={{ color: '#3d1a02', fontSize: 15 }}>
            {loading ? 'Cargando…' : `${rows.length} respuesta${rows.length === 1 ? '' : 's'}`}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Token de acceso (si aplica)"
              style={{
                border: '1px solid rgba(45,20,4,0.18)',
                borderRadius: 12,
                padding: '10px 12px',
                minWidth: 220,
                background: '#fff',
                fontFamily: 'Fraunces, Georgia, serif',
              }}
            />
            <button
              type="button"
              onClick={() => void loadLeads(tokenInput)}
              style={{
                background: '#c4862b',
                color: '#fcfaf6',
                border: 'none',
                borderRadius: 999,
                padding: '10px 16px',
                fontFamily: 'Nixie One, monospace',
                fontSize: 12,
                letterSpacing: 1,
                textTransform: 'uppercase',
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
              background: '#f6efe4',
              border: '1px solid #8b3a0e',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              color: '#6a2a08',
            }}
          >
            {error === 'Unauthorized'
              ? 'Acceso no autorizado. Agrega ?token=TU_TOKEN en la URL o usa el campo de token.'
              : error}
          </div>
        ) : null}

        <div
          style={{
            overflowX: 'auto',
            background: '#f6efe4',
            borderRadius: 16,
            boxShadow: '0 30px 60px -34px rgba(45,20,4,.25)',
            border: '1px solid rgba(45,20,4,0.18)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: 720,
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ background: '#ede2cf', textAlign: 'left' }}>
                {DISPLAY_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '10px 12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid rgba(45,20,4,0.18)',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid rgba(45,20,4,0.18)',
                    background: '#ede2cf',
                    fontWeight: 600,
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
                    style={{ padding: 24, textAlign: 'center', color: '#3d1a02' }}
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
                    <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid rgba(45,20,4,0.08)' }}>
                      {DISPLAY_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: '10px 12px',
                            verticalAlign: 'top',
                            maxWidth: col.key === 'email' ? 240 : undefined,
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
                          background: '#f6efe4',
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
                            border: '1px solid #8b3a0e',
                            color: '#8b3a0e',
                            borderRadius: 999,
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontFamily: 'Nixie One, monospace',
                            fontSize: 11,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                          }}
                        >
                          {isExpanded ? 'Ocultar' : 'Ver más'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr style={{ borderBottom: '1px solid rgba(45,20,4,0.08)' }}>
                        <td
                          colSpan={DISPLAY_COLUMNS.length + 1}
                          style={{ padding: '0 14px 16px', background: '#fcfaf6' }}
                        >
                          <div
                            style={{
                              borderRadius: 12,
                              padding: 16,
                              border: '1px solid rgba(45,20,4,0.18)',
                              background: '#fff',
                            }}
                          >
                            <h3
                              style={{
                                fontFamily: 'Nixie One, monospace',
                                fontSize: 16,
                                marginBottom: 12,
                                fontWeight: 400,
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
                                    background: '#fcfaf6',
                                    borderRadius: 10,
                                    padding: 12,
                                    border: '1px solid rgba(45,20,4,0.08)',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontFamily: 'Nixie One, monospace',
                                      letterSpacing: 1,
                                      textTransform: 'uppercase',
                                      color: '#9c6a1f',
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
