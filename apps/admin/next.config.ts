import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvConfig } from '@next/env';

// Load env from monorepo root (.env, .env.local).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..');
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: ['@marketing-funnel/db', '@marketing-funnel/meta-ads'],
};

export default nextConfig;
