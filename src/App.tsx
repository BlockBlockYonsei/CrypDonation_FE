import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Landing from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import StartProjectWizard from "./pages/StartProjectWizard";
import FundingFullPage from "./pages/FundingFullPage";
import UserPage from "./pages/UserPage";
import ProjectManagePage from "./pages/ProjectManagePage";

import Test from "./pages/ConnectTst";

function ProjectRoleGate() {
  const { id } = useParams<{ id: string }>();
  const [isCreator, setIsCreator] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (!id) {
          if (!cancelled) setIsCreator(false);
          return;
        }

        const myWallet =
          typeof window !== "undefined"
            ? window.localStorage.getItem("connectedWalletAddress")
            : null;

        // ✅ role 판정은 BE access API로 통일 (creator/viewer)
        // - BE: GET /api/projects/:id/access
        // - DEV: auth.js가 x-wallet-address 헤더를 허용
        const res = await fetch(`/api/projects/${id}/access`, {
          method: "GET",
          headers: myWallet
            ? {
                "x-wallet-address": myWallet,
              }
            : undefined,
        });

        if (!res.ok) {
          if (!cancelled) setIsCreator(false);
          return;
        }

        const data = await res.json();
        const role = String(data?.role || "").toLowerCase();

        if (!cancelled) setIsCreator(role === "creator");
      } catch {
        if (!cancelled) setIsCreator(false);
      }
    }

    setIsCreator(null);
    run();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 로딩 중에는 잠깐만 빈 화면/로딩을 보여주고, 완료되면 역할에 따라 페이지를 렌더
  if (isCreator === null) {
    return (
      <div className="min-h-screen bg-white" />
    );
  }

  return isCreator ? <ProjectManagePage /> : <ProjectDetailPage />;
}

export default function App() {
  useEffect(() => {
    // ✅ Vercel/로컬에서 env가 실제로 주입됐는지 확인용
    console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
    console.log("VITE_API_PROXY_TARGET =", (import.meta as any).env?.VITE_API_PROXY_TARGET);
    console.log("MODE =", import.meta.env.MODE, "DEV =", import.meta.env.DEV, "PROD =", import.meta.env.PROD);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/Test" element={<Test/>} />

          {/* 첫 진입을 랜딩으로 하고 싶으면 */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          <Route path="/landing" element={<Landing />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/projects/:id" element={<ProjectRoleGate />} />
          <Route path="/projects/:id/detail" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/manage" element={<ProjectManagePage />} />
          <Route path="/start-project" element={<StartProjectWizard />} />
          <Route path="/funding/:id" element={<FundingFullPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/manage" element={<Navigate to="/explore" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
