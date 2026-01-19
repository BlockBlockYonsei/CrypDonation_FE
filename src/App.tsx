import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import StartProjectWizard from "./pages/StartProjectWizard";
import FundingFullPage from "./pages/FundingFullPage";
import UserPage from "./pages/UserPage";

import Test from "./pages/ConnectTst";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/Test" element={<Test/>} />

          {/* 첫 진입을 랜딩으로 하고 싶으면 */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          <Route path="/landing" element={<Landing />} />
          <Route path="/explore" element={<ExplorePage />} />

          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/start-project" element={<StartProjectWizard />} />
          <Route path="/funding/:id" element={<FundingFullPage />} />
          <Route path="/user" element={<UserPage />} />
        </Routes>
      </div>
    </Router>
  );
}
