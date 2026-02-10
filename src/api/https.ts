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
  // 없으면 same-origin 기준(예: Vercel rewrites)으로 동작
  return (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

function buildUrl(path: string) {
  const base = getBaseUrl();
  // base가 없으면 상대경로로 요청(예: Vercel rewrites: /api/*)
  if (!base) return path;
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

// ✅ Dev auth header auto-injection
// - Landing 페이지에서 localStorage("connectedWalletAddress")에 지갑주소를 저장해두는 구조라면
//   API 레이어에서 자동으로 x-wallet-address 헤더를 붙여주면(옵션으로 매번 넘기지 않아도)
//   BE auth.js의 401을 바로 해결할 수 있음.
function getDevWalletAddressFromStorage(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem("connectedWalletAddress");
    if (!v) return null;

    // 최소한의 형식 체크(잘린 주소/객체 문자열 방지)
    if (!/^0x[0-9a-fA-F]+$/.test(v)) return null;
    return v;
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path);
  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  // ✅ Dev: 지갑 연결이 되어있으면 자동으로 x-wallet-address 주입
  // - options.headers로 명시적으로 넘겼다면 그 값을 우선함(덮어쓰지 않음)
  // - Bearer 토큰을 쓰는 경우(추후)에도 options.headers.Authorization이 있으면 그대로 사용
  const isDev = Boolean((import.meta as any).env?.DEV);

  if (isDev && !headers["x-wallet-address"]) {
    const devWallet = getDevWalletAddressFromStorage();
    if (devWallet) headers["x-wallet-address"] = devWallet;
  }

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
    credentials: "omit",
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

// --- Health Check ---
export type HealthResponse = {
  ok: boolean;
  message?: string;
  ts?: string;
  // optional details
  source?: "health" | "projects";
};

// Some backends may not implement GET /api/health.
// This helper tries /api/health first, and falls back to a lightweight projects call.
export async function healthCheck(): Promise<HealthResponse> {
  try {
    const res = await api<HealthResponse>("/api/health", { method: "GET" });
    return { ...res, source: "health" };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      // fallback: if projects endpoint responds, backend + proxy are alive
      await api<any>("/api/projects?limit=1", { method: "GET" });
      return { ok: true, message: "fallback ok", source: "projects" };
    }
    throw e;
  }
}