/**
 * Rate-limiter por token (compartido entre el intento inline y el cron, mismo
 * proceso single-instance). Token-bucket simple por clave (= `secretRef`/cuenta):
 * MailerLite limita ~120 req/min POR CUENTA, así que el throttle es por token,
 * no por call-site. `acquire()` espera hasta tener cupo.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

const DEFAULT_CAPACITY = 110; // margen bajo los 120/min de MailerLite
const DEFAULT_REFILL_PER_MS = DEFAULT_CAPACITY / 60_000; // tokens por ms

function now(): number {
  return Date.now();
}

function refill(bucket: Bucket, capacity: number, ratePerMs: number): void {
  const elapsed = now() - bucket.lastRefill;
  if (elapsed <= 0) return;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * ratePerMs);
  bucket.lastRefill = now();
}

/**
 * Adquiere 1 token de la cuenta `key`, esperando si hace falta. `maxWaitMs`
 * acota la espera (si se supera, lanza para que el connector reintente luego).
 */
export async function acquireRateToken(
  key: string,
  opts: { capacity?: number; ratePerMs?: number; maxWaitMs?: number } = {},
): Promise<void> {
  const capacity = opts.capacity ?? DEFAULT_CAPACITY;
  const ratePerMs = opts.ratePerMs ?? DEFAULT_REFILL_PER_MS;
  const maxWaitMs = opts.maxWaitMs ?? 10_000;
  const started = now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now() };
    buckets.set(key, bucket);
  }

  // Espera hasta tener ≥1 token o agotar maxWaitMs.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    refill(bucket, capacity, ratePerMs);
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return;
    }
    if (now() - started >= maxWaitMs) {
      throw new Error(`rate limit: timed out waiting for token on "${key}"`);
    }
    const needed = 1 - bucket.tokens;
    const waitMs = Math.min(Math.ceil(needed / ratePerMs), 250);
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

/** Solo para tests: reinicia los buckets. */
export function __resetRateLimiter(): void {
  buckets.clear();
}
