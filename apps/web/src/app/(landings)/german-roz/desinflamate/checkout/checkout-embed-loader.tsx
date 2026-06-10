import { cookies } from 'next/headers';
import { createWhopCheckoutSessionServer } from '@/lib/whop/checkout.server';
import { GenericWhopCheckoutEmbed } from '@/components/whop/whop-checkout-embed';

const PRODUCT_KEY = 'german-desinflamate';

/** Creates the Whop session on the server so the embed can mount on first paint. */
export async function DesinflamateCheckoutEmbedLoader() {
  const cookieStore = await cookies();
  const initialSession = await createWhopCheckoutSessionServer(PRODUCT_KEY, {
    fbp: cookieStore.get('_fbp')?.value,
    fbc: cookieStore.get('_fbc')?.value,
  });

  return (
    <GenericWhopCheckoutEmbed
      productKey={PRODUCT_KEY}
      initialSession={initialSession}
      theme="light"
      accentColor="orange"
      backHref="/german-roz/vsl-desinflamate"
      backLabel="← Volver"
    />
  );
}
