// src/pages/ExplorePage.tsx
// Explore(탐색) 페이지
// - 프로젝트 목록을 카테고리/상태로 필터링하고, 정렬 옵션(Trending/Newest/Ending Soon)에 따라 노출
// - 지갑 연결/해제는 이 페이지에서 수행하지 않음 (다른 페이지에서 저장된 connectedWalletAddress를 localStorage로부터 읽어 ‘표시’만)

// Imports
// - React hooks: 상태/사이드이펙트 관리
// - UI icon: 정렬 드롭다운 표시
// - Components: Navigation(상단), ProjectCard(프로젝트 카드)
// - Mock data: 추후 API/인덱서/DB로 교체 예정
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navigation from '../components/Navigation';
import ProjectCard from '../components/ProjectCard';
import { mockProjects, categories } from '../data/mockData';

// Types
// - UI select / filter chips 값과 1:1 매핑
type SortOption = 'trending' | 'new' | 'ending-soon';
type StatusFilter = 'all' | 'live' | 'successful' | 'ended';

export default function ExplorePage() {
  // State
  // - 카테고리/정렬/상태 필터
  // - (읽기 전용) 지갑 주소: localStorage의 connectedWalletAddress를 표시만
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

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
  const filteredProjects = mockProjects.filter((project) => {
    const categoryMatch = selectedCategory === 'All' || project.category === selectedCategory;
    const statusMatch = statusFilter === 'all' || project.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  // Derived Data (Sort)
  // - trending: raisedAmount(모금액) 내림차순
  // - new: id(문자열)를 숫자로 파싱해 최신(큰 값) 우선
  // - ending-soon: daysLeft(남은 일수) 오름차순
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'trending') {
      return b.raisedAmount - a.raisedAmount;
    } else if (sortBy === 'new') {
      return parseInt(b.id) - parseInt(a.id);
    } else {
      return a.daysLeft - b.daysLeft;
    }
  });

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
            <ProjectCard key={project.id} project={project} />
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
