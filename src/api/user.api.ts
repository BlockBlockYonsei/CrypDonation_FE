// 유저(User) 관련 API 모듈
// - 특정 지갑 주소(address)에 연결된 유저 통계/프로젝트/트랜잭션 데이터를 백엔드에서 조회합니다.

// src/api/user.api.ts

// 공통 HTTP 래퍼(fetch wrapper)
// - base URL(import.meta.env.VITE_API_URL) + path를 합쳐 요청을 보내고
// - JSON 직렬화/헤더 세팅/에러 처리 등을 통합 관리하는 유틸입니다.
import { http } from "./http";

// 유저 통계(UserStats) 응답 타입
// - /api/users/:address/stats 응답(JSON)의 구조를 타입으로 고정합니다.
// - createdCount: 해당 유저가 생성한 프로젝트 수
// - fundedCount: 해당 유저가 후원한 프로젝트 수
// - totalRaised: (생성한 프로젝트 기준) 누적 모금액
// - totalContributed: (후원 기준) 누적 기여액
//   -> 현재 string으로 되어 있는데, 백엔드에서 통화 단위/소수점 표현을 문자열로 내려줄 가능성이 있어
//      일단 string으로 안전하게 잡은 것으로 보입니다.
//      (스펙 확정 후 number로 바꿀지, 또는 "123.45 SUI" 같은 포맷 문자열로 유지할지 결정 권장)
export type UserStats = {
  createdCount: number;
  fundedCount: number;
  totalRaised: number;
  totalContributed: string;
};

// 유저 통계 조회 API
// - URL: /api/users/:address/stats
// - Method: GET
// - address: Sui 지갑 주소(유저 식별자 역할)
// - 반환값: UserStats
export function getUserStats(address: string) {
  // 템플릿 리터럴로 address를 path에 주입
  // 예: address="0xabc..." => /api/users/0xabc.../stats
  return http<UserStats>(`/api/users/${address}/stats`);
}

// 유저의 프로젝트 목록 조회 API
// - URL: /api/users/:address/projects?type=created|funded
// - Method: GET
// - type 파라미터로 조회 범위를 구분
//   - "created": 내가 만든 프로젝트 목록
//   - "funded": 내가 후원한 프로젝트 목록
// - 반환값: 프로젝트 배열
//   -> 현재는 http<any[]>()로 느슨하게 두었지만,
//      백엔드 응답 스펙이 확정되면 Project 타입을 만들어 http<Project[]>()로 바꾸는 것을 권장합니다.
export function getUserProjects(address: string, type: "created" | "funded") {
  // 쿼리스트링에 type을 붙여 백엔드가 created/funded를 구분해 조회하도록 요청
  return http<any[]>(`/api/users/${address}/projects?type=${type}`);
}

// 유저 트랜잭션(후원/정산 등) 목록 조회 API
// - URL: /api/users/:address/transactions
// - Method: GET
// - 반환값: 트랜잭션 배열
//   -> 역시 스펙 확정 전이라 any[]로 처리되어 있습니다.
//      추후 Transaction 타입 정의 후 http<Transaction[]>()로 강타입 추천
export function getUserTransactions(address: string) {
  return http<any[]>(`/api/users/${address}/transactions`);
}