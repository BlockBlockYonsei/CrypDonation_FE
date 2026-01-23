// src/api/http.ts
// HTTP Client (fetch wrapper)
// - VITE_API_URL을 API base로 사용하고, 미설정 시 http://localhost:4000 으로 fallback
// - JSON 요청/응답을 기본으로 하며, res.ok가 아니면 status + body(text)를 포함해 Error throw
// - 사용처에서 제네릭 T로 응답 타입을 지정해 타입 안정성 확보

// Config
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// Types
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// API
// - http<T>(path, method, body): 공통 fetch 래퍼
//   - body가 있으면 JSON.stringify 후 전송
//   - 실패(res.ok=false) 시 응답 text를 읽어 에러 메시지에 포함
export async function http<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}