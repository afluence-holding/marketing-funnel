import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvConfig } from '@next/env';

// Ensure Next.js web app loads env vars from monorepo root.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..');
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {
  // Pin the workspace root to the monorepo so Next infers env files (.env,
  // .env.local) and file tracing from here — a stray lockfile elsewhere on
  // the machine would otherwise mis-detect the root and skip our env vars.
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@marketing-funnel/catalog'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
