import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..');

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@marketing-funnel/db', '@marketing-funnel/meta-ads'],
};

export default nextConfig;
