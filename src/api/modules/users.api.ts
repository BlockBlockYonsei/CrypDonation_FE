// src/api/modules/users.api.ts
import { api } from "../https";
import type { UserStatsResponse, UserProjectsResponse, UserTransactionsResponse } from "../types";

// 프로필 응답 타입은 아직 types.ts에 없으니 여기서 로컬로 정의(원하면 types.ts로 이동)
export type UserProfile = {
  displayName: string;
  description: string;
};

export type UserProfileResponse = {
  ok: boolean;
  walletAddress: string;
  profile: UserProfile;
};

export const UsersApi = {
  stats: (walletAddress: string) =>
    api<UserStatsResponse>(`/api/users/${encodeURIComponent(walletAddress)}/stats`, { method: "GET" }),

  projects: (walletAddress: string, type: "created" | "funded") =>
    api<UserProjectsResponse>(
      `/api/users/${encodeURIComponent(walletAddress)}/projects?type=${encodeURIComponent(type)}`,
      { method: "GET" }
    ),

  transactions: (walletAddress: string) =>
    api<UserTransactionsResponse>(`/api/users/${encodeURIComponent(walletAddress)}/transactions`, {
      method: "GET",
    }),

  // ✅ 프로필 불러오기(영구 저장한 값 표시)
  profile: (walletAddress: string) =>
    api<UserProfileResponse>(`/api/users/${encodeURIComponent(walletAddress)}/profile`, {
      method: "GET",
    }),

  // ✅ 프로필 수정(서버 DB에 upsert)
  updateProfile: (walletAddress: string, body: UserProfile) =>
    api<UserProfileResponse>(`/api/users/${encodeURIComponent(walletAddress)}/profile`, {
      method: "PATCH",
      body,
    }),
};
