// src/api/modules/managing.api.ts
import { api } from "../https";

export type ManageRole = "creator" | "viewer";

export type ManageAccessResponse = {
  role: ManageRole;
  canManage: boolean;
  canDelete: boolean;
  canWithdraw: boolean;
};

type AuthOpts = { walletAddress?: string; token?: string };

function authHeaders(opts?: AuthOpts) {
  const headers: Record<string, string> = {};
  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;
  if (opts?.walletAddress) headers["x-wallet-address"] = opts.walletAddress;
  return Object.keys(headers).length ? headers : undefined;
}

function enc(id: string) {
  return encodeURIComponent(id);
}

export const ManagingApi = {
  access: (projectId: string, opts?: AuthOpts) =>
    api<ManageAccessResponse>(`/api/projects/${enc(projectId)}/access`, {
      method: "GET",
      headers: authHeaders(opts),
    }),

  remove: (projectId: string, opts?: AuthOpts) =>
    api<void>(`/api/projects/${enc(projectId)}`, {
      method: "DELETE",
      headers: authHeaders(opts),
    }),

  getProject: <T = any>(projectId: string, opts?: AuthOpts) =>
    api<T>(`/api/projects/${enc(projectId)}`, {
      method: "GET",
      headers: authHeaders(opts),
    }),
};
