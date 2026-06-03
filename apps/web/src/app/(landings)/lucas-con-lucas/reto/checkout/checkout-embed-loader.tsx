import { cookies } from 'next/headers';
import { createWhopCheckoutSessionServer } from '@/lib/lucas/whop-checkout.server';
import { LucasRetoCheckoutEmbed } from './checkout-embed';

/** Sesión Whop en el servidor — el formulario puede montar en el primer paint del cliente. */
export async function LucasRetoCheckoutEmbedLoader() {
  const cookieStore = await cookies();
  const initialSession = await createWhopCheckoutSessionServer({
    fbp: cookieStore.get('_fbp')?.value,
    fbc: cookieStore.get('_fbc')?.value,
  });

  return <LucasRetoCheckoutEmbed initialSession={initialSession} />;
}
