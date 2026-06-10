import { Client } from 'pg';
import { env } from '@marketing-funnel/config';
import { CATALOG, validateCatalog } from '@marketing-funnel/catalog';
import { getBusinessUnitBinding } from '../../orgs';

/**
 * Sync the code-first catalog into the `marketing.cohorts` mirror.
 *
 * UNIDIRECTIONAL code→DB (the catalog is the only editable definition): upserts
 * every cohort by `code`, refreshes the mirror columns, and flags cohorts that
 * disappeared from the catalog as `is_active = false` (never DELETE — past
 * editions stay queryable forever). Manual DB edits are overwritten here on
 * every boot. The checkout NEVER reads this table.
 */
export async function syncCohortsFromCatalog(): Promise<void> {
  const errors = validateCatalog(CATALOG);
  if (errors.length > 0) {
    // Refuse to mirror an invalid catalog — surface loudly, keep the API up.
    console.error('[cohort-sync] catalog validation failed, sync skipped', { errors });
    return;
  }

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    for (const product of CATALOG) {
      const binding = getBusinessUnitBinding(product.orgKey, product.buKey);
      const codes: string[] = [];

      for (const cohort of product.cohorts) {
        codes.push(cohort.code);
        await client.query(
          `INSERT INTO marketing.cohorts
             (org_key, bu_key, business_unit_id, code, content_id, starts_at, ends_at, timezone, tiers, is_active, synced_at)
           VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8::jsonb, true, now())
           ON CONFLICT (code) DO UPDATE SET
             org_key   = EXCLUDED.org_key,
             bu_key    = EXCLUDED.bu_key,
             content_id = EXCLUDED.content_id,
             starts_at = EXCLUDED.starts_at,
             ends_at   = EXCLUDED.ends_at,
             timezone  = EXCLUDED.timezone,
             tiers     = EXCLUDED.tiers,
             is_active = true,
             synced_at = now()`,
          [
            product.orgKey,
            product.buKey,
            cohort.code,
            cohort.contentId,
            cohort.startsAt ?? null,
            cohort.endsAt ?? null,
            cohort.timezone,
            JSON.stringify(cohort.tiers),
          ],
        );
      }

      // Cohorts of this BU that left the catalog: deactivate, never delete.
      await client.query(
        `UPDATE marketing.cohorts
            SET is_active = false, synced_at = now()
          WHERE org_key = $1 AND bu_key = $2 AND NOT (code = ANY($3::text[]))`,
        [product.orgKey, product.buKey, codes],
      );

      console.info('[cohort-sync] mirrored product', {
        productKey: product.productKey,
        orgKey: product.orgKey,
        buKey: product.buKey,
        cohorts: codes,
        hasOrgBinding: Boolean(binding),
      });
    }
  } finally {
    await client.end();
  }
}
