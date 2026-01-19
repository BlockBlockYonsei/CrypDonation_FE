import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Copy, ExternalLink, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import { mockProjects, userTransactions } from '../data/mockData';

type TabType = 'created' | 'funded' | 'transactions';

export default function UserPage() {
  const [activeTab, setActiveTab] = useState<TabType>('created');

  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const walletBalance = '12.45 ETH';

  const createdProjects = mockProjects.filter((p) => 
    p.creator.walletAddress === walletAddress
  );

  const fundedProjects = mockProjects.slice(0, 2); // Mock funded projects

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your projects and contributions</p>
            </div>
            <Link
              to="/start-project"
              className="px-5 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
            >
              Create New Project
            </Link>
          </div>

          {/* Wallet Summary */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">{walletAddress}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Balance</div>
                <div className="text-2xl font-semibold text-gray-900">{walletBalance}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Created Projects</div>
            <div className="text-3xl font-semibold text-gray-900">{createdProjects.length}</div>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Funded Projects</div>
            <div className="text-3xl font-semibold text-gray-900">{fundedProjects.length}</div>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Total Raised</div>
            <div className="text-3xl font-semibold text-gray-900">
              ${createdProjects.reduce((sum, p) => sum + p.raisedAmount, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Total Contributed</div>
            <div className="text-3xl font-semibold text-gray-900">$750</div>
          </div>
        </div>

        {/* Tab Layout */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex">
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

          {/* Tab Content */}
          <div className="p-8">
            {/* Created Projects Tab */}
            {activeTab === 'created' && (
              <div>
                {createdProjects.length > 0 ? (
                  <div className="space-y-4">
                    {createdProjects.map((project) => {
                      const fundingPercentage = Math.min(
                        (project.raisedAmount / project.goalAmount) * 100,
                        100
                      );

                      return (
                        <Link
                          key={project.id}
                          to={`/project/${project.id}`}
                          className="block border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-6">
                            <img
                              src={project.thumbnailUrl}
                              alt={project.title}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">{project.description}</p>
                                </div>
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    project.status === 'live'
                                      ? 'bg-green-100 text-green-700'
                                      : project.status === 'successful'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </span>
                              </div>

                              <div className="mb-3">
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
                                    ${project.raisedAmount.toLocaleString()}
                                  </span>
                                  <span className="text-gray-500">
                                    {' '}
                                    / ${project.goalAmount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{project.daysLeft} days left</span>
                                </div>
                                <div className="text-gray-600">
                                  {project.supporters} supporters
                                </div>
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

            {/* Funded Projects Tab */}
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
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Your contribution: $500</span>
                              <span>•</span>
                              <span>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span>
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

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                {userTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {userTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
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
                            <span className="font-mono text-xs">{tx.txHash}</span>
                            <button className="hover:text-gray-700">
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {tx.amount > 0 && (
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">${tx.amount}</div>
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
      </main>
    </div>
  );
}
