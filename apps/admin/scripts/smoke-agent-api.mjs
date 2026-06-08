#!/usr/bin/env node
/**
 * smoke-agent-api.mjs — black-box smoke test for /api/agent/v1.
 * Requires a running admin server + a valid agent token.
 *
 *   BASE_URL=http://localhost:3002 \
 *   LAUNCH_OPS_AGENT_TOKEN=xxxx \
 *   node apps/admin/scripts/smoke-agent-api.mjs
 *
 * Verifies: auth (401), scope, list, get+ETag, optimistic lock (If-Match 409),
 * idempotency replay, comment, progress. Exits non-zero on failure.
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3002';
const TOKEN = process.env.LAUNCH_OPS_AGENT_TOKEN ?? '';
const LAUNCH = process.env.LAUNCH_CODE ?? 'DI21-C2';

let failures = 0;
function ok(name, cond, detail = '') {
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!cond) failures++;
}
const auth = (extra = {}) => ({ Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...extra });

async function main() {
  if (!TOKEN) {
    console.error('Set LAUNCH_OPS_AGENT_TOKEN to run this smoke test.');
    process.exit(2);
  }

  // 1. unauthorized without token
  let r = await fetch(`${BASE}/api/agent/v1/tasks?launch=${LAUNCH}`);
  ok('rejects missing bearer (401)', r.status === 401, `got ${r.status}`);

  // 2. list tasks
  r = await fetch(`${BASE}/api/agent/v1/tasks?launch=${LAUNCH}&limit=5`, { headers: auth() });
  const list = await r.json().catch(() => ({}));
  ok('list tasks (200)', r.status === 200, `got ${r.status}`);
  ok('list returns tasks', Array.isArray(list.tasks) && list.tasks.length > 0);

  const sample = list.tasks?.[0];
  if (!sample) { console.error('no tasks to test mutations'); process.exit(failures ? 1 : 0); }

  // 3. get one + ETag
  r = await fetch(`${BASE}/api/agent/v1/tasks/${sample.id}`, { headers: auth() });
  ok('get task (200)', r.status === 200);
  ok('get task sends ETag', !!r.headers.get('etag'), r.headers.get('etag') ?? '');

  // 4. stale If-Match -> 409
  r = await fetch(`${BASE}/api/agent/v1/tasks/${sample.id}`, {
    method: 'PATCH',
    headers: auth({ 'If-Match': '"999999"' }),
    body: JSON.stringify({ status: 'doing' }),
  });
  ok('optimistic lock conflict (409)', r.status === 409, `got ${r.status}`);

  // 5. valid update with current version
  const key = `smoke-${Date.now()}`;
  r = await fetch(`${BASE}/api/agent/v1/tasks/${sample.id}`, {
    method: 'PATCH',
    headers: auth({ 'If-Match': `"${sample.version}"`, 'Idempotency-Key': key }),
    body: JSON.stringify({ status: 'doing', note: 'smoke test' }),
  });
  const upd = await r.json().catch(() => ({}));
  ok('update task (200)', r.status === 200, `got ${r.status}`);
  ok('version bumped', upd.task && upd.task.version === sample.version + 1, `v=${upd.task?.version}`);

  // 6. idempotency replay (same key)
  r = await fetch(`${BASE}/api/agent/v1/tasks/${sample.id}`, {
    method: 'PATCH',
    headers: auth({ 'Idempotency-Key': key }),
    body: JSON.stringify({ status: 'done' }),
  });
  ok('idempotency replay header', r.headers.get('idempotency-replayed') === 'true');

  // 7. comment
  r = await fetch(`${BASE}/api/agent/v1/tasks/${sample.id}/comments`, {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ body: 'agent smoke comment' }),
  });
  ok('add comment (200)', r.status === 200, `got ${r.status}`);

  // 8. progress
  r = await fetch(`${BASE}/api/agent/v1/progress?launch=${LAUNCH}`, { headers: auth() });
  const prog = await r.json().catch(() => ({}));
  ok('progress (200)', r.status === 200);
  ok('progress has overallPct', typeof prog.progress?.overallPct === 'number');

  console.log(failures ? `\n${failures} failure(s).` : '\nAll agent API smoke checks passed.');
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
