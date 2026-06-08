'use client';

/**
 * LaunchSidebar — sectioned module navigation for the Centro de Operaciones.
 *
 * Replaces the old flat tab strip. Renders the 9 modules (filtered by role)
 * grouped into sections, plus the optional "Ver como rol" selector (admins) and
 * the mobile drawer behaviour. Styling lives in globals.css (`.launch-*`).
 *
 * The backdrop is `display:none` by default and only shown via `.show` (mobile
 * drawer fix from the reference design — never occupies a grid column).
 */
import { OPS_ROLES, ROLE_LABELS, type ModuleId, type OpsRole } from '@/lib/backoffice/rbac';
import { groupModulesBySection } from '@/lib/launch-ops/navigation';

interface RoleSelect {
  value: OpsRole;
  realRole: OpsRole;
  onChange: (role: OpsRole) => void;
}

export function LaunchSidebar({
  brand,
  subtitle,
  visible,
  active,
  onSelect,
  open,
  onClose,
  roleSelect,
}: {
  brand: string;
  subtitle: string;
  visible: ModuleId[];
  active: ModuleId;
  onSelect: (id: ModuleId) => void;
  open: boolean;
  onClose: () => void;
  roleSelect?: RoleSelect | null;
}) {
  const groups = groupModulesBySection(visible);

  return (
    <>
      <aside className={`launch-sidebar${open ? ' open' : ''}`} aria-label="Módulos del Centro de Operaciones">
        <div className="launch-sb-brand">
          {brand}
          <small>{subtitle}</small>
        </div>

        {roleSelect && (
          <div className="launch-sb-role">
            <label htmlFor="launch-role-sel">Ver como rol</label>
            <select
              id="launch-role-sel"
              value={roleSelect.value}
              onChange={(e) => roleSelect.onChange(e.target.value as OpsRole)}
            >
              {OPS_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {roleSelect.value !== roleSelect.realRole && (
              <span className="launch-sb-preview">previsualización</span>
            )}
          </div>
        )}

        {groups.map((g) => (
          <div key={g.section}>
            <div className="launch-sb-sec">{g.section}</div>
            {g.items.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`launch-navitem${active === m.id ? ' active' : ''}`}
                aria-current={active === m.id ? 'page' : undefined}
                onClick={() => {
                  onSelect(m.id);
                  onClose();
                }}
              >
                <span className="ic" aria-hidden>
                  {m.icon}
                </span>
                {m.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <div
        className={`launch-sb-backdrop${open ? ' show' : ''}`}
        onClick={onClose}
        aria-hidden
      />
    </>
  );
}
