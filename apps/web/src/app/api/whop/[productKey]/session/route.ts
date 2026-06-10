import { NextResponse } from 'next/server';
import { createWhopCheckoutSessionServer } from '@/lib/whop/checkout.server';
import { getWhopProduct } from '@/lib/whop/products';

/**
 * Generic same-origin proxy that creates a Whop checkout session for any
 * registered product. POST /api/whop/<productKey>/session with an optional
 * { tracking: { meta: { fbp, fbc } } } body and receive the session id +
 * resolved tier price.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ productKey: string }> },
) {
  const { productKey } = await context.params;

  const product = getWhopProduct(productKey);
  if (!product) {
    return NextResponse.json(
      { ok: false, error: `Unknown product: ${productKey}` },
      { status: 404 },
    );
  }

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

  try {
    const session = await createWhopCheckoutSessionServer(productKey, { fbp, fbc });
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'WHOP_API_KEY missing or Whop session failed' },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      planId: session.planId,
      purchaseEventId: session.purchaseEventId,
      value: session.value,
      currency: session.currency,
      cohortCode: session.cohortCode,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to create Whop checkout session' },
      { status: 502 },
    );
  }
}
