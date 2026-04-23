'use client';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="es">
      <body>
        <h2>Algo salió mal</h2>
        <p>{error.message}</p>
      </body>
    </html>
  );
}
