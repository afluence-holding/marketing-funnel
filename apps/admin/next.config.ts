import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..');

// Env lives at the monorepo root. Next.js only reads .env files from the app
// directory, and the untracked `apps/admin/.env -> ../../.env` symlink does not
// survive fresh clones or git worktrees — without this, the admin boots with no
// Supabase vars and every route 307s to /login?err=misconfig.
dotenv.config({ path: path.join(monorepoRoot, '.env.local') });
dotenv.config({ path: path.join(monorepoRoot, '.env') });

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@marketing-funnel/db', '@marketing-funnel/meta-ads'],
};

export default nextConfig;
