const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
const DEFAULT_TIMEOUT = 10000;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiError(
        body?.error ?? `Request failed with status ${response.status}`,
        response.status
      );
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function requestBlob(path: string): Promise<Blob> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, response.status);
    }

    return response.blob();
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  getBlob: (path: string) => requestBlob(path),
};

export { ApiError };
