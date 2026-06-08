export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'system-ui, sans-serif',
        color: '#18181b',
        background: '#f4f4f5',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>404 — Not found</h1>
      <p style={{ color: '#71717a', fontSize: 14 }}>
        La página que buscás no existe.
      </p>
    </main>
  );
}
