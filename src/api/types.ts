// ------------
// COMMON
// ------------

// DTO/Response type

// src/api/types.ts

// [COMMON] 지갑 주소 타입 (Used in: many)
export type WalletAddress = string;

// [PROJECT] 프로젝트 상태 구분 (Used in: GET /api/projects?status=live)
export type ProjectStatus = "live" | "successful" | "ended" | "all";

// [COMMON] 페이지네이션 메타 정보 (Used in: GET /api/projects?page=1)
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// [COMMON] 페이지네이션 래퍼 제네릭 (Used in: list responses)
export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

// [COMMON] 서버 헬스체크 응답 (Used in: GET /api/health)
export type HealthResponse = {
  ok: boolean;
  message: string;
  ts: string;
};

// [COMMON] 성공 여부 응답 타입 (Used in: DELETE /api/projects/:id)
export type OkResponse = {
  ok: boolean;
  message?: string;
};

// ------------
// PROJECT API
// ------------

// [PROJECT] 프로젝트 정보 (Used in: GET /api/projects/:id)
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

// [PROJECT] 프로젝트 생성 요청 바디 (Used in: POST /api/projects)
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

// [PROJECT] 프로젝트 수정 요청 바디 (Used in: PATCH /api/projects/:id)
export type UpdateProjectBody = Partial<CreateProjectBody> & {
  status?: Exclude<ProjectStatus, "all">;
};

// [PROJECT] 프로젝트 수정 응답 타입 (Used in: PATCH /api/projects/:id)
export type UpdateProjectResponse = Project;

// [PROJECT] 프로젝트 삭제 응답 타입 (Used in: DELETE /api/projects/:id)
export type DeleteProjectResponse = OkResponse & {
  projectId: string;
};

// ------------
// FUNDING API
// ------------

// [FUNDING] 후원 내역 아이템 (Used in: GET /api/projects/:id/funding)
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

// [FUNDING] 프로젝트 후원 요약 응답 (Used in: GET /api/projects/:id/funding/summary)
export type FundingSummaryResponse = {
  projectId: string;
  goalAmount: number;
  raisedAmount: number;
  supporters: number;
  items: FundingItem[];
  meta: PaginationMeta;
};

// [FUNDING] 후원 생성 요청 바디 (Used in: POST /api/funding)
export type CreateFundingBody = {
  fromWallet: WalletAddress;
  amount: number;
  token?: string;
  message?: string;
  txHash?: string | null;
};

// ------------
// USER API
// ------------

// [USER] 유저 통계 응답 (Used in: GET /api/users/:wallet/stats)
export type UserStatsResponse = {
  walletAddress: WalletAddress;
  createdCount: number;
  fundedCount: number;
  totalFundedAmount: number;
};

// [USER] 유저가 만든 프로젝트 목록 (Used in: GET /api/users/:wallet/projects)
export type UserProjectsResponse = Paginated<Project>;

// [USER] 유저 후원(트랜잭션) 내역 (Used in: GET /api/users/:wallet/transactions)
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

// ------------
// MANAGING API (CREATOR ONLY)
// ------------

/**
 * [MANAGING] (컨트랙트 기반) 출금/정산 플로우는 "서버가 돈을 보내는" 방식이 아니라,
 * 1) 서버가 '서명할 트랜잭션'을 만들어 주고(prepare)
 * 2) 프론트가 지갑으로 서명+실행한 뒤
 * 3) 실행 결과(txDigest)를 서버에 기록/검증(confirm)
 */

// [MANAGING] 프로젝트 접근 권한 응답 (Used in: GET /api/projects/:id/manage/access)
export type ProjectAccessResponse = {
  projectId: string;
  viewerWallet: WalletAddress;
  isOwner: boolean;
  role: "creator" | "supporter";
};

// [MANAGING] 출금 준비 요청 바디 (Used in: POST /api/projects/:id/withdraw/prepare)
export type WithdrawPrepareBody = {
  amount?: number;
  recipient?: WalletAddress;
};

// [MANAGING] 출금 준비 응답 (Used in: POST /api/projects/:id/withdraw/prepare)
export type WithdrawPrepareResponse = {
  projectId: string;
  txBytes: string;
  requestId: string;
  expectedAmount?: number;
  token?: string;
};

// [MANAGING] 출금 확정 요청 바디 (Used in: POST /api/projects/:id/withdraw/confirm)
export type WithdrawConfirmBody = {
  requestId: string;
  txDigest: string;
};

// [MANAGING] 출금 영수증 (Used in: POST /api/projects/:id/withdraw/confirm)
export type WithdrawReceipt = {
  projectId: string;
  txDigest: string;
  withdrewAmount: number;
  token: string;
  to: WalletAddress;
  executedAt: string;
};

// [MANAGING] 출금 확정 응답 (Used in: POST /api/projects/:id/withdraw/confirm)
export type WithdrawConfirmResponse = OkResponse & {
  receipt?: WithdrawReceipt;
};

// [MANAGING] 출금 가능 여부 조회 응답 (Used in: GET /api/projects/:id/withdraw/eligibility)
export type WithdrawEligibilityResponse = {
  projectId: string;
  isOwner: boolean;
  withdrawable: boolean;
  withdrawableAmount: number;
  reason?: "NOT_OWNER" | "NOT_ENDED" | "ZERO_BALANCE" | "LOCKED";
};
