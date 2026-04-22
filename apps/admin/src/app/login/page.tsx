import type { Metadata } from 'next';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Login · Afluence Admin',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; next?: string }>;
}) {
  const params = await searchParams;
  const isMisconfig = params.err === 'misconfig';
  const nextPath = params.next && params.next.startsWith('/') ? params.next : '/';

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Afluence Admin</h1>
          <p className="mt-2 text-sm text-zinc-400">Backoffice operativo</p>
        </div>

        {isMisconfig && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 text-sm rounded-md p-3">
            Configuración incompleta. Verificá <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el entorno.
          </div>
        )}

        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
