// src/api/modules/users.api.ts
import { api } from "../https";
import type { UserStatsResponse, UserProjectsResponse, UserTransactionsResponse } from "../types";

export const UsersApi = {
  stats: (walletAddress: string) =>
    api<UserStatsResponse>(`/api/users/${walletAddress}/stats`, { method: "GET" }),

  projects: (walletAddress: string, type: "created" | "funded") =>
    api<UserProjectsResponse>(`/api/users/${walletAddress}/projects?type=${type}`, {
      method: "GET",
    }),

  transactions: (walletAddress: string) =>
    api<UserTransactionsResponse>(`/api/users/${walletAddress}/transactions`, { method: "GET" }),
};