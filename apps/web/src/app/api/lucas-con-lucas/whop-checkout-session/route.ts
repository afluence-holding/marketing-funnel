import { NextResponse } from 'next/server';
import { createWhopCheckoutSessionServer } from '@/lib/lucas/whop-checkout.server';
import { getLucasRetoPrice, LUCAS } from '@/app/(landings)/lucas-con-lucas/lucas-config';

export async function POST(request: Request) {
  try {
    let fbp: string | undefined;
    let fbc: string | undefined;
    try {
      const body = (await request.json()) as {
        tracking?: { meta?: { fbp?: string; fbc?: string } };
      };
      fbp = body.tracking?.meta?.fbp;
      fbc = body.tracking?.meta?.fbc;
    } catch {
      /* body optional */
    }

    const session = await createWhopCheckoutSessionServer({ fbp, fbc });
    if (!session) {
      return NextResponse.json(
        { error: 'WHOP_API_KEY missing or Whop session failed' },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      planId: session.planId,
      purchaseEventId: session.purchaseEventId,
      value: getLucasRetoPrice(),
      currency: LUCAS.currency,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create Whop checkout session' },
      { status: 502 },
    );
  }
}
