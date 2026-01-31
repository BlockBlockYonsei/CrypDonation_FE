import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Wallet } from 'lucide-react';

interface NavigationProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categories?: string[];

  // Wallet display comes from Landing (persisted in localStorage and passed down by pages)
  connectedWalletAddress?: string | null;
  // If true, do not render any Connect Wallet CTA in the navbar
  hideConnectWallet?: boolean;
}

export default function Navigation({
  selectedCategory = 'All',
  onCategoryChange,
  categories = [],
  connectedWalletAddress,
  hideConnectWallet = false,
}: NavigationProps) {
  const navigate = useNavigate();

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Prefer prop, but fallback to localStorage (in case the wrong Navigation component is imported/passed)
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(connectedWalletAddress ?? null);

  useEffect(() => {
    // Sync when prop changes
    setResolvedAddress(connectedWalletAddress ?? null);
  }, [connectedWalletAddress]);

  useEffect(() => {
    // Fallback read from localStorage
    const stored = localStorage.getItem('connectedWalletAddress');
    if (!resolvedAddress && stored) {
      setResolvedAddress(stored);
    }

    // Keep in sync across tabs/windows and when other pages update the key
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'connectedWalletAddress') {
        setResolvedAddress(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [resolvedAddress]);

  const isWalletConnected = !!resolvedAddress;

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="mx-auto max-w-[1440px] px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/explore" className="text-xl font-semibold text-gray-900">
            CryptoFund
          </Link>

          {/* Global Search */}
          <div className="flex-1 max-w-2xl mx-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full h-11 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/start-project')}
              className="px-5 h-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start a Project
            </button>
            
            {isWalletConnected ? (
              <button
                onClick={() => navigate('/user')}
                className="px-5 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                title={resolvedAddress ?? undefined}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm">{shortAddr(resolvedAddress!)}</span>
              </button>
            ) : hideConnectWallet ? (
              <div className="px-4 h-10 border border-gray-200 rounded-lg flex items-center gap-2 text-sm text-gray-500">
                <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden="true" />
                <span className="font-medium">Not connected</span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="px-5 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1 h-12 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange?.(category)}
                className={`px-4 h-8 rounded-md text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
