import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navigation from '../components/Navigation';
import ProjectCard from '../components/ProjectCard';
import { mockProjects, categories } from '../data/mockData';

type SortOption = 'trending' | 'new' | 'ending-soon';
type StatusFilter = 'all' | 'live' | 'successful' | 'ended';

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Wallet (read-only on this page)
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Keep it simple: assume other pages store the connected address here
    const addr = localStorage.getItem('connectedWalletAddress');
    setConnectedWalletAddress(addr);

    // Sync across tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'connectedWalletAddress') {
        setConnectedWalletAddress(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Filter logic
  const filteredProjects = mockProjects.filter((project) => {
    const categoryMatch = selectedCategory === 'All' || project.category === selectedCategory;
    const statusMatch = statusFilter === 'all' || project.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  // Sort logic
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
      {/* Navigation */}
      <Navigation
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        connectedWalletAddress={connectedWalletAddress}
        hideConnectWallet
      />

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {/* Filter Section */}
        <div className="mb-8 flex items-center justify-between">
          {/* Sort Dropdown */}
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

          {/* Status Chips */}
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

        {/* Bottom CTA Banner */}
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
