import { redirect } from 'next/navigation';
import { listBuOptions } from '@/lib/dashboard/bu-options';

// Hits the DB to pick the first accessible BU; must not prerender.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const options = await listBuOptions().catch(() => []);
  const first = options[0];
  // Fallback to the canonical DI21 path if meta_ops is empty or unreachable.
  redirect(first?.path ?? '/german-roz/di21');
}
