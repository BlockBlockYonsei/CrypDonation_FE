// src/queries/users.queries.ts

import { useQuery } from "@tanstack/react-query";
import { UsersApi } from "../api/modules/users.api";

// Query Keys (캐싱/무효화 기준)
export const userKeys = {
  all: ["user"] as const,
  byAddress: (walletAddress: string) => [...userKeys.all, walletAddress] as const,
  stats: (walletAddress: string) => [...userKeys.byAddress(walletAddress), "stats"] as const,
  projects: (walletAddress: string, type: "created" | "funded") =>
    [...userKeys.byAddress(walletAddress), "projects", type] as const,
  transactions: (walletAddress: string) =>
    [...userKeys.byAddress(walletAddress), "transactions"] as const,
};

// /api/users/:walletAddress/stats
export function useUserStats(walletAddress?: string) {
  return useQuery({
    queryKey: walletAddress ? userKeys.stats(walletAddress) : userKeys.all,
    queryFn: () => {
      if (!walletAddress) throw new Error("walletAddress is required");
      return UsersApi.stats(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 30_000, // 30s
  });
}

// /api/users/:walletAddress/projects?type=created|funded
export function useUserProjects(walletAddress?: string, type: "created" | "funded" = "created") {
  return useQuery({
    queryKey: walletAddress ? userKeys.projects(walletAddress, type) : userKeys.all,
    queryFn: () => {
      if (!walletAddress) throw new Error("walletAddress is required");
      return UsersApi.projects(walletAddress, type);
    },
    enabled: !!walletAddress,
    staleTime: 30_000,
  });
}

// /api/users/:walletAddress/transactions
export function useUserTransactions(walletAddress?: string) {
  return useQuery({
    queryKey: walletAddress ? userKeys.transactions(walletAddress) : userKeys.all,
    queryFn: () => {
      if (!walletAddress) throw new Error("walletAddress is required");
      return UsersApi.transactions(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 10_000,
  });
}