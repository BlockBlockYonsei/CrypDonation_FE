import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import { categories } from '../data/mockData';

type Step = 1 | 2 | 3 | 4;

interface ProjectFormData {
  title: string;
  category: string;
  oneLiner: string;
  thumbnailUrl: string;
  coverUrl: string;
  goalAmount: string;
  duration: string;
  rewards: Array<{
    id: string;
    amount: string;
    title: string;
    description: string;
  }>;
}

export default function StartProjectWizard() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    category: categories[1],
    oneLiner: '',
    thumbnailUrl: '',
    coverUrl: '',
    goalAmount: '',
    duration: '30',
    rewards: [],
  });

  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addReward = () => {
    updateFormData({
      rewards: [
        ...formData.rewards,
        {
          id: Date.now().toString(),
          amount: '',
          title: '',
          description: '',
        },
      ],
    });
  };

  const removeReward = (id: string) => {
    updateFormData({
      rewards: formData.rewards.filter((r) => r.id !== id),
    });
  };

  const updateReward = (id: string, updates: Partial<ProjectFormData['rewards'][0]>) => {
    updateFormData({
      rewards: formData.rewards.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.title && formData.category && formData.oneLiner;
    }
    if (currentStep === 2) {
      return formData.thumbnailUrl && formData.coverUrl;
    }
    if (currentStep === 3) {
      return formData.goalAmount && formData.duration;
    }
    return true;
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Project details' },
    { number: 2, title: 'Media', description: 'Images and assets' },
    { number: 3, title: 'Funding Setup', description: 'Goals and rewards' },
    { number: 4, title: 'Review', description: 'Review and publish' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel and Return
        </Link>

        <div className="grid grid-cols-4 gap-8">
          {/* Left: Step Indicators */}
          <div className="col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Project</h2>
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-start gap-3 ${
                      currentStep === step.number ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        currentStep > step.number
                          ? 'bg-gray-900 text-white'
                          : currentStep === step.number
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm">{step.number}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{step.title}</div>
                      <div className="text-sm text-gray-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Step Content */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Basic Information</h3>
                    <p className="text-gray-600">Tell us about your project</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData({ title: e.target.value })}
                      placeholder="Enter a clear, concise project title"
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateFormData({ category: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {categories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      One-Line Description *
                    </label>
                    <input
                      type="text"
                      value={formData.oneLiner}
                      onChange={(e) => updateFormData({ oneLiner: e.target.value })}
                      placeholder="Summarize your project in one sentence"
                      maxLength={100}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {formData.oneLiner.length}/100 characters
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Media */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Project Media</h3>
                    <p className="text-gray-600">Add images to showcase your project</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Thumbnail Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Recommended: 800x600px, JPG or PNG</p>
                      <input
                        type="text"
                        value={formData.thumbnailUrl}
                        onChange={(e) => updateFormData({ thumbnailUrl: e.target.value })}
                        placeholder="Or paste image URL"
                        className="mt-4 w-full max-w-md mx-auto h-10 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cover Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Recommended: 1920x720px, JPG or PNG</p>
                      <input
                        type="text"
                        value={formData.coverUrl}
                        onChange={(e) => updateFormData({ coverUrl: e.target.value })}
                        placeholder="Or paste image URL"
                        className="mt-4 w-full max-w-md mx-auto h-10 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Funding Setup */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Funding Setup</h3>
                    <p className="text-gray-600">Set your funding goal and rewards</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Funding Goal (USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={formData.goalAmount}
                          onChange={(e) => updateFormData({ goalAmount: e.target.value })}
                          placeholder="0.00"
                          className="w-full h-12 pl-8 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Campaign Duration (days) *
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) => updateFormData({ duration: e.target.value })}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="15">15 days</option>
                        <option value="30">30 days</option>
                        <option value="45">45 days</option>
                        <option value="60">60 days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-900">
                        Rewards (Optional)
                      </label>
                      <button
                        onClick={addReward}
                        className="text-sm text-gray-900 hover:underline"
                      >
                        + Add Reward
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.rewards.map((reward) => (
                        <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Reward Tier</h4>
                            <button
                              onClick={() => removeReward(reward.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Amount ($)</label>
                              <input
                                type="number"
                                value={reward.amount}
                                onChange={(e) =>
                                  updateReward(reward.id, { amount: e.target.value })
                                }
                                placeholder="100"
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Title</label>
                              <input
                                type="text"
                                value={reward.title}
                                onChange={(e) => updateReward(reward.id, { title: e.target.value })}
                                placeholder="Early Adopter"
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                              value={reward.description}
                              onChange={(e) =>
                                updateReward(reward.id, { description: e.target.value })
                              }
                              placeholder="What backers will receive"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Review & Publish</h3>
                    <p className="text-gray-600">Review your project details before publishing</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Title</div>
                      <div className="font-medium text-gray-900">{formData.title}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Category</div>
                      <div className="font-medium text-gray-900">{formData.category}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Description</div>
                      <div className="font-medium text-gray-900">{formData.oneLiner}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Funding Goal</div>
                        <div className="font-medium text-gray-900">
                          ${formData.goalAmount || '0'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Duration</div>
                        <div className="font-medium text-gray-900">{formData.duration} days</div>
                      </div>
                    </div>

                    {formData.rewards.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Rewards</div>
                        <div className="text-gray-900">{formData.rewards.length} reward tiers</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      By publishing, you agree to our terms and conditions. Your project will be
                      reviewed before going live.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as Step)}
                  disabled={currentStep === 1}
                  className="px-6 h-11 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1) as Step)}
                    disabled={!canProceed()}
                    className="px-6 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="px-6 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Publish Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
