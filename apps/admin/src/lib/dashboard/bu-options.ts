import { supabaseAdminForSchema } from '@marketing-funnel/db';
import { primaryPath } from '@/lib/modules/registry';
import { responsesTenants } from '@/lib/responses/sources';

export interface BuOption {
  organizer_slug: string;
  organizer_name: string;
  bu_slug: string;
  bu_name: string;
  path: string; // canonical landing path (first enabled module)
}

/**
 * Returns the list of (organizer, business_unit) tuples available in meta_ops.
 * Ordered alphabetically by organizer then BU.
 *
 * Fase 3 note: currently unscoped (all authenticated users see all BUs). When
 * `meta_ops.user_bu_access` lands, filter by auth.uid() via RLS-aware client.
 */
export async function listBuOptions(): Promise<BuOption[]> {
  const meta = supabaseAdminForSchema('meta_ops');

  const { data: orgs, error: orgErr } = await meta
    .from('organizers')
    .select('id, slug, name')
    .order('name', { ascending: true });
  if (orgErr) throw orgErr;

  const { data: bus, error: buErr } = await meta
    .from('business_units')
    .select('id, slug, name, organizer_id')
    .order('name', { ascending: true });
  if (buErr) throw buErr;

  const orgById = new Map(
    (orgs ?? []).map((o) => [o.id as string, o as { id: string; slug: string; name: string }]),
  );

  const metaOptions = (bus ?? [])
    .map((bu) => {
      const org = orgById.get(bu.organizer_id as string);
      if (!org) return null;
      return {
        organizer_slug: org.slug,
        organizer_name: org.name,
        bu_slug: bu.slug as string,
        bu_name: bu.name as string,
        path: primaryPath(org.slug as string, bu.slug as string),
      } satisfies BuOption;
    })
    .filter((x): x is BuOption => x !== null);

  // Merge in responses-only tenants (creators with no Meta campaigns dashboard)
  // so they are reachable from the BU switcher. Dedup against meta_ops tenants.
  const seen = new Set(metaOptions.map((o) => `${o.organizer_slug}/${o.bu_slug}`));
  const extra: BuOption[] = responsesTenants()
    .filter((t) => !seen.has(`${t.organizer}/${t.bu}`))
    .map((t) => ({
      organizer_slug: t.organizer,
      organizer_name: t.creatorLabel,
      bu_slug: t.bu,
      bu_name: 'Respuestas',
      path: primaryPath(t.organizer, t.bu),
    }));

  return [...metaOptions, ...extra];
}
