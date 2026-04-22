import { NextResponse, type NextRequest } from 'next/server';
import { runRecentJob } from '@marketing-funnel/meta-ads';
import { getSupabaseMetaOps } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function checkBearer(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (req.headers.get('authorization') ?? '') === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!checkBearer(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const masterKey = process.env.META_MASTER_KEY;
  if (!masterKey) return NextResponse.json({ error: 'META_MASTER_KEY missing' }, { status: 500 });
  try {
    const result = await runRecentJob({ supabase: getSupabaseMetaOps(), masterKey });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
