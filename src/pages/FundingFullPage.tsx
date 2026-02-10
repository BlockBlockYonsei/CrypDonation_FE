// src/pages/FundingFullPage.tsx
// Funding (결제/컨펌) 페이지
// - 특정 프로젝트(id)에 대해 펀딩 금액/리워드/슬리피지 등을 입력받고, 플랫폼 수수료 + 예상 가스비를 합산해 총 결제 예상액을 표시
// - 현재는 mockProjects 기반 UI이며, 실제 온체인 결제(Sui/Slush) 트랜잭션은 아직 미연결

// Imports
// - React hook: 입력값 상태 관리
// - Router: URL 파라미터(id) 및 뒤로가기 링크
// - Icons: UI 시각 요소
// - Components: Navigation
// - Mock data: 추후 API/인덱서/온체인 조회로 교체 예정
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Info, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';
import { api } from "../api/https";


// Types (UI에서 사용하는 최소 형태)
type Reward = {
  id: string;
  amount: number;
  title: string;
  description: string;
  available: number;
};

type FundingProject = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  goalAmount: number;
  daysLeft: number;
  rewards: Reward[];
};

export default function FundingFullPage() {

  
  // Routing & Data
  // - URL 파라미터(id)로 프로젝트를 식별
  // - 현재는 mockProjects에서 조회(추후 API/인덱서/온체인 조회로 교체)
  const { id } = useParams();

  function normalizeProject(raw: any): FundingProject | null {
    if (!raw) return null;
    const rewards = Array.isArray(raw.rewards) ? raw.rewards : [];
    return {
      id: String(raw.id ?? ''),
      title: String(raw.title ?? ''),
      description: String(raw.description ?? raw.oneLiner ?? ''),
      thumbnailUrl: String(raw.thumbnailUrl ?? raw.coverUrl ?? raw.thumbnailImageUrl ?? raw.coverImageUrl ?? ''),
      goalAmount: Number(raw.goalAmount ?? 0),
      daysLeft: Number(raw.daysLeft ?? raw.durationDays ?? 0),
      rewards: rewards.map((r: any) => ({
        id: String(r.id ?? ''),
        amount: Number(r.amount ?? 0),
        title: String(r.title ?? ''),
        description: String(r.description ?? ''),
        available: Number(r.available ?? 0),
      })),
    };
  }

  // API Data
  // - projects: 프로젝트 기본 정보(제목/커버/목표금액 등)
  // - funding : 프로젝트 펀딩 요약(raisedAmount/supporters/items/meta)
  // NOTE: UI는 그대로 두고, 데이터 소스만 API로 연결합니다.
  const [projectData, setProjectData] = useState<any | null>(null);
  const [fundingData, setFundingData] = useState<any | null>(null);
  const [loadingProject, setLoadingProject] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      setProjectData(null);
      setFundingData(null);
      setLoadingProject(false);
      return;
    }

    const ac = new AbortController();
    setLoadingProject(true);

    (async () => {
      try {
        // 1) 프로젝트 기본 정보는 /api/projects/:id (source of truth)
        const pJson = await api<any>(`/api/projects/${id}`, { method: "GET", signal: ac.signal });

        // 2) 펀딩 요약은 /api/funding/:id (없거나 404여도 프로젝트는 보여주기)
        let fJson: any = null;
        try {
          fJson = await api<any>(`/api/funding/${id}`, { method: "GET", signal: ac.signal });
        } catch {
          // funding endpoint may be missing/404; keep page usable
          fJson = null;
        }

        setProjectData(pJson);
        setFundingData(fJson);
      } catch {
        // Abort 포함: 조용히 처리
        setProjectData(null);
        setFundingData(null);
      } finally {
        setLoadingProject(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  const project: FundingProject | null = useMemo(() => {
    // 프로젝트 기본 정보가 있어야 페이지 렌더링 가능
    if (!projectData) return null;

    // funding 요약이 있으면 raisedAmount/supporters를 프로젝트 객체에 합쳐서 normalize
    const merged = fundingData
      ? {
          ...projectData,
          raisedAmount: fundingData.raisedAmount ?? projectData.raisedAmount,
          supporters: fundingData.supporters ?? projectData.supporters,
        }
      : projectData;

    return normalizeProject(merged);
  }, [projectData, fundingData]);

  // State
  // - amount: 사용자가 입력한 펀딩 금액(입력값 그대로 받기 위해 string)
  // - selectedReward: 선택한 리워드 티어 id(미선택은 빈 문자열)
  // - slippage: 슬리피지 허용치(현재 UI만 존재, 트랜잭션 파라미터 미연결)
  const [amount, setAmount] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<string>('');
  const [slippage, setSlippage] = useState<string>('0.5');

  // Guard
  // - 로딩 중에는 빈 화면(혹은 최소 메시지) 유지
  // - 로딩 완료 후에도 project가 없으면 not found
  if (loadingProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-[1440px] mx-auto px-8 py-16 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-[1440px] mx-auto px-8 py-16 text-center">
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  // Derived Values (Fees/Total)
  // - estimatedGasFee: 현재는 고정값 목업(실서비스에서는 네트워크/트랜잭션 유형에 따라 동적 산출 필요)
  // - platformFee: 입력 금액의 2%
  // - totalAmount: 펀딩금액 + 가스비 + 플랫폼 수수료
  //   (현재 UI에 USD/ETH 표기가 섞여 있으므로, 실제 서비스에서는 토큰/통화 단위를 일관되게 맞추는 것이 전제)
  const estimatedGasFee = 0.003;
  const platformFee = parseFloat(amount || '0') * 0.02;
  const totalAmount = parseFloat(amount || '0') + estimatedGasFee + platformFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {/* Back to Project */}
        <Link
          to={`/project/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Link>

        <div className="grid grid-cols-3 gap-8">
          {/* Left: Input Form */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Fund This Project</h1>

              {/* Project Snapshot */}
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex gap-4">
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    <div className="text-sm text-gray-500">
                      Goal: ${project.goalAmount.toLocaleString()} • {project.daysLeft} days left
                    </div>
                  </div>
                </div>
              </div>

              {/* Funding Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Funding Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-14 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  {[50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className="px-4 h-9 border border-gray-300 rounded-lg text-sm hover:border-gray-400 transition-colors"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Selection (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Select Reward (Optional)
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedReward('')}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      selectedReward === ''
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">No Reward</div>
                    <div className="text-sm text-gray-600">
                      Contribute without selecting a reward tier
                    </div>
                  </button>

                  {project.rewards.map((reward: Reward) => (
                    <button
                      key={reward.id}
                      onClick={() => setSelectedReward(reward.id)}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        selectedReward === reward.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-gray-900">${reward.amount}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {reward.available} available
                        </span>
                      </div>
                      <div className="font-medium text-sm text-gray-900 mb-1">{reward.title}</div>
                      <div className="text-sm text-gray-600">{reward.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Advanced Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Slippage Tolerance
                    </label>
                    <div className="flex gap-2">
                      {['0.1', '0.5', '1.0'].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSlippage(value)}
                          className={`px-4 h-10 border rounded-lg text-sm transition-colors ${
                            slippage === value
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {value}%
                        </button>
                      ))}
                      <input
                        type="number"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        placeholder="Custom"
                        className="w-24 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex gap-2 text-sm text-gray-700">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        Slippage tolerance affects the maximum price change you're willing to
                        accept during the transaction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details (sample placeholders) */}
            <div className="bg-white rounded-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Network</span>
                  <span className="font-medium text-gray-900">Ethereum Mainnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Contract Address</span>
                  <span className="font-mono text-xs text-gray-900">
                    0x1234...5678
                    <ExternalLink className="inline w-3 h-3 ml-1" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transaction Type</span>
                  <span className="font-medium text-gray-900">Smart Contract Interaction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary Sidebar */}
          <div className="col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Funding Amount</span>
                    <span className="font-medium">${amount || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (2%)</span>
                    <span className="font-medium">${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Gas Fee (Est.)</span>
                    <span className="font-medium">${estimatedGasFee.toFixed(3)} ETH</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Action (tx send/sign will be wired later) */}
                <button
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full h-12 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & Fund
                </button>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-900">
                    <p className="font-medium mb-1">Important Notice</p>
                    <p className="text-xs">
                      Cryptocurrency transactions are irreversible. Ensure all details are correct
                      before confirming.
                    </p>
                  </div>
                </div>
              </div>

              {/* Help / Documentation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
                <p className="text-xs text-gray-600 mb-3">
                  Learn more about our funding process and smart contract security.
                </p>
                <button className="text-sm text-gray-900 hover:underline">
                  View Documentation →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}