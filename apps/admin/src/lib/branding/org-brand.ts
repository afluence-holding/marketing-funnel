/**
 * Per-organization brand palette for the Centro de Operaciones.
 *
 * The Centro adopts the reference light design and is branded with the org's
 * accent color (active nav items, progress bars, kickers, chips). Colors are
 * injected into `.centro-theme` as CSS custom properties at render time.
 *
 * Source of truth is intentionally a small static map keyed by organizer slug:
 * the only validated org color today is german-roz (the Desinflámate orange
 * from docs/DI21-C2-Centro-Operaciones.html). Unknown orgs fall back to the
 * admin's neutral blue accent (no invented colors). Extend the map per org, or
 * back it with a DB column later without changing call sites.
 */

export interface OrgBrand {
  /** Primary brand color (accents, active states, progress). */
  accent: string;
  /** Darker shade for hover / pressed / emphasis. */
  accentDark: string;
  /** Soft tint for subtle branded backgrounds. */
  accentSoft: string;
}

/** Neutral fallback = admin's default blue accent. */
export const DEFAULT_BRAND: OrgBrand = {
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentSoft: '#dbeafe',
};

const ORG_BRANDS: Record<string, OrgBrand> = {
  'german-roz': { accent: '#ff5e2b', accentDark: '#e8410f', accentSoft: '#ffe7df' },
};

/** Resolve the brand palette for an organizer slug (safe fallback). */
export function orgBrand(organizer?: string | null): OrgBrand {
  if (!organizer) return DEFAULT_BRAND;
  return ORG_BRANDS[organizer] ?? DEFAULT_BRAND;
}

/** CSS custom properties to spread into `.centro-theme`'s inline style. */
export function brandCssVars(organizer?: string | null): Record<string, string> {
  const brand = orgBrand(organizer);
  return {
    '--color-accent': brand.accent,
    '--centro-accent-dark': brand.accentDark,
    '--centro-accent-soft': brand.accentSoft,
  };
}
