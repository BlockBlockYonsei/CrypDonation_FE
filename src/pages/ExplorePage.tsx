// src/pages/ExplorePage.tsx
// Explore(탐색) 페이지
// - 프로젝트 목록을 카테고리/상태로 필터링하고, 정렬 옵션(Trending/Newest/Ending Soon)에 따라 노출
// - 지갑 연결/해제는 이 페이지에서 수행하지 않음 (다른 페이지에서 저장된 connectedWalletAddress를 localStorage로부터 읽어 ‘표시’만)

// Imports
// - React hooks: 상태/사이드이펙트 관리
// - UI icon: 정렬 드롭다운 표시
// - Components: Navigation(상단), ProjectCard(프로젝트 카드)
// - Mock data: 추후 API/인덱서/DB로 교체 예정
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navigation from '../components/Navigation';
import ProjectCard from '../components/ProjectCard';
import { mockProjects, categories, Project } from '../data/mockData.ts';

// Types
// - UI select / filter chips 값과 1:1 매핑
type SortOption = 'trending' | 'new' | 'ending-soon';
type StatusFilter = 'all' | 'live' | 'successful' | 'ended';

type ProjectWithCreatedAt = Project & { createdAt?: string };

async function fetchProjects(): Promise<any> {
  const res = await fetch('/api/projects');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch projects: ${res.status} ${text}`);
  }
  return res.json();
}

function toArray<T = any>(value: any): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && Array.isArray(value.projects)) return value.projects as T[]; // { projects: [...] }
  if (value && Array.isArray(value.items)) return value.items as T[]; // { items: [...] }
  if (value && Array.isArray(value.data)) return value.data as T[]; // { data: [...] } (일부 API)
  return [];
}

function normalizeStatus(value: any): Project['status'] {
  // 허용된 값만 통과시키고, 그 외는 기본값(live)로 처리
  if (value === 'live' || value === 'successful' || value === 'ended') return value;

  // 백엔드에서 다른 키워드를 쓰는 경우를 대비한 매핑(필요 시 확장)
  if (value === 'active') return 'live';
  if (value === 'completed') return 'successful';
  if (value === 'closed') return 'ended';

  return 'live';
}

// API_ORIGIN: 백엔드 오리진(정적 업로드 /uploads 접근용)
// - 우선순위: VITE_API_ORIGIN(권장) -> VITE_API_URL/BASE_URL(프로젝트에 따라 사용) -> ''(프록시 사용)
const ENV: any = (import.meta as any).env || {};
const API_ORIGIN: string = ENV.VITE_API_ORIGIN || ENV.VITE_API_URL || ENV.VITE_API_BASE_URL || '';

function resolveAssetUrl(raw: any): string {
  const url = String(raw ?? '').trim();
  if (!url) return '';

  // 이미 절대 URL이면 그대로
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // "/..." 형태면 API_ORIGIN 붙이기 (API_ORIGIN이 없으면 그대로 두되, 개발에서 깨질 수 있음)
  if (url.startsWith('/')) {
    return API_ORIGIN ? `${API_ORIGIN}${url}` : url;
  }

  // 파일명만 온 경우: 기본 uploads 디렉토리로 가정
  // (서버에서 정적 서빙 경로가 다르면 여기만 바꾸면 됨)
  // API_ORIGIN이 없으면 프론트(5173) 기준 /uploads 로 떨어지는데,
  // 이 경우 vite proxy에서 /uploads 를 백엔드로 프록시하도록 설정하면 정상 동작한다.
  return API_ORIGIN ? `${API_ORIGIN}/uploads/${url}` : `/uploads/${url}`;
}

export default function ExplorePage() {
  // State
  // - 카테고리/정렬/상태 필터
  // - (읽기 전용) 지갑 주소: localStorage의 connectedWalletAddress를 표시만
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

  // API
  // - 백엔드에서 프로젝트 목록을 가져옴
  // - 실패 시(mock 유지) UI가 계속 동작하도록 fallback
  const projectsQuery = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: fetchProjects,
    staleTime: 10_000,
  });

  const rawProjects = useMemo(() => {
    // API 응답이 배열이 아닐 수 있어 강제로 배열로 정규화
    const apiList = toArray(projectsQuery.data);

    // 개발 중에는: mock + api를 "항상" 같이 보여주기
    // (API가 오면 mock이 사라지지 않도록)
    const mockList = toArray(mockProjects).map((p: any) => ({ ...p, __source: 'mock' }));
    const taggedApiList = apiList.map((p: any) => ({ ...p, __source: 'api' }));

    // api가 비정상 형식이라 빈 배열이더라도 mock은 항상 유지
    return [...mockList, ...taggedApiList];
  }, [projectsQuery.data]);

  // Normalize: API에서 일부 필드가 빠져도 ProjectCard가 안전하게 렌더링되도록 기본값을 채움
  const projects: ProjectWithCreatedAt[] = useMemo(() => {
    return rawProjects.map((p: any) => {
      const id = String(p?.id ?? '');
      const title = String(p?.title ?? '');

      return {
        id,
        title,
        description: String(p?.description ?? p?.oneLiner ?? ''),
        category: p?.category ?? 'Other',
        status: normalizeStatus(p?.status),
        goalAmount: Number(p?.goalAmount ?? 0),
        raisedAmount: Number(p?.raisedAmount ?? 0),
        supporters: Number(p?.supporters ?? 0),
        daysLeft: Number(p?.daysLeft ?? p?.durationDays ?? 0),
        createdAt: p?.createdAt,
        coverUrl: resolveAssetUrl(p?.coverUrl ?? p?.coverImageUrl ?? p?.cover ?? ''),
        thumbnailUrl: resolveAssetUrl(p?.thumbnailUrl ?? p?.thumbnail ?? p?.thumbnailImageUrl ?? ''),

        creator: {
          walletAddress: String(p?.creator?.walletAddress ?? p?.creatorWalletAddress ?? '0x0'),
          verified: Boolean(p?.creator?.verified ?? false),
          pastProjects: Number(p?.creator?.pastProjects ?? 0),
        },
        story: String(p?.story ?? ''),
        updates: Array.isArray(p?.updates) ? p.updates : [],
        rewards: Array.isArray(p?.rewards) ? p.rewards : [],
      };
    });
  }, [rawProjects]);

  // Effects
  // - 최초 마운트 시 localStorage에서 지갑 주소를 읽어 표시
  // - 다른 탭/창에서 값이 바뀌면(storage 이벤트) 동기화
  useEffect(() => {
    const addr = localStorage.getItem('connectedWalletAddress');
    setConnectedWalletAddress(addr);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'connectedWalletAddress') {
        setConnectedWalletAddress(e.newValue);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Derived Data (Filter)
  // - 카테고리 + 상태를 동시에 만족하는 프로젝트만 남김
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const categoryMatch = selectedCategory === 'All' || project.category === selectedCategory;
      const statusMatch = statusFilter === 'all' || project.status === statusFilter;
      return categoryMatch && statusMatch;
    });
  }, [projects, selectedCategory, statusFilter]);

  // Derived Data (Sort)
  // - trending: raisedAmount(모금액) 내림차순
  // - new: createdAt 최신 우선 (uuid id는 parseInt 불가)
  // - ending-soon: daysLeft(남은 일수) 오름차순
  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];

    return list.sort((a, b) => {
      if (sortBy === 'trending') {
        return (b.raisedAmount ?? 0) - (a.raisedAmount ?? 0);
      } else if (sortBy === 'new') {
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        return bt - at;
      } else {
        return (a.daysLeft ?? 0) - (b.daysLeft ?? 0);
      }
    });
  }, [filteredProjects, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation (category + read-only wallet) */}
      <Navigation
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        connectedWalletAddress={connectedWalletAddress}
        hideConnectWallet
      />

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {/* Filter Bar: sort dropdown + status chips */}
        <div className="mb-8 flex items-center justify-between">
          <div className="relative">
            <label className="text-sm text-gray-600 mr-3">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 pl-4 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none cursor-pointer"
            >
              <option value="trending">Trending</option>
              <option value="new">Newest</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Status:</span>
            {(['all', 'live', 'successful', 'ended'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 h-9 rounded-full text-sm capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {sortedProjects.map((project) => (
            <ProjectCard key={`${(project as any).__source ?? 'x'}:${project.id}`} project={project} />
          ))}
        </div>

        {/* Empty State */}
        {sortedProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No projects found matching your filters.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-gray-900 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">Have an Innovative Idea?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Launch your project on our platform and connect with supporters who believe in your vision.
          </p>
          <button className="px-8 h-12 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Start Your Project
          </button>
        </div>
      </main>
    </div>
  );
}
