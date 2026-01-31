// src/api/modules/funding.api.ts
import { api } from "../https";
import type { FundingSummaryResponse, FundingItem, CreateFundingBody } from "../types";

export type FundingQuery = {
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

export const FundingApi = {
  // Backend funding route: GET /api/funding/:projectId?page=&limit=
  getByProject: (projectId: string, query?: FundingQuery) =>
    api<FundingSummaryResponse>(`/api/funding/${projectId}${toQS(query)}`, {
      method: "GET",
    }),

  // Backend funding route: POST /api/funding/:projectId
  create: (projectId: string, body: CreateFundingBody) =>
    api<FundingItem>(`/api/funding/${projectId}`, {
      method: "POST",
      body,
    }),
};