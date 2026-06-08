'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LaunchRealtime } from '@/components/launch-ops/realtime';
import {
  updateKpiAction,
  updateResourceAction,
  updateTaskStatusAction,
} from '@/app/[organizer]/[bu]/launch/actions';
import {
  OWNER_LABELS,
  STATUS_LABELS,
  WORKSTREAM_LABELS,
  type Kpi,
  type LaunchOverview,
  type Resource,
  type Task,
  type TaskStatus,
  type Workstream,
} from '@/lib/launch-ops/types';

const TABS = ['Resumen', 'Gantt', 'Tareas', 'KPIs', 'Enlaces'] as const;
type Tab = (typeof TABS)[number];

const WS_COLOR: Record<Workstream, string> = {
  organico: 'var(--color-success)',
  inorganico: '#8b5cf6',
  infra: 'var(--color-text-secondary)',
};
const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: 'var(--color-text-secondary)',
  doing: 'var(--color-accent)',
  blocked: 'var(--color-critical)',
  done: 'var(--color-success)',
};

function ownerLabel(key: string): string {
  return OWNER_LABELS[key] ?? key;
}

export function LaunchOpsView({ overview }: { overview: LaunchOverview }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('Resumen');
  const refresh = () => router.refresh();

  return (
    <div className="section">
      <LaunchRealtime launchId={overview.launch.id} onChange={refresh} />

      <div className="report-header" style={{ marginBottom: 16 }}>
        <div>
          <h1>{overview.launch.name}</h1>
          <div style={{ marginTop: 4 }}>
            <span className="date-label">{overview.launch.code}</span>{' '}
            <span className="badge badge-blue">{overview.launch.status}</span>
          </div>
        </div>
        <OverallProgress pct={overview.progress.overallPct} done={overview.progress.doneTasks} total={overview.progress.totalTasks} />
      </div>

      <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '7px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 8,
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              background: tab === t ? 'var(--color-text-primary)' : 'var(--color-bg-card)',
              color: tab === t ? '#0a0a1a' : 'var(--color-text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Resumen' && <ResumenPane overview={overview} />}
      {tab === 'Gantt' && <GanttPane overview={overview} />}
      {tab === 'Tareas' && <TareasPane overview={overview} onChanged={refresh} />}
      {tab === 'KPIs' && <KpisPane overview={overview} onChanged={refresh} />}
      {tab === 'Enlaces' && <EnlacesPane overview={overview} onChanged={refresh} />}
    </div>
  );
}

function OverallProgress({ pct, done, total }: { pct: number; done: number; total: number }) {
  return (
    <div style={{ minWidth: 220 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Avance operativo</span>
        <b style={{ color: 'var(--color-accent)' }}>{pct}%</b>
      </div>
      <div className="pacing-bar">
        <div className="pacing-fill" style={{ width: `${pct}%`, background: 'var(--color-accent)' }} />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
        {done}/{total} tareas
      </div>
    </div>
  );
}

// ---------- Resumen ----------
function ResumenPane({ overview }: { overview: LaunchOverview }) {
  const cfg = overview.launch.config as Record<string, any>;
  const wsCounts = useMemo(() => {
    const m: Record<string, number> = { organico: 0, inorganico: 0, infra: 0 };
    overview.tasks.forEach((t) => { if (t.workstream) m[t.workstream] += 1; });
    return m;
  }, [overview.tasks]);

  return (
    <>
      <div className="card" style={{ borderLeft: '4px solid var(--color-accent)', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          Tesis {cfg.thesis_target_usd ? `+$${(cfg.thesis_target_usd / 1000).toFixed(0)}K` : ''}
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Escalera {Array.isArray(cfg.price_ladder) ? cfg.price_ladder.join(' → ') : ''} (prom. ${cfg.avg_price_usd}) +
          upsell HT ${cfg.upsell_ht_usd}. Cuello de botella = registros + show-up.
        </p>
      </div>

      <div className="section-title">Avance por fase</div>
      <div className="card" style={{ marginBottom: 16 }}>
        {overview.progress.byPhase.map((p) => {
          const phase = overview.phases.find((x) => x.code === p.phaseCode);
          return (
            <div key={p.phaseCode} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{phase?.name ?? p.phaseCode}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{p.done}/{p.total}</span>
              </div>
              <div className="phase-bar">
                <div className="phase-fill" style={{ width: `${p.pct}%`, background: 'var(--color-accent)' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title">Workstreams</div>
      <div className="kpi-grid">
        {(['organico', 'inorganico', 'infra'] as Workstream[]).map((ws) => (
          <div className="card" key={ws}>
            <div className="kpi-label">{WORKSTREAM_LABELS[ws]}</div>
            <div className="kpi-value" style={{ color: WS_COLOR[ws] }}>{wsCounts[ws]}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- Gantt (progress timeline by phase) ----------
function GanttPane({ overview }: { overview: LaunchOverview }) {
  const cfg = overview.launch.config as Record<string, any>;
  const dates = (cfg.dates ?? {}) as Record<string, unknown>;
  return (
    <>
      <div className="section-title">Hitos</div>
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(dates).map(([k, v]) => (
          <span key={k} className="badge badge-gray">
            {k}: {Array.isArray(v) ? (v as string[]).join('→') : String(v)}
          </span>
        ))}
      </div>

      <div className="section-title">Fases</div>
      <div className="card">
        {overview.progress.byPhase.map((p) => {
          const phase = overview.phases.find((x) => x.code === p.phaseCode);
          const tasks = overview.tasks.filter((t) => t.phaseCode === p.phaseCode);
          const starts = tasks.map((t) => t.dueStart).filter(Boolean).sort();
          const ends = tasks.map((t) => t.dueEnd).filter(Boolean).sort();
          const range = starts.length ? `${starts[0]} → ${ends[ends.length - 1] ?? starts[0]}` : '—';
          return (
            <div
              key={p.phaseCode}
              style={{ display: 'grid', gridTemplateColumns: '210px 1fr 70px', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{phase?.name ?? p.phaseCode}</div>
              <div className="phase-bar">
                <div className="phase-fill" style={{ width: `${p.pct}%`, background: 'var(--color-accent)' }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>{range}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------- Tareas ----------
function TareasPane({ overview, onChanged }: { overview: LaunchOverview; onChanged: () => void }) {
  const [ws, setWs] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [channel, setChannel] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const channels = useMemo(
    () => [...new Set(overview.tasks.map((t) => t.channel).filter(Boolean) as string[])].sort(),
    [overview.tasks],
  );
  const owners = useMemo(
    () => [...new Set(overview.tasks.flatMap((t) => t.owners.map((o) => o.ownerKey)))].sort(),
    [overview.tasks],
  );

  const filtered = overview.tasks.filter((t) => {
    if (ws && t.workstream !== ws) return false;
    if (owner && !t.owners.some((o) => o.ownerKey === owner)) return false;
    if (channel && t.channel !== channel) return false;
    if (status && t.status !== status) return false;
    return true;
  });

  const selectStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    padding: '5px 8px',
    background: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
  } as const;

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <FilterPills value={ws} onChange={setWs} options={[
          { v: '', label: 'Todas' },
          { v: 'organico', label: 'Orgánico' },
          { v: 'inorganico', label: 'Inorgánico' },
          { v: 'infra', label: 'Infra' },
        ]} />
        <select style={selectStyle} value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">Todos los owners</option>
          {owners.map((o) => <option key={o} value={o}>{ownerLabel(o)}</option>)}
        </select>
        <select style={selectStyle} value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="">Todos los canales</option>
          {channels.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={selectStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {overview.phases.map((phase) => {
        const tasks = filtered.filter((t) => t.phaseCode === phase.code);
        if (!tasks.length) return null;
        return (
          <div key={phase.code} style={{ marginBottom: 16 }}>
            <div className="section-title">{phase.name}</div>
            {tasks.map((t) => <TaskCard key={t.id} task={t} onChanged={onChanged} />)}
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="card"><p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Sin tareas para este filtro.</p></div>
      )}
    </>
  );
}

function FilterPills({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            style={{
              padding: '5px 11px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: 999,
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              background: active ? 'var(--color-text-primary)' : 'var(--color-bg-card)',
              color: active ? '#0a0a1a' : 'var(--color-text-secondary)',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function TaskCard({ task, onChanged }: { task: Task; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function setStatus(next: TaskStatus) {
    setErr(null);
    start(async () => {
      const res = await updateTaskStatusAction({
        taskId: task.id,
        status: next,
        progressPct: next === 'done' ? 100 : task.progressPct,
        expectedVersion: task.version,
      });
      if (!res.ok) {
        setErr(res.error === 'version_conflict' ? 'Otro usuario actualizó esta tarea. Refrescá.' : 'Error al actualizar.');
      }
      onChanged();
    });
  }

  return (
    <div className="card" style={{ marginBottom: 8, opacity: pending ? 0.6 : 1 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: 2 }}>#{task.sourceIndex}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={() => setOpen((o) => !o)}
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
              color: task.status === 'done' ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            }}
          >
            {task.title}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
            {task.workstream && (
              <span className="badge" style={{ background: 'transparent', border: `1px solid ${WS_COLOR[task.workstream]}`, color: WS_COLOR[task.workstream] }}>
                {WORKSTREAM_LABELS[task.workstream]}
              </span>
            )}
            {task.channel && <span className="badge badge-gray">{task.channel}</span>}
            {task.owners.map((o) => <span key={o.ownerKey} className="badge badge-blue">{ownerLabel(o.ownerKey)}</span>)}
            {task.dueLabel && <span className="badge badge-orange">{task.dueLabel}</span>}
            {task.dependencies.length > 0 && (
              <span className="badge badge-gray">
                dep: {task.dependencies.map((d) => (d.dependsOnSourceIndex ? `#${d.dependsOnSourceIndex}` : d.note)).join(', ')}
              </span>
            )}
          </div>
        </div>
        <select
          value={task.status}
          disabled={pending}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            border: `1px solid ${STATUS_COLOR[task.status]}`,
            color: STATUS_COLOR[task.status],
            borderRadius: 6,
            padding: '4px 6px',
            background: 'var(--color-bg-card)',
          }}
        >
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {err && <div style={{ color: 'var(--color-critical)', fontSize: '0.72rem', marginTop: 6 }}>{err}</div>}

      {open && (
        <div style={{ paddingLeft: 28, marginTop: 10, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
          {task.objective && <p style={{ marginTop: 0 }}>{task.objective}</p>}
          {task.steps.length > 0 && (
            <>
              <div className="kpi-label" style={{ marginBottom: 4 }}>Pasos</div>
              <ul style={{ margin: '0 0 8px', paddingLeft: 16 }}>
                {task.steps.map((s) => <li key={s.id} style={{ margin: '3px 0' }}>{s.body}</li>)}
              </ul>
            </>
          )}
          {task.definitionOfDone && (
            <div className="card-alert card-alert-green" style={{ borderRadius: 8 }}>
              <span style={{ fontSize: '0.8rem' }}><b style={{ color: 'var(--color-success)' }}>Listo cuando:</b> {task.definitionOfDone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- KPIs ----------
function KpisPane({ overview, onChanged }: { overview: LaunchOverview; onChanged: () => void }) {
  const byKey = useMemo(() => Object.fromEntries(overview.kpis.map((k) => [k.key, k])), [overview.kpis]);
  const buyers = Number(byKey.compradores?.value ?? 0);
  const htPct = Number(byKey.conv_ht?.value ?? 0);
  const cfg = overview.launch.config as Record<string, any>;
  const avg = Number(cfg.avg_price_usd ?? 76);
  const ht = Number(cfg.upsell_ht_usd ?? 580);
  const revenue = buyers * avg + buyers * (htPct / 100) * ht;

  return (
    <>
      <div className="section-title">Scorecard (editable · se guarda)</div>
      <div className="kpi-grid">
        {overview.kpis.filter((k) => !k.isComputed).map((k) => (
          <KpiCard key={k.id} launchId={overview.launch.id} kpi={k} onChanged={onChanged} />
        ))}
        <div className="card">
          <div className="kpi-label">Revenue estimado C2</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
            {revenue ? `$${Math.round(revenue).toLocaleString()}` : '—'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>compradores×${avg} + HT</div>
        </div>
      </div>
    </>
  );
}

function KpiCard({ launchId, kpi, onChanged }: { launchId: string; kpi: Kpi; onChanged: () => void }) {
  const [val, setVal] = useState<string>(kpi.value != null ? String(kpi.value) : '');
  const [pending, start] = useTransition();

  function save() {
    const num = val.trim() === '' ? null : Number(val);
    if (num != null && Number.isNaN(num)) return;
    start(async () => {
      await updateKpiAction({ launchId, key: kpi.key, value: num });
      onChanged();
    });
  }

  return (
    <div className="card">
      <div className="kpi-label">{kpi.label}</div>
      <input
        type="number"
        value={val}
        disabled={pending}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        placeholder="0"
        style={{
          width: '100%',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          padding: '6px 8px',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
          background: 'var(--color-bg)',
          marginTop: 4,
        }}
      />
      {kpi.targetLabel && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Meta {kpi.targetLabel}</div>}
    </div>
  );
}

// ---------- Enlaces ----------
function EnlacesPane({ overview, onChanged }: { overview: LaunchOverview; onChanged: () => void }) {
  const categories = useMemo(() => [...new Set(overview.resources.map((r) => r.category))], [overview.resources]);
  const catLabels: Record<string, string> = {
    landings: 'Landings & páginas',
    comms: 'Comunicación',
    tracking: 'Tracking & herramientas',
    assets: 'Assets & contenido',
    docs: 'Documentos',
  };
  return (
    <>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div className="section-title">{catLabels[cat] ?? cat}</div>
          <div className="card">
            <table>
              <thead>
                <tr><th>Recurso</th><th>Owner</th><th style={{ width: 34 }}>●</th><th>URL</th></tr>
              </thead>
              <tbody>
                {overview.resources.filter((r) => r.category === cat).map((r) => (
                  <ResourceRow key={r.id} launchId={overview.launch.id} resource={r} onChanged={onChanged} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

function ResourceRow({ launchId, resource, onChanged }: { launchId: string; resource: Resource; onChanged: () => void }) {
  const [url, setUrl] = useState<string>(resource.url ?? '');
  const [pending, start] = useTransition();
  const ready = url.trim().length > 0;

  function save() {
    start(async () => {
      await updateResourceAction({
        launchId,
        key: resource.key,
        url: url.trim() || null,
        status: url.trim() ? 'ready' : 'pending',
      });
      onChanged();
    });
  }

  return (
    <tr>
      <td>{resource.label}</td>
      <td style={{ color: 'var(--color-text-secondary)' }}>{resource.ownerKey ? ownerLabel(resource.ownerKey) : '—'}</td>
      <td style={{ color: ready ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: 800 }}>{ready ? '●' : '○'}</td>
      <td>
        <input
          value={url}
          disabled={pending}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={save}
          placeholder="https://…"
          style={{
            width: '100%',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: '0.78rem',
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
          }}
        />
      </td>
    </tr>
  );
}
