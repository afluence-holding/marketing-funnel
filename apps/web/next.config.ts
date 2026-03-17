import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvConfig } from '@next/env';

// Ensure Next.js web app loads env vars from monorepo root.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..');
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
