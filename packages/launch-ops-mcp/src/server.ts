/**
 * Builds the Launch Ops MCP server: registers tools that map 1:1 (by intent)
 * to the agent API. Auth, optimistic locking and idempotency are handled by
 * the client; tools just shape inputs and surface results to the model.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ApiResult, LaunchOpsClient } from './client.js';

function present(r: ApiResult, summary?: string) {
  const head = summary ? `${summary} (HTTP ${r.status})\n` : `HTTP ${r.status}\n`;
  return {
    content: [{ type: 'text' as const, text: head + JSON.stringify(r.data, null, 2) }],
    isError: !r.ok,
  };
}

const STATUS = z.enum(['todo', 'doing', 'blocked', 'done']);

export function buildServer(client: LaunchOpsClient, defaultLaunch?: string): McpServer {
  const server = new McpServer({ name: 'launch-ops', version: '1.0.0' });

  server.registerTool(
    'list_tasks',
    {
      title: 'List launch tasks',
      description:
        'List Launch Ops tasks with optional filters. Use this to find tasks by phase (F0..F5), ' +
        'status, owner (nico/mau/german/tomas/elba), channel, blocked-only, or a free-text query.',
      inputSchema: {
        launch: z.string().optional().describe(`Launch code. Defaults to ${defaultLaunch ?? 'the active launch'}.`),
        phase: z.string().optional().describe('Phase code: F0..F5'),
        status: STATUS.optional(),
        owner: z.string().optional(),
        channel: z.string().optional(),
        blocked: z.boolean().optional().describe('Only blocked tasks'),
        q: z.string().optional().describe('Search title/objective'),
        limit: z.number().int().positive().max(200).optional(),
      },
    },
    async (args) => present(await client.listTasks(args)),
  );

  server.registerTool(
    'get_task',
    {
      title: 'Get a task',
      description: 'Fetch a single task by id, including steps, owners, dependencies and its current version.',
      inputSchema: { task_id: z.string().describe('Task UUID') },
    },
    async ({ task_id }) => present(await client.getTask(task_id)),
  );

  server.registerTool(
    'update_task_status',
    {
      title: 'Update task status',
      description:
        'Update a task status and/or progress. STRONGLY prefer passing expected_version (from get_task) ' +
        'for optimistic locking — a stale version returns a conflict instead of overwriting. ' +
        'Pass a stable idempotency_key so retries are safe.',
      inputSchema: {
        task_id: z.string(),
        status: STATUS.optional(),
        progress_pct: z.number().int().min(0).max(100).optional(),
        note: z.string().optional().describe('Optional note recorded as an agent comment'),
        expected_version: z.number().int().optional().describe('Version from a prior get_task (optimistic lock)'),
        idempotency_key: z.string().optional(),
      },
    },
    async ({ task_id, status, progress_pct, note, expected_version, idempotency_key }) =>
      present(
        await client.updateStatus(task_id, {
          status,
          progressPct: progress_pct,
          note,
          expectedVersion: expected_version,
          idempotencyKey: idempotency_key,
        }),
        'update_task_status',
      ),
  );

  server.registerTool(
    'bulk_update_status',
    {
      title: 'Bulk update statuses',
      description: 'Update up to 50 task statuses in one call. Returns a per-item result (ok / conflict / not_found).',
      inputSchema: {
        updates: z
          .array(
            z.object({
              task_id: z.string(),
              status: STATUS.optional(),
              progress_pct: z.number().int().min(0).max(100).optional(),
              note: z.string().optional(),
              expected_version: z.number().int().optional(),
            }),
          )
          .min(1)
          .max(50),
        idempotency_key: z.string().optional(),
      },
    },
    async ({ updates, idempotency_key }) =>
      present(
        await client.bulkStatus(
          updates.map((u) => ({
            taskId: u.task_id,
            status: u.status,
            progressPct: u.progress_pct,
            note: u.note,
            expectedVersion: u.expected_version,
          })),
          idempotency_key,
        ),
        'bulk_update_status',
      ),
  );

  server.registerTool(
    'add_comment',
    {
      title: 'Add a comment',
      description: 'Add a note/comment to a task. Recorded with the agent identity.',
      inputSchema: {
        task_id: z.string(),
        body: z.string().min(1),
        kind: z.string().optional(),
      },
    },
    async ({ task_id, body, kind }) => present(await client.addComment(task_id, body, kind), 'add_comment'),
  );

  server.registerTool(
    'get_progress',
    {
      title: 'Get launch progress',
      description: 'Return overall + per-phase progress and the current KPI scorecard for the launch.',
      inputSchema: {
        launch: z.string().optional().describe(`Launch code. Defaults to ${defaultLaunch ?? 'the active launch'}.`),
      },
    },
    async ({ launch }) => present(await client.progress(launch)),
  );

  return server;
}
