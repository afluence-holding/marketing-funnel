export interface ClickUpTaskPayload {
  name: string;
  description?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ClickUpTaskUpdatePayload {
  name?: string;
  description?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ClickUpTaskResponse {
  id: string;
  status?: {
    status?: string;
  };
  [key: string]: unknown;
}

export interface ClickUpCustomFieldOption {
  id?: string;
  name?: string;
  label?: string;
  orderindex?: number;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config?: {
    options?: ClickUpCustomFieldOption[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ClickUpClientOptions {
  apiToken: string;
  baseUrl?: string;
}

export class ClickUpClient {
  private readonly apiToken: string;
  private readonly baseUrl: string;

  constructor(options: ClickUpClientOptions) {
    this.apiToken = options.apiToken;
    this.baseUrl = options.baseUrl ?? 'https://api.clickup.com/api/v2';
  }

  async createTask(listId: string, payload: ClickUpTaskPayload): Promise<ClickUpTaskResponse> {
    return this.request<ClickUpTaskResponse>(`/list/${listId}/task`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTask(taskId: string, payload: ClickUpTaskUpdatePayload): Promise<ClickUpTaskResponse> {
    return this.request<ClickUpTaskResponse>(`/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async updateTaskStatus(taskId: string, status: string): Promise<ClickUpTaskResponse> {
    return this.updateTask(taskId, { status });
  }

  async getListCustomFields(listId: string): Promise<ClickUpCustomField[]> {
    const result = await this.request<{ fields?: ClickUpCustomField[] }>(`/list/${listId}/field`, {
      method: 'GET',
    });
    return result.fields ?? [];
  }

  async setTaskCustomField(taskId: string, fieldId: string, value: unknown): Promise<void> {
    await this.request(`/task/${taskId}/field/${fieldId}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const authToken = this.apiToken.replace(/^Bearer\s+/i, '').trim();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        // ClickUp v2 expects raw token in Authorization header.
        Authorization: authToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[clickup-client] ${init.method ?? 'GET'} ${path} failed (${response.status}): ${errorBody}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
