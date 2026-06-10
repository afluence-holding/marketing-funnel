import { defineConfig } from 'vitest/config';

// Solo corre los tests de la capa de integraciones (puros: mockean DB/HTTP, no
// importan @marketing-funnel/config, que valida env y mataría el CI sin .env).
export default defineConfig({
  test: {
    include: ['src/core/integrations/__tests__/**/*.test.ts'],
  },
});
