// src/pages/UserPage.tsx
// [0] 사용자 프로필(User) 페이지: 지갑 주소/잔액 요약과 함께
//     (1) 내가 만든 프로젝트 (2) 내가 후원한 프로젝트 (3) 트랜잭션 히스토리를 탭으로 전환해 보여주는 UI.
//     현재는 walletAddress/walletBalance 및 fundedProjects가 하드코딩/목업이며,
//     추후에는 connectedWalletAddress(localStorage) + 인덱서/백엔드/Sui RPC를 통해 실제 데이터로 교체 필요.

// [1] React state: 활성 탭(activeTab)을 관리(생성/후원/트랜잭션)
import { useEffect, useMemo, useState } from 'react';
// [2] 라우팅: 프로젝트 상세(/project/:id), 프로젝트 생성 위저드(/start-project) 등으로 이동
import { Link } from 'react-router-dom';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
// [3] 아이콘(lucide-react): 지갑/복사/외부링크/시간 표시 등 UI 시각 요소
import { Wallet, Copy, ExternalLink, Clock } from 'lucide-react';
// [4] 공통 네비게이션
import Navigation from '../components/Navigation';
// [5] 목업 데이터
//     - mockProjects: 프로젝트 목록(내가 만든/후원한 프로젝트 표시용)
//     - userTransactions: 트랜잭션 히스토리(목업)
//     추후 실제로는 지갑 주소 기준으로 인덱서/백엔드에서 조회해야 함


// [6] 탭 타입: UI 탭 버튼과 1:1 매핑

type TabType = 'created' | 'funded' | 'transactions';

// =========================
// Backend 연동용 타입/헬퍼
// =========================
type ApiProject = {
  id: string;
  title: string;
  description?: string | null;
  goalAmount: number;
  ownerAddress: string;
  createdAt: string;
};

type ApiFundedProject = ApiProject;

type ApiUserTx = {
  id: string;
  type: 'funded' | 'created';
  projectId?: string;
  projectTitle: string;
  date: string;      // ISO 또는 표시용 문자열
  txHash: string;    // Sui digest
  amount: number;    // 표시용(USD 등). 없으면 0
};

type ApiUserStats = {
  createdCount: number;
  fundedCount: number;
  totalRaised: number;        // USD(또는 표시 통화)
  totalContributed: string;   // SUI 단위 표시용 문자열 (예: "123.456")
};

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL ?? '';

async function apiGetJson<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    // 기본은 GET. 호출부에서 method를 바꾸고 싶으면 opts로 override 가능
    method: 'GET',
    // GET에서 Content-Type을 강제로 넣으면 CORS preflight(OPTIONS)를 유발할 수 있어 제거
    headers: {
      Accept: 'application/json',
      ...(opts?.headers ?? {}),
    },
    // 쿠키/세션을 쓰는 경우에만 필요. 토큰 방식이면 제거 가능
    credentials: 'include',
    ...opts,
  });

  const ct = res.headers.get('content-type') || '';

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Request failed: ${res.status} ${res.statusText} (url=${url})\n` +
        (text ? text.slice(0, 300) : '')
    );
  }

  // JSON이 아니면(예: HTML) 디버깅이 쉽도록 앞부분만 포함해 에러
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Expected JSON but got '${ct}' (url=${url})\n` +
        (text ? text.slice(0, 300) : '')
    );
  }

  return (await res.json()) as T;
}

// 다른 페이지(펀딩/프로젝트 생성)에서 성공 후 아래 이벤트를 dispatch 해주면
// UserPage가 자동으로 재조회하도록 해두었습니다.
// 예: window.dispatchEvent(new CustomEvent('user-data-changed'))
const USER_DATA_CHANGED_EVENT = 'user-data-changed';

export default function UserPage() {
  // [7] activeTab: 현재 선택된 탭. 기본값은 'created'
  const [activeTab, setActiveTab] = useState<TabType>('created');
  // [7-1] 복사 피드백 표시(짧게 노출)
  const [copied, setCopied] = useState<boolean>(false);

  // [PROFILE EDIT MODAL STATE]
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>('My Profile');
  const [profileDescription, setProfileDescription] = useState<string>('Manage your projects and contributions');

  // [8] dApp Kit: 현재 연결된 지갑 주소(account)와 SuiClient(RPC)를 통해 잔액을 조회
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const walletAddress = account?.address ?? '';

  // [8-0] 복사 유틸: Clipboard API 실패 시 fallback까지 처리
  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // fall through
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(ta);
    }
  };

  // [8-1] SUI 잔액(표시용). Sui RPC는 Mist(1e9 Mist = 1 SUI) 단위로 내려오므로 변환 필요
  const [walletBalanceSui, setWalletBalanceSui] = useState<string>('—');
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);

  // [8-2] Explorer URL (기본: Testnet). 필요 시 네트워크 컨텍스트에 맞춰 변경 가능
  const explorerAddressUrl = useMemo(() => {
    if (!walletAddress) return '';
    return `https://suiscan.xyz/testnet/account/${walletAddress}/portfolio`;
  }, [walletAddress]);

  // [8-3] 잔액 조회
  useEffect(() => {
    let cancelled = false;

    async function fetchBalance() {
      if (!walletAddress) {
        setWalletBalanceSui('—');
        return;
      }

      try {
        setBalanceLoading(true);
        // coinType 미지정 시 기본 SUI 잔액
        const bal = await suiClient.getBalance({ owner: walletAddress });
        const mist = BigInt(bal.totalBalance ?? '0');

        // Mist -> SUI (소수점 9자리)
        const WHOLE = mist / 1000000000n;
        const FRAC = (mist % 1000000000n).toString().padStart(9, '0');

        // 표시: 불필요한 trailing zeros 제거
        const fracTrimmed = FRAC.replace(/0+$/, '');
        const formatted = fracTrimmed.length > 0 ? `${WHOLE.toString()}.${fracTrimmed}` : WHOLE.toString();

        if (!cancelled) setWalletBalanceSui(`${formatted} SUI`);
      } catch {
        if (!cancelled) setWalletBalanceSui('N/A');
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    }

    fetchBalance();

    return () => {
      cancelled = true;
    };
  }, [suiClient, walletAddress]);


  // =========================
  // Backend에서 가져올 유저 데이터
  // =========================
  const [createdProjects, setCreatedProjects] = useState<ApiProject[]>([]);
  const [fundedProjects, setFundedProjects] = useState<ApiFundedProject[]>([]);
  const [transactions, setTransactions] = useState<ApiUserTx[]>([]);
  const [stats, setStats] = useState<ApiUserStats | null>(null);

  const [userDataLoading, setUserDataLoading] = useState<boolean>(false);
  const [userDataError, setUserDataError] = useState<string>('');

  const refetchUserData = async (addr: string) => {
    if (!addr) return;
    setUserDataError('');

    try {
      setUserDataLoading(true);

      // 아래 엔드포인트는 "전에 만든 백엔드"에 맞춰 경로만 바꿔주면 됩니다.
      // 권장 형태:
      //  - GET /api/users/:walletAddress/stats
      //  - GET /api/users/:walletAddress/projects?type=created
      //  - GET /api/users/:walletAddress/projects?type=funded
      //  - GET /api/users/:walletAddress/transactions
      const [s, created, funded, txs] = await Promise.all([
        apiGetJson<ApiUserStats>(`/api/users/${addr}/stats`),
        apiGetJson<ApiProject[]>(`/api/users/${addr}/projects?type=created`),
        apiGetJson<ApiFundedProject[]>(`/api/users/${addr}/projects?type=funded`),
        apiGetJson<ApiUserTx[]>(`/api/users/${addr}/transactions`),
      ]);

      setStats(s);
      setCreatedProjects(created ?? []);
      setFundedProjects(funded ?? []);
      setTransactions(txs ?? []);
    } catch (e: any) {
      setUserDataError(e?.message || 'Failed to load user data');
      setStats(null);
      setCreatedProjects([]);
      setFundedProjects([]);
      setTransactions([]);
    } finally {
      setUserDataLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!walletAddress) return;
    try {
      await apiGetJson(`/api/users/${walletAddress}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          description: profileDescription,
        }),
      });
      setIsEditModalOpen(false);
    } catch (e: any) {
      alert(e?.message || 'Failed to update profile');
    }
  };

  // 지갑이 바뀌면 유저 데이터를 다시 로딩
  useEffect(() => {
    if (!walletAddress) {
      setStats(null);
      setCreatedProjects([]);
      setFundedProjects([]);
      setTransactions([]);
      return;
    }

    refetchUserData(walletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  // 펀딩/생성 성공 후 이벤트가 발생하면 재조회
  useEffect(() => {
    const handler = () => {
      if (!walletAddress) return;
      refetchUserData(walletAddress);
    };

    window.addEventListener(USER_DATA_CHANGED_EVENT, handler as any);

    // 다른 탭에서 localStorage를 통해 신호를 주는 경우도 커버
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === USER_DATA_CHANGED_EVENT) handler();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(USER_DATA_CHANGED_EVENT, handler as any);
      window.removeEventListener('storage', onStorage);
    };
  }, [walletAddress]);

  // Helper: 주소 포맷 (예: 0x742d3.......Eb)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    // 예: 0x742d3.......Eb (앞 6자 + '.......' + 뒤 2자)
    const head = addr.slice(0, 6);
    const tail = addr.slice(-2);
    return `${head}.......${tail}`;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {userDataError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {userDataError}
          </div>
        )}
        {userDataLoading && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            Loading your profile data…
          </div>
        )}
        {/* [11] 헤더 섹션: 프로필 타이틀 + 'Create New Project' CTA */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">{displayName}</h1>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-sm px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Edit
                </button>
              </div>
              <p className="text-gray-600">{profileDescription}</p>
            </div>
            {/* [12] CTA: 새 프로젝트 생성 위저드로 이동 */}
            <Link
              to="/start-project"
              className="px-5 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
            >
              Create New Project
            </Link>
          </div>

          {/* [13] 지갑 요약 카드: 주소/복사/익스플로러 링크 + 잔액(목업) */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <span
                      className="font-mono text-gray-900 block truncate flex-1 min-w-0"
                      title={walletAddress || ''}
                    >
                      {walletAddress ? formatAddress(walletAddress) : 'Not connected'}
                    </span>
                    {/* [14] 복사 버튼: 클릭 시 walletAddress를 clipboard로 복사 */}
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      disabled={!walletAddress}
                      onClick={async () => {
                        if (!walletAddress) return;
                        await copyToClipboard(walletAddress);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1200);
                      }}
                      aria-label="Copy wallet address"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    {copied && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">Copied</span>
                    )}
                    {/* [15] 외부링크 버튼: Sui Explorer에서 주소/트랜잭션을 여는 링크 */}
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      disabled={!explorerAddressUrl}
                      onClick={() => {
                        if (!explorerAddressUrl) return;
                        window.open(explorerAddressUrl, '_blank', 'noopener,noreferrer');
                      }}
                      aria-label="Open in Sui Explorer"
                      title="Open in Explorer"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm text-gray-500 mb-1">Balance</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {balanceLoading ? 'Loading…' : walletBalanceSui}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* [16] 통계 요약: 생성/후원 개수, 총 모금액(내 프로젝트 합), 총 기여액(목업) */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Created Projects</div>
            <div className="text-3xl font-semibold text-gray-900">{stats?.createdCount ?? createdProjects.length}</div>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Funded Projects</div>
            <div className="text-3xl font-semibold text-gray-900">{stats?.fundedCount ?? fundedProjects.length}</div>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Total Raised</div>
            {/* [17] Total Raised: 내가 만든 프로젝트들의 raisedAmount 합계를 계산 */}
            <div className="text-3xl font-semibold text-gray-900">
              {stats ? `$${stats.totalRaised.toLocaleString()}` : '—'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Total Contributed</div>
            <div className="text-3xl font-semibold text-gray-900">
              {stats ? `${stats.totalContributed} SUI` : '—'}
            </div>
          </div>
        </div>

        {/* [18] 탭 레이아웃: created/funded/transactions를 activeTab으로 전환 */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* [19] 탭 헤더: 클릭 시 setActiveTab(tab.id)로 상태 변경 */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {/* [20] 탭 목록 렌더: activeTab과 비교해 선택 스타일 적용 */}
              {([
                { id: 'created', label: 'Created Projects' },
                { id: 'funded', label: 'Funded Projects' },
                { id: 'transactions', label: 'Transaction History' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 h-14 font-medium transition-colors relative ${
                    activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* [21] 탭 콘텐츠: activeTab 값에 따라 조건부 렌더링 */}
          <div className="p-8">
            {/* [22] Created 탭: createdProjects 목록 렌더 + 진행률 바 + 상태 배지 */}
            {activeTab === 'created' && (
              <div>
                {createdProjects.length > 0 ? (
                  <div className="space-y-4">
                    {createdProjects.map((project) => {
                      // Funding progress calculation disabled due to missing raisedAmount
                      const fundingPercentage = 0;

                      return (
                        <Link
                          key={project.id}
                          to={`/project/${project.id}`}
                          className="block border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-6">
                            {/* <img
                              src={project.thumbnailUrl}
                              alt={project.title}
                              className="w-32 h-32 object-cover rounded-lg"
                            /> */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">{project.description}</p>
                                </div>
                                {/* 상태 배지: removed (no status field) */}
                                {/* <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    project.status === 'live'
                                      ? 'bg-green-100 text-green-700'
                                      : project.status === 'successful'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </span> */}
                              </div>

                              <div className="mb-3">
                                {/* 진행률 바: fundingPercentage를 width로 적용 */}
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gray-900"
                                    style={{ width: `${fundingPercentage}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-6 text-sm">
                                <div>
                                  <span className="font-semibold text-gray-900">
                                    Goal: ${project.goalAmount.toLocaleString()}
                                  </span>
                                </div>
                                {/* <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{project.daysLeft} days left</span>
                                </div>
                                <div className="text-gray-600">
                                  {project.supporters} supporters
                                </div> */}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't created any projects yet</p>
                    <Link
                      to="/start-project"
                      className="inline-flex items-center px-5 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Create Your First Project
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* [27] Funded 탭(목업): fundedProjects 목록 렌더. 실제로는 후원 금액/리워드/tx를 연결해야 함 */}
            {activeTab === 'funded' && (
              <div>
                {fundedProjects.length > 0 ? (
                  <div className="space-y-4">
                    {fundedProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        className="block border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-6">
                          {/* <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          /> */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Your contribution: —</span>
                              {/* <span>•</span>
                              <span>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span> */}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't funded any projects yet</p>
                    <Link
                      to="/"
                      className="inline-flex items-center px-5 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Explore Projects
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* [28] Transactions 탭: userTransactions(목업) 기반 히스토리 렌더 */}
            {activeTab === 'transactions' && (
              <div>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {/* [29] 타입 배지: funded/created에 따라 라벨/색상 분기 */}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                tx.type === 'funded'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {tx.type === 'funded' ? 'Funded' : 'Created'}
                            </span>
                            <span className="font-medium text-gray-900">{tx.projectTitle}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{tx.date}</span>
                            <span>•</span>
                            {/* [30] txHash 표기(목업): 실제로는 Sui tx digest/해시 형태로 교체 필요 */}
                            <span className="font-mono text-xs">{tx.txHash}</span>
                            {/* [31] Explorer 링크(미구현): txHash를 Sui Explorer 트랜잭션 링크로 연결 */}
                            <button className="hover:text-gray-700">
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {/* [32] 금액 표시: amount가 0보다 큰 경우만 우측에 표기 */}
                        {tx.amount > 0 && (
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">${tx.amount.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      {/* [PROFILE EDIT MODAL] */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-lg p-6 border border-gray-300 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className="px-4 h-10 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  </div>
);
}