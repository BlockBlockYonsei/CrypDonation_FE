import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Project } from '../data/mockData';
import { Link } from 'react-router-dom';

interface FundingPanelProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function FundingPanel({ project, isOpen, onClose }: FundingPanelProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<string>('');

  const estimatedGasFee = 0.003; // ETH
  const totalAmount = parseFloat(amount || '0') + estimatedGasFee;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Fund This Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{project.title}</h3>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Funding Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-8 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reward Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Select Reward (Optional)
            </label>
            <div className="space-y-2">
              {(Array.isArray(project.rewards) ? project.rewards : []).map((reward) => (
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
                    <span className="text-xs text-gray-500">{reward.available} available</span>
                  </div>
                  <div className="font-medium text-sm text-gray-900 mb-1">{reward.title}</div>
                  <div className="text-sm text-gray-600">{reward.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Outcome */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm font-medium text-gray-900 mb-3">Transaction Summary</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Funding Amount</span>
              <span className="font-medium">${amount || '0.00'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estimated Gas Fee</span>
              <span className="font-medium">${estimatedGasFee.toFixed(3)} ETH</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">Important Notice</p>
              <p>Cryptocurrency transactions are irreversible. Please review all details carefully before confirming.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              className="w-full h-12 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Confirm Funding
            </button>
            
            <Link 
              to={`/funding/${project.id}`}
              className="block w-full h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center leading-[3rem] text-gray-900"
            >
              View Advanced Details
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
