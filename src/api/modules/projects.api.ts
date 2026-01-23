// src/api/modules/projects.api.ts
import { api } from "../https";
import type { Paginated, Project, CreateProjectBody, UpdateProjectBody, ProjectStatus } from "../types";

export type ProjectsListQuery = {
  category?: string;
  status?: ProjectStatus; // "all" 포함
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

export const ProjectsApi = {
  list: (query?: ProjectsListQuery) =>
    api<Paginated<Project>>(`/api/projects${toQS(query)}`, { method: "GET" }),

  get: (projectId: string) =>
    api<Project>(`/api/projects/${projectId}`, { method: "GET" }),

  create: (body: CreateProjectBody) =>
    api<Project>(`/api/projects`, { method: "POST", body }),

  update: (projectId: string, body: UpdateProjectBody) =>
    api<Project>(`/api/projects/${projectId}`, { method: "PUT", body }),

  remove: (projectId: string) =>
    api<void>(`/api/projects/${projectId}`, { method: "DELETE" }),
};