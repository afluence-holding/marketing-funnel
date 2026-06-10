import { afterEach, describe, expect, it } from 'vitest';
import { acquireRateToken, __resetRateLimiter } from '../rate-limiter';

afterEach(() => __resetRateLimiter());

describe('rate-limiter (token-bucket por clave/token)', () => {
  it('permite hasta capacity inmediato y luego throttlea', async () => {
    const key = 'TOK_A';
    // capacity 3, refill lentísimo → los 3 primeros pasan ya, el 4º agota maxWait
    for (let i = 0; i < 3; i += 1) {
      await acquireRateToken(key, { capacity: 3, ratePerMs: 1e-9, maxWaitMs: 50 });
    }
    await expect(
      acquireRateToken(key, { capacity: 3, ratePerMs: 1e-9, maxWaitMs: 50 }),
    ).rejects.toThrow(/rate limit/);
  });

  it('es POR CLAVE: dos tokens no comparten bucket', async () => {
    await acquireRateToken('TOK_X', { capacity: 1, ratePerMs: 1e-9, maxWaitMs: 50 });
    // TOK_X agotado, pero TOK_Y tiene su propio bucket lleno
    await expect(
      acquireRateToken('TOK_Y', { capacity: 1, ratePerMs: 1e-9, maxWaitMs: 50 }),
    ).resolves.toBeUndefined();
  });

  it('el MISMO token comparte bucket entre llamadas (inline↔cron)', async () => {
    await acquireRateToken('TOK_S', { capacity: 1, ratePerMs: 1e-9, maxWaitMs: 50 });
    await expect(
      acquireRateToken('TOK_S', { capacity: 1, ratePerMs: 1e-9, maxWaitMs: 50 }),
    ).rejects.toThrow(/rate limit/);
  });

  it('refill repone cupo con el tiempo', async () => {
    const key = 'TOK_R';
    await acquireRateToken(key, { capacity: 1, ratePerMs: 1, maxWaitMs: 50 }); // 1 token/ms
    // tras ~5ms ya hay cupo
    await new Promise((r) => setTimeout(r, 10));
    await expect(
      acquireRateToken(key, { capacity: 1, ratePerMs: 1, maxWaitMs: 50 }),
    ).resolves.toBeUndefined();
  });
});
