// src/pages/ProjectDetailPage.tsx
// Project Detail 페이지
// - 특정 프로젝트(id)를 조회해 커버/소개/진행률 및 탭(Story/Updates/Supporters/Risks)을 표시
// - 간단 펀딩(FundingPanel) 오픈 또는 Full Funding(/funding/:id)으로 이동하는 진입점 제공
// - 현재는 mockProjects 기반 UI이며, 실제 온체인 상태는 인덱서/백엔드 데이터로 교체 예정

// Imports
// - React hook: 탭/모달 상태 관리
// - Router: URL 파라미터(id) 및 페이지 이동
// - Icons: UI 시각 요소
// - Components: Navigation, FundingPanel
// - Mock data: 추후 API/인덱서/온체인 조회로 교체 예정
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Users } from 'lucide-react';
import Navigation from '../components/Navigation';
import FundingPanel from '../components/FundingPanel';
import { mockProjects } from '../data/mockData';

// Types
// - 탭 헤더 버튼과 1:1 매핑
type TabType = 'story' | 'updates' | 'supporters' | 'risks';

export default function ProjectDetailPage() {
  // Routing & Data
  // - URL 파라미터(id)로 프로젝트를 식별
  // - 현재는 mockProjects에서 조회(추후 인덱서/백엔드/온체인 조회로 교체)
  const { id } = useParams();

  const project = mockProjects.find((p) => p.id === id);

  // State
  // - activeTab: 현재 선택된 탭(기본 Story)
  // - isFundingPanelOpen: 간단 펀딩 모달(FundingPanel) 오픈 여부
  const [activeTab, setActiveTab] = useState<TabType>('story');
  const [isFundingPanelOpen, setIsFundingPanelOpen] = useState(false);

  // Guard
  // - 유효하지 않은 id로 프로젝트를 찾지 못하면 안내 화면 렌더링
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-[1440px] mx-auto px-8 py-16 text-center">
          <p className="text-gray-500">Project not found</p>
          <Link to="/" className="text-gray-900 underline mt-4 inline-block">
            Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Derived
  // - 진행률(%) = (모금액 / 목표금액) * 100, 최대 100%로 클램프
  // - UI(progress bar width) 용도
  const fundingPercentage = Math.min((project.raisedAmount / project.goalAmount) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {/* Back to Explore */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>

        {/* Hero: cover + core stats + creator + CTAs */}
        <div className="bg-white rounded-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="aspect-[21/9] bg-gray-100">
            <img
              src={project.coverUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Hero Body Layout */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Left: project info + progress + stats */}
              <div className="col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">{project.category}</div>
                    <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                      {project.title}
                    </h1>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 transition-all"
                      style={{ width: `${fundingPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                      ${project.raisedAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      raised of ${project.goalAmount.toLocaleString()} goal
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                      {project.supporters}
                    </div>
                    <div className="text-sm text-gray-500">supporters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                      {project.daysLeft}
                    </div>
                    <div className="text-sm text-gray-500">days left</div>
                  </div>
                </div>
              </div>

              {/* Right: creator info + CTAs */}
              <div className="border-l border-gray-200 pl-8">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Created by</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Wallet address (short) */}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {project.creator.walletAddress.slice(0, 6)}...
                          {project.creator.walletAddress.slice(-4)}
                        </span>
                        {/* Verified badge */}
                        {project.creator.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.creator.pastProjects} past projects
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA: quick fund (modal) */}
                <button
                  onClick={() => setIsFundingPanelOpen(true)}
                  className="w-full h-12 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium mb-3"
                >
                  Fund This Project
                </button>

                {/* CTA: full funding page */}
                <Link
                  to={`/funding/${project.id}`}
                  className="block w-full h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center leading-[3rem] text-gray-900"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Tab Header */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {/* Tab Buttons */}
              {([
                { id: 'story', label: 'Story' },
                { id: 'updates', label: 'Updates' },
                { id: 'supporters', label: 'Supporters' },
                { id: 'risks', label: 'Risks & Disclosure' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 h-14 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
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

          {/* Tab Content */}
          <div className="p-8">
            {/* Story */}
            {activeTab === 'story' && (
              <div className="max-w-3xl">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.story}
                </p>
              </div>
            )}

            {/* Updates */}
            {activeTab === 'updates' && (
              <div className="max-w-3xl">
                {project.updates.length > 0 ? (
                  <div className="space-y-6">
                    {project.updates.map((update) => (
                      <div key={update.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="text-sm text-gray-500 mb-2">{update.date}</div>
                        <h3 className="font-semibold text-gray-900 mb-2">{update.title}</h3>
                        <p className="text-gray-700">{update.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No updates yet.</p>
                )}
              </div>
            )}

            {/* Supporters */}
            {activeTab === 'supporters' && (
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-gray-700 mb-6">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{project.supporters}</span>
                  <span>supporters have funded this project</span>
                </div>
                <p className="text-sm text-gray-500">
                  Detailed supporter list and activity feed would appear here.
                </p>
              </div>
            )}

            {/* Risks & Disclosure */}
            {activeTab === 'risks' && (
              <div className="max-w-3xl">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-amber-900 mb-2">Investment Risk Warning</h3>
                  <p className="text-sm text-amber-800">
                    Cryptocurrency-based crowdfunding carries inherent risks. Project outcomes are
                    not guaranteed. Only contribute what you can afford to lose.
                  </p>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <h4 className="font-semibold mb-2">Project Risks</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Development delays may occur</li>
                    <li>Market conditions may impact project viability</li>
                    <li>Technology changes may affect implementation</li>
                    <li>Regulatory changes may impact the project</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FundingPanel Modal */}
      <FundingPanel
        project={project}
        isOpen={isFundingPanelOpen}
        onClose={() => setIsFundingPanelOpen(false)}
      />
    </div>
  );
}
