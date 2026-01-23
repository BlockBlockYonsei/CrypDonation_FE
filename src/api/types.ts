// DTO/Response type

// src/api/types.ts

export type WalletAddress = string;

export type ProjectStatus = "live" | "successful" | "ended" | "all";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type HealthResponse = {
  ok: boolean;
  message: string;
  ts: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: Exclude<ProjectStatus, "all">;
  coverUrl: string;
  goalAmount: number;
  raisedAmount: number;
  supporters: number;
  daysLeft: number;
  createdAt: string;
  creator: {
    walletAddress: WalletAddress;
    verified: boolean;
    pastProjects: number;
  };
};

export type CreateProjectBody = {
  title: string;
  goalAmount: number;
  description?: string;
  category?: string;
  coverUrl?: string;
  daysLeft?: number;
  creator?: {
    walletAddress: WalletAddress;
    verified?: boolean;
    pastProjects?: number;
  };
};

export type UpdateProjectBody = Partial<CreateProjectBody> & {
  status?: Exclude<ProjectStatus, "all">;
};

export type FundingItem = {
  id: string;
  projectId: string;
  fromWallet: WalletAddress;
  amount: number;
  token: string; // "SUI" 등
  message: string;
  txHash: string | null;
  createdAt: string;
};

export type FundingSummaryResponse = {
  projectId: string;
  goalAmount: number;
  raisedAmount: number;
  supporters: number;
  items: FundingItem[];
  meta: PaginationMeta;
};

export type CreateFundingBody = {
  fromWallet: WalletAddress;
  amount: number;
  token?: string;
  message?: string;
  txHash?: string | null;
};

export type UserStatsResponse = {
  walletAddress: WalletAddress;
  createdCount: number;
  fundedCount: number;
  totalFundedAmount: number;
};

export type UserProjectsResponse = Paginated<Project>;

export type UserTransactionsResponse = {
  walletAddress: WalletAddress;
  items: Array<{
    id: string;
    type: "funding";
    projectId: string;
    amount: number;
    token: string;
    txHash: string | null;
    createdAt: string;
  }>;
};