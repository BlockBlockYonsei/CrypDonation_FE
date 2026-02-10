import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle } from "lucide-react";

import Navigation from "../components/Navigation";

import { useQuery } from "@tanstack/react-query";
import { mockProjects } from "../data/mockData";
import { ManagingApi } from "../api/modules/managing.api";
import { api } from "../api/https";

type TabId = "story" | "updates" | "supporters" | "risks";

export default function ProjectManagePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("story");

  const navigate = useNavigate();
  const walletAddress = localStorage.getItem("connectedWalletAddress") ?? "";

  async function onDelete(projectId: string) {
    if (!walletAddress) {
      alert("Wallet not connected");
      return;
    }

    const ok = window.confirm("Delete this project? This cannot be undone.");
    if (!ok) return;

    try {
      await ManagingApi.remove(projectId, { walletAddress });
      alert("Deleted");
      navigate("/");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Delete failed");
    }
  }

  // 1) mock 기반 placeholder (UI 개발용)
  const mockProject = mockProjects.find((p) => p.id === id) || null;

  // 2) API overlay (mock → real data로 자동 전환)
  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project-manage", id],
    queryFn: async () => {
      const data = await api<any>(`/api/projects/${id}`, { method: "GET" });

      return {
        ...data,
        coverUrl: typeof data?.coverUrl === "string" ? data.coverUrl : "",
        thumbnailUrl: typeof data?.thumbnailUrl === "string" ? data.thumbnailUrl : "",
        story: typeof data?.story === "string" ? data.story : "",
        updates: Array.isArray(data?.updates) ? data.updates : [],
        creator: {
          walletAddress:
            typeof data?.creator?.walletAddress === "string"
              ? data.creator.walletAddress
              : typeof data?.creatorWalletAddress === "string"
                ? data.creatorWalletAddress
                : "",
          verified: !!data?.creator?.verified,
          pastProjects:
            typeof data?.creator?.pastProjects === "number"
              ? data.creator.pastProjects
              : 0,
        },
      };
    },
    enabled: !!id,
    placeholderData: mockProject ?? undefined,
  });

  // Guard
  if (isLoading && !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-[1440px] mx-auto px-8 py-16 text-center">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
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
  const fundingPercentage = Math.min(
    (Number(project.raisedAmount || 0) / Math.max(Number(project.goalAmount || 0), 1)) * 100,
    100
  );

  const creatorAddr = project?.creator?.walletAddress ?? "0x0";
  const shortCreatorAddr =
    creatorAddr.length > 10
      ? `${creatorAddr.slice(0, 6)}...${creatorAddr.slice(-4)}`
      : creatorAddr;

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
              src={project.coverUrl || "/placeholder-cover.png"}
              alt={project.title || "Project"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Hero Body Layout */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Left: project info + progress + stats */}
              <div className="col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">
                      {project.category}
                    </div>
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
                      ${Number(project.raisedAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      raised of ${Number(project.goalAmount || 0).toLocaleString()} goal
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

              {/* Right: creator info + Manage CTAs */}
              <div className="border-l border-gray-200 pl-8">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Created by
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {shortCreatorAddr}
                        </span>
                        {project?.creator?.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {project?.creator?.pastProjects ?? 0} past projects
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manage: Withdraw */}
                <button
                  onClick={() => {
                    // TODO: withdraw flow 연결
                    console.log("withdraw funds", project.id);
                  }}
                  className="w-full h-12 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium mb-3"
                >
                  Withdraw Funds
                </button>

                {/* Manage: Delete */}
                <button
                  onClick={() => onDelete(String(project.id))}
                  className="w-full h-12 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Tab Header */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {([
                { id: "story", label: "Story" },
                { id: "updates", label: "Updates" },
                { id: "supporters", label: "Supporters" },
                { id: "risks", label: "Risks & Disclosure" },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 h-14 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
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
            {activeTab === "story" && (
              <div className="max-w-3xl">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.story || ""}
                </p>
              </div>
            )}

            {activeTab === "updates" && (
              <div className="max-w-3xl">
                {(project.updates?.length ?? 0) > 0 ? (
                  <div className="space-y-6">
                    {project.updates?.map(
                      (update: {
                        id: string;
                        date: string;
                        title: string;
                        content: string;
                      }) => (
                        <div
                          key={update.id}
                          className="border-b border-gray-200 pb-6 last:border-0"
                        >
                          <div className="text-sm text-gray-500 mb-2">
                            {update.date}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {update.title}
                          </h3>
                          <p className="text-gray-700">{update.content}</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No updates yet.</p>
                )}
              </div>
            )}

            {activeTab === "supporters" && (
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

            {activeTab === "risks" && (
              <div className="max-w-3xl">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-amber-900 mb-2">
                    Investment Risk Warning
                  </h3>
                  <p className="text-sm text-amber-800">
                    Cryptocurrency-based crowdfunding carries inherent risks.
                    Project outcomes are not guaranteed. Only contribute what you
                    can afford to lose.
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
    </div>
  );
}