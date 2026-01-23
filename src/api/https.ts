// src/api/https.ts
// (원하면 파일명 http.ts로 바꿔도 됨)

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function getBaseUrl() {
  // 예: .env에 VITE_API_BASE_URL=http://localhost:4000
  // 없으면 same-origin 기준(프록시 쓰는 경우)으로 동작
  return (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

function buildUrl(path: string) {
  const base = getBaseUrl();
  if (!base) return path; // 프록시/상대경로
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // 서버가 text로 주는 경우도 대비
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path);
  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  let body: BodyInit | undefined;

  if (options.body !== undefined && options.body !== null) {
    // FormData면 그대로, 아니면 JSON
    if (options.body instanceof FormData) {
      body = options.body;
      // FormData일 때는 Content-Type을 브라우저가 자동 세팅하므로 넣지 않음
    } else {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    signal: options.signal,
    credentials: "include", // 필요 없으면 지워도 됨
  });

  // 204 No Content
  if (res.status === 204) return null as unknown as T;

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data && (data as any).message) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(String(msg), res.status, data);
  }

  return data as T;
}