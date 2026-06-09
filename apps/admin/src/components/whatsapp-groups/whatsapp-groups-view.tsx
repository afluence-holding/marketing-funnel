'use client';

import { type CSSProperties, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BuSelector } from '@/components/bu-selector';
import { WhatsAppGroupsSidebar } from '@/components/whatsapp-groups/whatsapp-groups-sidebar';
import { adminModuleLinks } from '@/lib/launch-ops/navigation';
import {
  createPoolAction,
  updatePoolAction,
  deletePoolAction,
  createGroupAction,
  updateGroupAction,
  deleteGroupAction,
} from '@/app/[organizer]/[bu]/whatsapp-groups/actions';
import { ROTATION_MODES, ROTATION_MODE_LABELS, type RotationMode } from '@/lib/whatsapp-groups/types';
import type { CohortOption, WaGroup, WaGroupsOverview, WaPool } from '@/lib/whatsapp-groups/types';
import type { BuOption } from '@/lib/dashboard/bu-options';

const fieldStyle: CSSProperties = {
  fontSize: '0.78rem',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  padding: '6px 8px',
  background: 'var(--color-bg-card)',
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  width: '100%',
};
const selStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  padding: '6px 8px',
  background: 'var(--color-bg-card)',
  color: 'var(--color-text-primary)',
};
const btnPrimary: CSSProperties = {
  padding: '8px 16px',
  fontSize: '0.8rem',
  fontWeight: 700,
  borderRadius: 8,
  cursor: 'pointer',
  border: 'none',
  background: 'var(--color-accent)',
  color: '#fff',
};
const btnGhost: CSSProperties = {
  padding: '6px 12px',
  fontSize: '0.76rem',
  fontWeight: 700,
  borderRadius: 8,
  cursor: 'pointer',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text-primary)',
};

const ERR_LABELS: Record<string, string> = {
  unauthenticated: 'Sesión expirada, recargá la página.',
  forbidden: 'No tenés permiso para administrar grupos.',
  invalid_invite_url: 'El link debe ser https://chat.whatsapp.com/…',
  invalid_pool_key: 'Identificador inválido (usá letras, números, - o _).',
  missing_label: 'Falta el nombre.',
  invalid_capacity: 'Capacidad inválida.',
  invalid_position: 'Posición inválida.',
  pool_has_assignments: 'No se puede eliminar: el pool ya tiene registros asignados.',
  group_has_assignments: 'No se puede eliminar: el grupo ya tiene registros. Desactivalo en su lugar.',
  duplicate: 'Ya existe un pool/grupo con esos datos.',
  save_failed: 'No se pudo guardar. Reintentá.',
};
const errLabel = (code: string) => ERR_LABELS[code] ?? ERR_LABELS.save_failed;

export function WhatsAppGroupsView({
  overview,
  buOptions,
  currentPath,
  organizer,
  bu,
  canManage,
}: {
  overview: WaGroupsOverview;
  buOptions: BuOption[];
  currentPath: string;
  organizer: string;
  bu: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const [activeId, setActiveId] = useState(overview.pools[0]?.id ?? '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingPool, setCreatingPool] = useState(false);

  const active = overview.pools.find((p) => p.id === activeId) ?? overview.pools[0];
  const moduleLinks = useMemo(() => adminModuleLinks(organizer, bu, 'whatsapp-groups'), [organizer, bu]);

  return (
    <div className="section centro-theme">
      <div className="launch-shell">
        <WhatsAppGroupsSidebar
          brand="Grupos WhatsApp"
          subtitle={`${organizer} · ${bu}`}
          moduleLinks={moduleLinks}
          pools={overview.pools.map((p) => ({
            id: p.id,
            label: p.label || p.poolKey,
            groupCount: p.groups.length,
          }))}
          activePoolId={creatingPool ? '' : active?.id ?? ''}
          onSelectPool={(id) => {
            setActiveId(id);
            setCreatingPool(false);
          }}
          onNewPool={() => setCreatingPool(true)}
          canManage={canManage}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <div className="launch-main">
          <button
            type="button"
            className="launch-sb-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú de pools"
          >
            ☰ Pools
          </button>

          <div className="report-header" style={{ marginBottom: 16 }}>
            <div>
              <h1>Grupos de WhatsApp</h1>
              <div style={{ marginTop: 4, color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
                Administra los pools de rotación y los links de invitación por BU y cohorte.
              </div>
            </div>
            <BuSelector options={buOptions} currentPath={currentPath} />
          </div>

          {!canManage && (
            <div className="card card-alert card-alert-yellow" style={{ marginBottom: 12 }}>
              <span>
                Estás viendo en modo lectura. Solo administradores pueden crear o editar grupos.
              </span>
            </div>
          )}

          {creatingPool ? (
            <CreatePoolForm
              organizer={organizer}
              bu={bu}
              cohorts={overview.cohorts}
              onDone={() => {
                setCreatingPool(false);
                refresh();
              }}
              onCancel={() => setCreatingPool(false)}
            />
          ) : !active ? (
            <div className="card">
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                No hay pools configurados para <b>{organizer}/{bu}</b>.
                {canManage ? ' Creá el primero con “Nuevo pool”.' : ''}
              </p>
            </div>
          ) : (
            <>
              <PoolConfigCard
                pool={active}
                cohorts={overview.cohorts}
                canManage={canManage}
                onChanged={refresh}
              />
              <GroupsTable pool={active} canManage={canManage} onChanged={refresh} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ pool }: { pool: WaPool }) {
  const activeGroups = pool.groups.filter((g) => g.isActive && !g.isFull).length;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <span className="badge badge-accent">{pool.groups.length} grupos</span>
      <span className="badge badge-gray">{pool.assignedTotal} asignados</span>
      <span className={`badge ${activeGroups > 0 ? 'badge-green' : 'badge-red'}`}>
        {activeGroups > 0 ? `${activeGroups} con cupo` : 'sin cupo'}
      </span>
    </div>
  );
}

function PoolConfigCard({
  pool,
  cohorts,
  canManage,
  onChanged,
}: {
  pool: WaPool;
  cohorts: CohortOption[];
  canManage: boolean;
  onChanged: () => void;
}) {
  const [label, setLabel] = useState(pool.label);
  const [launchCode, setLaunchCode] = useState(pool.launchCode ?? '');
  const [capacity, setCapacity] = useState(String(pool.capacity));
  const [rotationMode, setRotationMode] = useState<RotationMode>(pool.rotationMode);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function save() {
    setErr(null);
    setMsg(null);
    start(async () => {
      const res = await updatePoolAction({
        poolId: pool.id,
        label,
        launchCode: launchCode || null,
        capacity: Number(capacity),
        rotationMode,
      });
      if (!res.ok) {
        setErr(errLabel(res.error));
        return;
      }
      setMsg('Guardado ✓');
      onChanged();
    });
  }

  function removePool() {
    if (!confirm(`¿Eliminar el pool “${pool.label || pool.poolKey}”? Solo se permite si no tiene registros.`)) return;
    setErr(null);
    start(async () => {
      const res = await deletePoolAction({ poolId: pool.id });
      if (!res.ok) {
        setErr(errLabel(res.error));
        return;
      }
      onChanged();
    });
  }

  return (
    <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--color-accent)', opacity: pending ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{pool.label || pool.poolKey}</div>
          <code style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{pool.poolKey}</code>
        </div>
        <StatusPill pool={pool} />
      </div>

      {canManage ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Nombre
              <input value={label} onChange={(e) => setLabel(e.target.value)} style={fieldStyle} />
            </label>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Cohorte
              <select value={launchCode} onChange={(e) => setLaunchCode(e.target.value)} style={{ ...selStyle, width: '100%' }}>
                <option value="">— Sin cohorte —</option>
                {cohorts.map((c) => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Capacidad por grupo
              <input value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" min={1} style={fieldStyle} />
            </label>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Rotación
              <select value={rotationMode} onChange={(e) => setRotationMode(e.target.value as RotationMode)} style={{ ...selStyle, width: '100%' }}>
                {ROTATION_MODES.map((r) => <option key={r} value={r}>{ROTATION_MODE_LABELS[r]}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" disabled={pending} onClick={save} style={btnPrimary}>
              {pending ? 'Guardando…' : 'Guardar pool'}
            </button>
            <button type="button" disabled={pending} onClick={removePool} style={{ ...btnGhost, color: 'var(--color-critical)' }}>
              Eliminar pool
            </button>
            {msg && <span style={{ color: 'var(--color-success)', fontSize: '0.76rem' }}>{msg}</span>}
            {err && <span style={{ color: 'var(--color-critical)', fontSize: '0.76rem' }}>{err}</span>}
          </div>
        </>
      ) : (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          Cohorte: <b>{pool.launchCode ?? '—'}</b> · Capacidad: <b>{pool.capacity}</b> · Rotación:{' '}
          <b>{ROTATION_MODE_LABELS[pool.rotationMode]}</b>
        </div>
      )}
    </div>
  );
}

function GroupsTable({ pool, canManage, onChanged }: { pool: WaPool; canManage: boolean; onChanged: () => void }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Grupos del pool</div>
      </div>

      {pool.groups.length === 0 ? (
        <p style={{ margin: '0 0 12px', color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
          Este pool no tiene grupos. {canManage ? 'Agregá el primero abajo.' : ''}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '6px 8px' }}>#</th>
                <th style={{ padding: '6px 8px' }}>Grupo</th>
                <th style={{ padding: '6px 8px' }}>Link de invitación</th>
                <th style={{ padding: '6px 8px' }}>Asignados</th>
                <th style={{ padding: '6px 8px' }}>Estado</th>
                {canManage && <th style={{ padding: '6px 8px' }} />}
              </tr>
            </thead>
            <tbody>
              {pool.groups.map((g) => (
                <GroupRow key={g.id} group={g} capacity={pool.capacity} canManage={canManage} onChanged={onChanged} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage && <AddGroupForm pool={pool} onChanged={onChanged} />}
    </div>
  );
}

function GroupRow({
  group,
  capacity,
  canManage,
  onChanged,
}: {
  group: WaGroup;
  capacity: number;
  canManage: boolean;
  onChanged: () => void;
}) {
  const [label, setLabel] = useState(group.label);
  const [inviteUrl, setInviteUrl] = useState(group.inviteUrl);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const dirty = label !== group.label || inviteUrl !== group.inviteUrl;
  const pct = capacity > 0 ? Math.min(100, Math.round((group.assignedCount / capacity) * 100)) : 0;

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setErr(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        setErr(errLabel(res.error));
        return;
      }
      onChanged();
    });
  }

  return (
    <tr style={{ borderTop: '1px solid var(--color-border)', opacity: pending ? 0.6 : 1 }}>
      <td style={{ padding: '8px', fontWeight: 700 }}>{group.position}</td>
      <td style={{ padding: '8px', minWidth: 120 }}>
        {canManage ? (
          <input value={label} onChange={(e) => setLabel(e.target.value)} style={fieldStyle} />
        ) : (
          group.label
        )}
      </td>
      <td style={{ padding: '8px', minWidth: 220 }}>
        {canManage ? (
          <input value={inviteUrl} onChange={(e) => setInviteUrl(e.target.value)} style={fieldStyle} />
        ) : (
          <a href={group.inviteUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>
            {group.inviteUrl}
          </a>
        )}
        {err && <div style={{ color: 'var(--color-critical)', fontSize: '0.72rem', marginTop: 4 }}>{err}</div>}
      </td>
      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
        <div>{group.assignedCount} / {capacity}</div>
        <div style={{ height: 5, background: 'var(--color-border)', borderRadius: 999, marginTop: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-accent)' }} />
        </div>
      </td>
      <td style={{ padding: '8px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className={`badge ${group.isFull ? 'badge-red' : 'badge-green'}`}>{group.isFull ? 'lleno' : 'con cupo'}</span>
          {!group.isActive && <span className="badge badge-gray">inactivo</span>}
        </div>
      </td>
      {canManage && (
        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {dirty && (
              <button type="button" style={btnPrimary} disabled={pending}
                onClick={() => run(() => updateGroupAction({ groupId: group.id, label, inviteUrl }))}>
                Guardar
              </button>
            )}
            <button type="button" style={btnGhost} disabled={pending}
              onClick={() => run(() => updateGroupAction({ groupId: group.id, isFull: !group.isFull }))}>
              {group.isFull ? 'Reabrir' : 'Marcar lleno'}
            </button>
            <button type="button" style={btnGhost} disabled={pending}
              onClick={() => run(() => updateGroupAction({ groupId: group.id, isActive: !group.isActive }))}>
              {group.isActive ? 'Desactivar' : 'Activar'}
            </button>
            <button type="button" style={{ ...btnGhost, color: 'var(--color-critical)' }} disabled={pending}
              onClick={() => {
                if (!confirm(`¿Eliminar ${group.label}?`)) return;
                run(() => deleteGroupAction({ groupId: group.id }));
              }}>
              Eliminar
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

function AddGroupForm({ pool, onChanged }: { pool: WaPool; onChanged: () => void }) {
  const [label, setLabel] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setErr(null);
    start(async () => {
      const res = await createGroupAction({ poolId: pool.id, label: label || undefined, inviteUrl });
      if (!res.ok) {
        setErr(errLabel(res.error));
        return;
      }
      setLabel('');
      setInviteUrl('');
      onChanged();
    });
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
      <div style={{ fontWeight: 700, fontSize: '0.78rem', marginBottom: 8 }}>Agregar grupo</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', flex: '0 0 140px' }}>Nombre (opcional)
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`Grupo ${pool.groups.length + 1}`} style={fieldStyle} />
        </label>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', flex: '1 1 260px' }}>Link de invitación
          <input value={inviteUrl} onChange={(e) => setInviteUrl(e.target.value)} placeholder="https://chat.whatsapp.com/…" style={fieldStyle} />
        </label>
        <button type="button" disabled={pending || !inviteUrl} onClick={submit} style={{ ...btnPrimary, opacity: pending || !inviteUrl ? 0.6 : 1 }}>
          {pending ? 'Agregando…' : 'Agregar'}
        </button>
      </div>
      {err && <div style={{ color: 'var(--color-critical)', fontSize: '0.76rem', marginTop: 8 }}>{err}</div>}
    </div>
  );
}

function CreatePoolForm({
  organizer,
  bu,
  cohorts,
  onDone,
  onCancel,
}: {
  organizer: string;
  bu: string;
  cohorts: CohortOption[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [poolKey, setPoolKey] = useState('');
  const [label, setLabel] = useState('');
  const [launchCode, setLaunchCode] = useState('');
  const [capacity, setCapacity] = useState('500');
  const [rotationMode, setRotationMode] = useState<RotationMode>('auto_count');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setErr(null);
    start(async () => {
      const res = await createPoolAction({
        organizer,
        bu,
        poolKey,
        label,
        launchCode: launchCode || null,
        capacity: Number(capacity),
        rotationMode,
      });
      if (!res.ok) {
        setErr(errLabel(res.error));
        return;
      }
      onDone();
    });
  }

  return (
    <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--color-accent)' }}>
      <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 12 }}>Nuevo pool</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Identificador (pool_key)
          <input value={poolKey} onChange={(e) => setPoolKey(e.target.value)} placeholder="webinar-2026-07-01" style={fieldStyle} />
        </label>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Nombre
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Webinar · 1 jul" style={fieldStyle} />
        </label>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Cohorte
          <select value={launchCode} onChange={(e) => setLaunchCode(e.target.value)} style={{ ...selStyle, width: '100%' }}>
            <option value="">— Sin cohorte —</option>
            {cohorts.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
          </select>
        </label>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Capacidad por grupo
          <input value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" min={1} style={fieldStyle} />
        </label>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Rotación
          <select value={rotationMode} onChange={(e) => setRotationMode(e.target.value as RotationMode)} style={{ ...selStyle, width: '100%' }}>
            {ROTATION_MODES.map((r) => <option key={r} value={r}>{ROTATION_MODE_LABELS[r]}</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <button type="button" disabled={pending || !poolKey || !label} onClick={submit} style={{ ...btnPrimary, opacity: pending || !poolKey || !label ? 0.6 : 1 }}>
          {pending ? 'Creando…' : 'Crear pool'}
        </button>
        <button type="button" disabled={pending} onClick={onCancel} style={btnGhost}>Cancelar</button>
        {err && <span style={{ color: 'var(--color-critical)', fontSize: '0.76rem' }}>{err}</span>}
      </div>
    </div>
  );
}
