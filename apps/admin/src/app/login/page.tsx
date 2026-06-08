import type { Metadata } from 'next';
import { LoginForm } from '@/components/login-form';

export const dynamic = 'force-dynamic';

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
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 28 }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Afluence Admin
          </h1>
          <p style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Backoffice operativo
          </p>
        </div>

        {isMisconfig && (
          <div
            style={{
              marginBottom: 16,
              border: '1px solid rgba(232, 65, 15, 0.4)',
              background: 'rgba(232, 65, 15, 0.08)',
              color: 'var(--color-critical)',
              fontSize: '0.82rem',
              borderRadius: 8,
              padding: 12,
            }}
          >
            Configuración incompleta. Verificá <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el entorno.
          </div>
        )}

        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
