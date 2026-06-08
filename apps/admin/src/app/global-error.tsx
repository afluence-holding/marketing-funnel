'use client';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="es">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#f4f4f5',
          color: '#18181b',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Algo salió mal</h2>
        <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>{error.message}</p>
      </body>
    </html>
  );
}
