// 후원(pledge) 관련 API 모듈
// - 프로젝트에 대한 후원 생성 요청을 백엔드로 보내는 함수들을 모아둔 파일입니다.

// src/api/pledges.api.ts

// 공통 HTTP 래퍼(fetch wrapper)
// - base URL(import.meta.env.VITE_API_URL) + path를 합쳐 요청을 보내고
// - JSON 직렬화/헤더 세팅/에러 처리 등을 통합 관리하는 유틸입니다.
import { http } from "./http";

// 후원 생성(Create Pledge) 요청 바디(payload) 타입 정의
// - 프론트가 백엔드에 POST로 전달하는 데이터 구조를 명확히 고정합니다.
// - donorAddress: 후원자 지갑 주소 (Sui address)
// - amount: 후원 금액(단위는 백엔드/기획에서 정한 기준에 따름: 예: SUI, Mist 등)
// - txDigest: 온체인 트랜잭션 식별자(트랜잭션 해시/다이제스트)
//   -> “실제로 결제가/전송이 일어났는지”를 백엔드가 검증/기록할 때 사용될 수 있습니다.
export type CreatePledgePayload = {
  donorAddress: string;
  amount: number;
  txDigest: string;
};

// 특정 프로젝트(projectId)에 대해 후원을 생성하는 API 호출 함수
// - URL: /api/projects/:projectId/pledges
// - Method: POST
// - Body: CreatePledgePayload(JSON)
// - 반환값: http()가 반환하는 Promise(보통 Response JSON 또는 커스텀 결과)
//   -> 사용처에서 await로 처리하거나, React Query 등으로 연결 가능
export function createPledge(projectId: string, payload: CreatePledgePayload) {
  // 템플릿 리터럴로 프로젝트 ID를 URL path에 주입
  // 예: projectId="123" => /api/projects/123/pledges
  return http(`/api/projects/${projectId}/pledges`, "POST", payload);
}