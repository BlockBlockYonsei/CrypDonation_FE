좋아. 지금 네 FE 구조(Vite + React + TS, src/api 모듈화, mockData 존재, pages/components 분리) 기준으로 “새 팀원이 그대로 따라하면 실행되는” README 초안 만들어줄게. 아래 그대로 README.md에 붙여 넣으면 돼.

⸻

Crypto Crowdfunding Platform 2 (FE)

Vite + React + TypeScript 기반의 프론트엔드 프로젝트입니다.
프로젝트 탐색/상세/후원(FundingPanel)/유저페이지 등 UI를 제공하며, API는 /src/api 모듈을 통해 호출합니다.

⸻

1) Requirements
	•	Node.js: 18+ 권장 (팀에서 Node 20 사용 중이면 20 권장)
	•	Yarn (프로젝트는 Yarn 기반)
	•	(선택) VSCode

⸻

2) Install & Run

Install

yarn

Run (Dev)

yarn dev

실행 후:
	•	http://localhost:5173

Build

yarn build

Preview (빌드 결과 로컬 서빙)

yarn preview


⸻

3) Environment Variables

루트에 .env 파일이 있습니다.

예시(프로젝트에 맞게 키 이름은 실제 .env를 확인하세요):

# 예) 백엔드 API base url을 분리하는 경우
VITE_API_BASE_URL=http://localhost:4000

중요: FE는 보통 /api/... 로 요청을 보내므로, 개발 환경에서 백엔드가 다른 포트(예: 4000)라면 vite.config.ts의 proxy 또는 VITE_API_BASE_URL 설정이 필요합니다.

⸻

4) API 호출 구조

API 모듈 위치:
	•	src/api/https.ts : 공통 fetch 래퍼(에러 처리/헤더/베이스 URL)
	•	src/api/types.ts : DTO/Response 타입 정의
	•	src/api/modules/*.api.ts : 도메인별 API 모듈

예시:
	•	src/api/modules/projects.api.ts
	•	src/api/modules/funding.api.ts
	•	src/api/modules/users.api.ts

Funding API 예시
	•	GET /api/funding/:projectId?page=&limit= : 프로젝트 후원 내역 조회
	•	POST /api/funding/:projectId : 후원 내역 기록(보통 컨트랙트 성공 이후 기록용)

컨트랙트로 실제 송금(온체인)은 별도 로직이며, funding.api.ts는 “후원 히스토리/집계/서포터 리스트” 같은 UI 표시용 데이터 저장/조회에 주로 사용합니다.

⸻

5) 주요 페이지 흐름

src/pages 기준:
	•	LandingPage.tsx : 랜딩
	•	ExplorePage.tsx : 프로젝트 리스트 탐색
	•	ProjectDetailPage.tsx : 프로젝트 상세 + 후원 버튼 → FundingPanel 오픈
	•	FundingFullPage.tsx : 후원 히스토리/전체 리스트 페이지 (프로젝트 구조에 따라 다를 수 있음)
	•	ProjectManagePage.tsx : 프로젝트 관리 페이지
	•	StartProjectWizard.tsx : 프로젝트 생성/등록 플로우
	•	UserPage.tsx : 유저 프로필(내 프로젝트/후원한 프로젝트/트랜잭션 등)

“후원” UI 흐름(중요)
	1.	사용자가 ProjectDetailPage에서 Fund This Project 클릭
	2.	FundingPanel이 열림 (src/components/FundingPanel.tsx)
	3.	(향후) 컨트랙트 호출로 실제 송금
	4.	성공 시 FundingApi.create()로 DB에 기록
	5.	FundingApi.getByProject()로 후원 내역 표시

⸻

6) Mock 데이터
	•	src/data/mockData.ts

백엔드가 준비되지 않았거나 API 응답 shape이 불완전할 때, UI 확인용으로 사용합니다.
단, 실제 API 응답과 mock shape이 다르면 런타임 에러가 날 수 있으므로, 페이지 단에서 normalize 처리(기본값/필수 필드 보장)를 권장합니다.

⸻

7) 프로젝트 구조(요약)

src/
  api/
    https.ts
    types.ts
    modules/
      funding.api.ts
      managing.api.ts
      projects.api.ts
      users.api.ts
  components/
    FundingPanel.tsx
    Navigation.tsx
    ProjectCard.tsx
    ui/...
  data/
    mockData.ts
  pages/
    LandingPage.tsx
    ExplorePage.tsx
    ProjectDetailPage.tsx
    ProjectManagePage.tsx
    StartProjectWizard.tsx
    UserPage.tsx
  queries/
    projects.queries.ts
    users.queries.ts
  styles/
    globals.css
  main.tsx
  App.tsx


⸻

8) Troubleshooting

(1) /api/... 요청이 실패(404/500/CORS)
	•	백엔드 실행 여부 확인
	•	vite.config.ts proxy 설정 확인 또는 VITE_API_BASE_URL 확인
	•	Network 탭에서 실제 요청 URL이 /api/api/...로 중복되는지 확인
	•	중복이면 api() 래퍼가 /api를 붙이는데 모듈에서도 /api를 붙인 케이스일 수 있음

(2) “Fund This Project 눌렀는데 패널이 안 뜸”

대부분 FundingPanel 렌더 중 런타임 에러가 원인입니다.
	•	예: project.rewards.map에서 rewards가 undefined면 즉시 크래시
→ rewards 기본값 처리(Array.isArray(...) ? ... : []) 또는 페이지 normalize 권장

⸻

9) Commands

yarn dev       # 개발 서버 실행
yarn build     # 프로덕션 빌드
yarn preview   # 빌드 결과 프리뷰


⸻