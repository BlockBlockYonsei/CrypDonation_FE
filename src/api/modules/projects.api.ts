// src/api/modules/projects.api.ts
import { api } from "../https";
import type { Paginated, Project, CreateProjectBody, UpdateProjectBody, ProjectStatus } from "../types";

export type ProjectsListQuery = {
  category?: string;
  status?: ProjectStatus | "all"; // BE는 "all"을 허용
  sort?: "trending" | "new" | "ending-soon";
  page?: number;
  limit?: number;
};

function toQS(query?: Record<string, unknown>) {
  if (!query) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ✅ Auth header helper
// - BE auth.js: Authorization: Bearer <token> (recommended)
// - Dev: x-wallet-address 허용
function authHeaders(opts?: { walletAddress?: string; token?: string }) {
  const headers: Record<string, string> = {};

  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;
  if (opts?.walletAddress) headers["x-wallet-address"] = opts.walletAddress;

  return Object.keys(headers).length ? headers : undefined;
}

export const ProjectsApi = {
  list: (query?: ProjectsListQuery) =>
    api<Paginated<Project>>(`/api/projects${toQS(query)}`, { method: "GET" }),

  get: (projectId: string) =>
    api<Project>(`/api/projects/${projectId}`, { method: "GET" }),

  create: (body: CreateProjectBody, opts?: { walletAddress?: string; token?: string }) =>
    api<Project>(`/api/projects`, { method: "POST", body, headers: authHeaders(opts) }),

  // On-chain(Wizard) publish 이후 digest를 BE로 보내 DB에 upsert
  sync: (digest: string, opts?: { walletAddress?: string; token?: string }) =>
    api<{ projectId: string; digest: string }>(`/api/projects/sync`, {
      method: "POST",
      body: { digest },
      headers: authHeaders(opts),
    }),

  update: (projectId: string, body: UpdateProjectBody, opts?: { walletAddress?: string; token?: string }) =>
    api<Project>(`/api/projects/${projectId}`, { method: "PATCH", body, headers: authHeaders(opts) }),

  remove: (projectId: string, opts?: { walletAddress?: string; token?: string }) =>
    api<void>(`/api/projects/${projectId}`, { method: "DELETE", headers: authHeaders(opts) }),
};