#!/usr/bin/env node
/**
 * Launch Ops MCP server (stdio).
 *
 * Env:
 *   LAUNCH_OPS_API_URL     base URL of the admin app (e.g. https://afluence-admin.up.railway.app)
 *   LAUNCH_OPS_AGENT_TOKEN scoped Bearer token (NOT the Supabase service role)
 *   LAUNCH_OPS_LAUNCH      default launch code (optional, e.g. DI21-C2)
 *
 * stdout is reserved for the JSON-RPC transport — all logs go to stderr.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LaunchOpsClient } from './client.js';
import { buildServer } from './server.js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`[launch-ops-mcp] missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const baseUrl = requireEnv('LAUNCH_OPS_API_URL');
  const token = requireEnv('LAUNCH_OPS_AGENT_TOKEN');
  const defaultLaunch = process.env.LAUNCH_OPS_LAUNCH;

  const client = new LaunchOpsClient({ baseUrl, token, defaultLaunch });
  const server = buildServer(client, defaultLaunch);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[launch-ops-mcp] ready on stdio · api=${baseUrl} · launch=${defaultLaunch ?? '(active)'}`);
}

main().catch((e) => {
  console.error('[launch-ops-mcp] fatal', e);
  process.exit(1);
});
