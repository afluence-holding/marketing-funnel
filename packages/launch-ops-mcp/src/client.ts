/**
 * Thin HTTP client for the Launch Ops agent API (apps/admin /api/agent/v1).
 * Injects the Bearer token and the optimistic-lock / idempotency headers.
 * Knows nothing about MCP — it's a plain typed fetch wrapper.
 */

export interface ClientOptions {
  baseUrl: string;
  token: string;
  defaultLaunch?: string;
  timeoutMs?: number;
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  etag: string | null;
}

export interface TaskFilters {
  launch?: string;
  phase?: string;
  status?: string;
  owner?: string;
  channel?: string;
  blocked?: boolean;
  q?: string;
  limit?: number;
}

export interface StatusUpdate {
  status?: string;
  progressPct?: number;
  note?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
}

export interface BulkUpdateItem {
  taskId: string;
  status?: string;
  progressPct?: number;
  note?: string;
  expectedVersion?: number;
}

export class LaunchOpsClient {
  constructor(private readonly opts: ClientOptions) {}

  private async request<T>(
    method: string,
    path: string,
    init?: { body?: unknown; headers?: Record<string, string> },
  ): Promise<ApiResult<T>> {
    const url = `${this.opts.baseUrl.replace(/\/$/, '')}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs ?? 15000);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.opts.token}`,
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
        body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }
      return { ok: res.ok, status: res.status, data: data as T, etag: res.headers.get('etag') };
    } finally {
      clearTimeout(timer);
    }
  }

  private launch(explicit?: string): string | undefined {
    return explicit ?? this.opts.defaultLaunch;
  }

  listTasks(f: TaskFilters = {}): Promise<ApiResult> {
    const sp = new URLSearchParams();
    const launch = this.launch(f.launch);
    if (launch) sp.set('launch', launch);
    if (f.phase) sp.set('phase', f.phase);
    if (f.status) sp.set('status', f.status);
    if (f.owner) sp.set('owner', f.owner);
    if (f.channel) sp.set('channel', f.channel);
    if (f.blocked) sp.set('blocked', '1');
    if (f.q) sp.set('q', f.q);
    if (f.limit) sp.set('limit', String(f.limit));
    return this.request('GET', `/api/agent/v1/tasks?${sp.toString()}`);
  }

  getTask(taskId: string): Promise<ApiResult> {
    return this.request('GET', `/api/agent/v1/tasks/${encodeURIComponent(taskId)}`);
  }

  updateStatus(taskId: string, u: StatusUpdate): Promise<ApiResult> {
    const headers: Record<string, string> = {};
    if (u.expectedVersion != null) headers['If-Match'] = `"${u.expectedVersion}"`;
    if (u.idempotencyKey) headers['Idempotency-Key'] = u.idempotencyKey;
    return this.request('PATCH', `/api/agent/v1/tasks/${encodeURIComponent(taskId)}`, {
      headers,
      body: { status: u.status, progressPct: u.progressPct, note: u.note },
    });
  }

  bulkStatus(updates: BulkUpdateItem[], idempotencyKey?: string): Promise<ApiResult> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    return this.request('POST', `/api/agent/v1/bulk-status`, {
      headers,
      body: {
        updates: updates.map((u) => ({
          taskId: u.taskId,
          status: u.status,
          progressPct: u.progressPct,
          note: u.note,
          expectedVersion: u.expectedVersion,
        })),
      },
    });
  }

  addComment(taskId: string, body: string, kind?: string): Promise<ApiResult> {
    return this.request('POST', `/api/agent/v1/tasks/${encodeURIComponent(taskId)}/comments`, {
      body: { body, kind },
    });
  }

  progress(launch?: string): Promise<ApiResult> {
    const l = this.launch(launch);
    const qs = l ? `?launch=${encodeURIComponent(l)}` : '';
    return this.request('GET', `/api/agent/v1/progress${qs}`);
  }
}
