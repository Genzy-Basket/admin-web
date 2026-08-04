const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

const TOKEN_KEY = "genzy_admin_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error?: { code?: string };
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = tokenStore.get();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON response (gateway error, etc.) — fall through to the throw.
  }

  if (!response.ok || !body?.success) {
    // A 401 on an authenticated call means the session is gone, not that the
    // credentials the user just typed were wrong.
    if (response.status === 401 && token) {
      tokenStore.clear();
      onUnauthorized?.();
    }

    throw new ApiError(
      body?.message ?? "Something went wrong. Please try again.",
      response.status,
      body?.error?.code,
    );
  }

  return body.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, payload?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    }),
  patch: <T>(path: string, payload?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: payload ? JSON.stringify(payload) : undefined,
    }),
};
