// src/pages/StartProjectWizard.tsx
// Start Project Wizard 페이지
// - 4단계 폼(Basic Info → Media → Funding Setup → Review)을 통해 프로젝트 생성 데이터를 수집
// - 현재는 로컬 state(formData)에만 저장되며, Publish 시 서버/인덱서/온체인에 반영하는 로직은 미구현
// - 추후: 지갑 연결 상태 확인 → 프로젝트 생성 트랜잭션/등록 API 호출 → 성공 시 Explore/Detail로 이동

// Imports
// - React hook: 단계/폼 상태 관리
// - Router: 취소 시 Explore로 복귀
// - Icons: 위저드 단계/버튼/업로드 UI 아이콘
// - Components: Navigation
// - Mock data: 카테고리 옵션(추후 API로 교체 가능)
import { useRef, useState } from 'react';
import type React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import { categories } from '../data/mockData.ts';

// Types
// - 위저드 단계(1~4)
type Step = 1 | 2 | 3 | 4;

// Form Model
// - 위저드에서 수집하는 프로젝트 입력 데이터 구조
// - 현재는 입력값을 그대로 보존하기 위해 string 위주로 관리(실제 저장/전송 전 숫자/형식 검증 필요)
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
  // State
  // - currentStep: 현재 단계(1~4)
  // - formData: 위저드 전체 입력값(단계별로 필요한 필드만 채우도록 UX 설계)
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

  const navigate = useNavigate();
  const account = useCurrentAccount();
  const walletAddress = account?.address;

  // Local image files (for drag & drop / file picker)
  // - NOTE: 아직 서버 업로드는 미구현. 현재는 Object URL로 미리보기/폼값 세팅만 함.
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Helpers (Form Updates)
  // - updateFormData: 불변성 유지하며 부분 업데이트
  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Helpers (Rewards)
  // - addReward: 리워드 티어 추가 (현재 id는 Date.now() 기반 목업)
  // - removeReward: id 기준 삭제
  // - updateReward: id 기준 부분 수정
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

  // Helpers (Images)
  const isSupportedImage = (file: File) => {
    return file.type === 'image/jpeg' || file.type === 'image/png';
  };

  const applyThumbnailFile = (file: File) => {
    if (!isSupportedImage(file)) {
      alert('Only JPG/JPEG or PNG files are supported.');
      return;
    }
    const url = URL.createObjectURL(file);
    setThumbnailFile(file);
    updateFormData({ thumbnailUrl: url });
  };

  const applyCoverFile = (file: File) => {
    if (!isSupportedImage(file)) {
      alert('Only JPG/JPEG or PNG files are supported.');
      return;
    }
    const url = URL.createObjectURL(file);
    setCoverFile(file);
    updateFormData({ coverUrl: url });
  };

  const onThumbFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    applyThumbnailFile(file);
    // 같은 파일을 다시 선택해도 change가 뜨게 reset
    e.target.value = '';
  };

  const onCoverFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    applyCoverFile(file);
    e.target.value = '';
  };

  const onThumbDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setThumbDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    applyThumbnailFile(file);
  };

  const onCoverDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setCoverDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    applyCoverFile(file);
  };

  // Validation
  // - 각 단계에서 다음으로 진행 가능한 최소 필수값 체크
  //   Step1: title/category/oneLiner
  //   Step2: thumbnailUrl/coverUrl
  //   Step3: goalAmount/duration
  //   Step4: 항상 true(리뷰 단계)
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

  // Upload (Local now, AWS S3 later)
  // - Backend: POST /api/uploads (multipart/form-data, field name: "file")
  // - Response: { url: string }
  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: {
        'x-wallet-address': walletAddress ?? '',
      },
      body: fd,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Failed to upload image (HTTP ${res.status})`;
      throw new Error(message);
    }

    const url = data?.url;
    if (!url || typeof url !== 'string') {
      throw new Error('Upload succeeded but response did not include a valid url.');
    }

    return url;
  };

  const isBlobUrl = (url: string) => url.startsWith('blob:');
  const isHttpUrl = (url: string) => /^https?:\/\//i.test(url);

  // Build payload for backend (create project)
  const buildCreatePayload = (finalImages?: { thumbnailUrl?: string; coverUrl?: string }) => {
    return {
      creatorWalletAddress: walletAddress ?? null,
      title: formData.title.trim(),
      category: formData.category,
      oneLiner: formData.oneLiner.trim(),
      // IMPORTANT: Never persist blob: URLs. Use uploaded URL or a pasted http(s) URL.
      thumbnailUrl: (finalImages?.thumbnailUrl ?? formData.thumbnailUrl).trim(),
      coverUrl: (finalImages?.coverUrl ?? formData.coverUrl).trim(),
      goalAmount: Number(formData.goalAmount),
      durationDays: Number(formData.duration),
      rewards: formData.rewards
        .filter((r) => r.title.trim() || r.description.trim() || r.amount)
        .map((r) => ({
          amount: Number(r.amount || 0),
          title: r.title.trim(),
          description: r.description.trim(),
        })),
    };
  };

  const validateBeforePublish = () => {
    // 최소 필수값(전체)
    if (!formData.title.trim()) return 'Project Title is required.';
    if (!formData.category) return 'Category is required.';
    if (!formData.oneLiner.trim()) return 'One-Line Description is required.';
    if (!formData.thumbnailUrl.trim()) return 'Thumbnail Image is required.';
    if (!formData.coverUrl.trim()) return 'Cover Image is required.';
    if (!formData.goalAmount || Number.isNaN(Number(formData.goalAmount))) return 'Funding Goal is required.';
    if (!formData.duration || Number.isNaN(Number(formData.duration))) return 'Campaign Duration is required.';
    if (!walletAddress) return 'Please connect your wallet before publishing.';
    return null;
  };

  const createProjectMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof buildCreatePayload>) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress ?? '',
         },
        body: JSON.stringify(payload),
      });

      // 서버가 JSON 에러를 내려줘도 안전하게 파싱
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = (data && (data.message || data.error)) || `Failed to create project (HTTP ${res.status})`;
        throw new Error(message);
      }

      return data;
    },
  });

  const onPublish = async () => {
    const err = validateBeforePublish();
    if (err) {
      alert(err);
      return;
    }

    try {
      // 1) Resolve final image URLs
      // - If user selected a local file: upload it and use returned HTTP URL
      // - If user pasted an URL: accept only http(s)
      // - If it is a blob: URL but file is missing: block publish (cannot persist)
      let finalThumbnailUrl = formData.thumbnailUrl.trim();
      let finalCoverUrl = formData.coverUrl.trim();

      if (thumbnailFile) {
        finalThumbnailUrl = await uploadImage(thumbnailFile);
      } else {
        if (isBlobUrl(finalThumbnailUrl)) {
          throw new Error('Thumbnail is a local preview (blob:) URL. Please re-select the thumbnail file or paste a valid http(s) image URL.');
        }
        if (finalThumbnailUrl && !isHttpUrl(finalThumbnailUrl)) {
          throw new Error('Thumbnail URL must start with http(s):// (or upload a file).');
        }
      }

      if (coverFile) {
        finalCoverUrl = await uploadImage(coverFile);
      } else {
        if (isBlobUrl(finalCoverUrl)) {
          throw new Error('Cover is a local preview (blob:) URL. Please re-select the cover file or paste a valid http(s) image URL.');
        }
        if (finalCoverUrl && !isHttpUrl(finalCoverUrl)) {
          throw new Error('Cover URL must start with http(s):// (or upload a file).');
        }
      }

      // 2) Create project using final URLs
      const payload = buildCreatePayload({
        thumbnailUrl: finalThumbnailUrl,
        coverUrl: finalCoverUrl,
      });

      const data: any = await createProjectMutation.mutateAsync(payload);

      // 3) (Optional) Update local formData to the persisted URLs so previews remain consistent
      updateFormData({ thumbnailUrl: finalThumbnailUrl, coverUrl: finalCoverUrl });

      // 백엔드 응답 형태가 달라도 대응: id / projectId / project.id
      const projectId = data?.id || data?.projectId || data?.project?.id;

      alert('Project created successfully.');

      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate('/explore');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to publish project.');
    }
  };

  // Derived (Steps UI)
  // - 좌측 단계 인디케이터 렌더링용 메타데이터
  const steps = [
    { number: 1, title: 'Basic Info', description: 'Project details' },
    { number: 2, title: 'Media', description: 'Images and assets' },
    { number: 3, title: 'Funding Setup', description: 'Goals and rewards' },
    { number: 4, title: 'Review', description: 'Review and publish' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-8 py-8">
        {/* Cancel / Return */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel and Return
        </Link>

        {/* Layout: Steps (left) + Form (right) */}
        <div className="grid grid-cols-4 gap-8">
          {/* Left: Step Indicator */}
          <div className="col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Project</h2>
              <div className="space-y-4">
                {/* Steps List */}
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

          {/* Right: Step Form */}
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => thumbnailInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') thumbnailInputRef.current?.click();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setThumbDragOver(true);
                      }}
                      onDragLeave={() => setThumbDragOver(false)}
                      onDrop={onThumbDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        thumbDragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        style={{ display: 'none' }}
                        tabIndex={-1}
                        aria-hidden="true"
                        onChange={onThumbFileChange}
                      />

                      {formData.thumbnailUrl ? (
                        <div className="space-y-3">
                          <img
                            src={formData.thumbnailUrl}
                            alt="Thumbnail preview"
                            className="mx-auto h-40 w-auto rounded-md border border-gray-200 object-contain"
                          />
                          <p className="text-sm text-gray-700">Click to change, or drag & drop a new image</p>
                          {thumbnailFile && (
                            <p className="text-xs text-gray-500">{thumbnailFile.name}</p>
                          )}
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">Recommended: 800x600px, JPG or PNG</p>
                        </>
                      )}

                      <div className="mt-4">
                        <input
                          type="text"
                          value={formData.thumbnailUrl}
                          onChange={(e) => {
                            setThumbnailFile(null);
                            updateFormData({ thumbnailUrl: e.target.value });
                          }}
                          placeholder="Or paste image URL"
                          className="w-full max-w-md mx-auto h-10 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cover Image *
                    </label>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => coverInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') coverInputRef.current?.click();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setCoverDragOver(true);
                      }}
                      onDragLeave={() => setCoverDragOver(false)}
                      onDrop={onCoverDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        coverDragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        style={{ display: 'none' }}
                        tabIndex={-1}
                        aria-hidden="true"
                        onChange={onCoverFileChange}
                      />

                      {formData.coverUrl ? (
                        <div className="space-y-3">
                          <img
                            src={formData.coverUrl}
                            alt="Cover preview"
                            className="mx-auto h-40 w-auto rounded-md border border-gray-200 object-contain"
                          />
                          <p className="text-sm text-gray-700">Click to change, or drag & drop a new image</p>
                          {coverFile && <p className="text-xs text-gray-500">{coverFile.name}</p>}
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">Recommended: 1920x720px, JPG or PNG</p>
                        </>
                      )}

                      <div className="mt-4">
                        <input
                          type="text"
                          value={formData.coverUrl}
                          onChange={(e) => {
                            setCoverFile(null);
                            updateFormData({ coverUrl: e.target.value });
                          }}
                          placeholder="Or paste image URL"
                          className="w-full max-w-md mx-auto h-10 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
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
                      {/* Add Reward */}
                      <button
                        onClick={addReward}
                        className="text-sm text-gray-900 hover:underline"
                      >
                        + Add Reward
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Reward List */}
                      {formData.rewards.map((reward) => (
                        <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Reward Tier</h4>
                            {/* Remove Reward */}
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

              {/* Step 4: Review & Publish */}
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
                      <div className="text-sm text-gray-500 mb-1">Creator</div>
                      <div className="font-medium text-gray-900">
                        {walletAddress ? walletAddress : 'Not connected'}
                      </div>
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

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                {/* Previous */}
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as Step)}
                  disabled={currentStep === 1}
                  className="px-6 h-11 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentStep < 4 ? (
                  <>
                  {/* Next */}
                  <button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1) as Step)}
                    disabled={!canProceed()}
                    className="px-6 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  </>
                ) : (
                  <>
                  {/* Publish */}
                  <button
                    onClick={onPublish}
                    disabled={createProjectMutation.isPending}
                    className="px-6 h-11 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createProjectMutation.isPending ? 'Publishing...' : 'Publish Project'}
                  </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
