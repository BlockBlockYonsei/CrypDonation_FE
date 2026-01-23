// 프로젝트(Project) 관련 API 모듈
// - 프로젝트 목록 조회, 단일 프로젝트 조회, 프로젝트 생성 등의 요청을 백엔드로 전송합니다.

// src/api/projects.api.ts

// 공통 HTTP 래퍼(fetch wrapper)
// - base URL(import.meta.env.VITE_API_URL) + path를 합쳐 요청을 보내고
// - JSON 직렬화/헤더 세팅/에러 처리 등을 통합 관리하는 유틸입니다.
import { http } from "./http";

// 프로젝트 생성(Create Project) 요청 바디(payload) 타입 정의
// - 프론트가 백엔드에 POST로 전달하는 데이터 구조를 명확히 고정합니다.
// - ownerAddress: 프로젝트 소유자(생성자) 지갑 주소
// - title: 프로젝트 제목
// - description?: 프로젝트 설명(선택). 없을 수도 있으므로 optional(?) 처리
// - goalAmount: 목표 금액(단위는 백엔드/기획 기준에 따름: 예: SUI, Mist 등)
export type CreateProjectPayload = {
  ownerAddress: string;
  title: string;
  description?: string;
  goalAmount: number;
};

// 프로젝트 목록 조회 API
// - URL: /api/projects
// - Method: GET
// - 반환값: 프로젝트 배열
//   -> 현재는 http<any[]>()로 타입을 느슨하게 두었지만,
//      백엔드 응답 스펙이 확정되면 Project 타입을 만들어서 http<Project[]>()로 바꾸는 것을 권장합니다.
export function getProjects() {
  // 백틱(`)을 쓴 이유는 템플릿 문자열로 확장 가능하게 하기 위함이며,
  // 여기서는 단순 문자열과 동일하게 동작합니다.
  return http<any[]>(`/api/projects`);
}

// 단일 프로젝트 상세 조회 API
// - URL: /api/projects/:id
// - Method: GET
// - id: 프로젝트 식별자(백엔드에서 사용하는 ID)
// - 반환값: 단일 프로젝트 객체
//   -> 현재는 http<any>()로 타입을 느슨하게 두었습니다.
export function getProjectById(id: string) {
  // 템플릿 리터럴로 id를 URL path에 주입
  // 예: id="123" => /api/projects/123
  return http<any>(`/api/projects/${id}`);
}

// 프로젝트 생성 API
// - URL: /api/projects
// - Method: POST
// - Body: CreateProjectPayload(JSON)
// - 반환값: 생성 결과(백엔드 응답 스펙에 따라 생성된 프로젝트 객체 또는 성공 여부)
export function createProject(payload: CreateProjectPayload) {
  // 두 번째 인자로 "POST"를 넘겨 메서드를 지정하고,
  // 세 번째 인자로 payload를 넘겨 JSON body로 전송합니다.
  return http(`/api/projects`, "POST", payload);
}