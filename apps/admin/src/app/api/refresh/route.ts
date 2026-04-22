import { NextResponse, type NextRequest } from 'next/server';
import { runTodayJob } from '@marketing-funnel/meta-ads';
import { getSupabaseServer, getSupabaseMetaOps } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const THROTTLE_SECONDS = 30;

export async function POST(req: NextRequest) {
  // 1. Require user session.
  const userClient = await getSupabaseServer();
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = userData.user.id;

  // 2. Parse body.
  let body: { organizer_slug?: string; bu_slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { organizer_slug, bu_slug } = body;
  if (!organizer_slug || !bu_slug) {
    return NextResponse.json({ error: 'organizer_slug and bu_slug are required' }, { status: 400 });
  }

  const admin = getSupabaseMetaOps();

  // 3. Resolve BU ID.
  const { data: bu } = await admin
    .from('business_units')
    .select('id, slug, organizers:organizer_id(slug)')
    .eq('slug', bu_slug)
    .single();
  if (!bu) return NextResponse.json({ error: 'Business unit not found' }, { status: 404 });
  const organizers = bu.organizers as unknown;
  const orgSlug = Array.isArray(organizers)
    ? (organizers[0] as { slug?: string } | undefined)?.slug
    : (organizers as { slug?: string } | null)?.slug;
  if (orgSlug !== organizer_slug) {
    return NextResponse.json({ error: 'BU does not belong to organizer' }, { status: 404 });
  }

  // 4. DB-backed rate limit.
  const { data: lastRow } = await admin
    .from('refresh_rate_limit')
    .select('last_refresh_at')
    .eq('user_id', userId)
    .eq('business_unit_id', bu.id)
    .maybeSingle();

  if (lastRow?.last_refresh_at) {
    const elapsedSec = (Date.now() - new Date(lastRow.last_refresh_at as string).getTime()) / 1000;
    if (elapsedSec < THROTTLE_SECONDS) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retry_after_sec: Math.ceil(THROTTLE_SECONDS - elapsedSec),
        },
        { status: 429 },
      );
    }
  }

  // 5. Record refresh timestamp (before the job, so concurrent requests throttle).
  await admin
    .from('refresh_rate_limit')
    .upsert(
      { user_id: userId, business_unit_id: bu.id, last_refresh_at: new Date().toISOString() },
      { onConflict: 'user_id,business_unit_id' },
    );

  // 6. Run the job.
  const masterKey = process.env.META_MASTER_KEY;
  if (!masterKey) {
    return NextResponse.json({ error: 'META_MASTER_KEY missing' }, { status: 500 });
  }
  try {
    const result = await runTodayJob({
      supabase: admin,
      masterKey,
      businessUnitFilter: { organizerSlug: organizer_slug, buSlug: bu_slug },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
