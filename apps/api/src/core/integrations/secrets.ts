/**
 * Resolución de secretos por `secretRef` → env. El mapeo (código) guarda solo
 * el NOMBRE del env var (p.ej. 'MAILERLITE_TOKEN_GERMAN_ROZ'), nunca el valor.
 */

/** Devuelve el valor del env referenciado, o undefined si no está / vacío. */
export function resolveSecret(secretRef: string): string | undefined {
  const value = process.env[secretRef]?.trim();
  return value || undefined;
}
