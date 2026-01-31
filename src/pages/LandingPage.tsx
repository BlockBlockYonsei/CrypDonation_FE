// src/pages/LandingPage.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ConnectModal,
  useConnectWallet,
  useCurrentAccount,
  useWallets,
} from "@mysten/dapp-kit";

export default function Landing() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const isConnected = !!account?.address;

  const sectorScrollRef = useRef<HTMLDivElement>(null);
  
  // 스크롤 방식 대신 State로 현재 단계(0,1,2)를 관리
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const addr = account?.address;
    if (addr) {
      localStorage.setItem("connectedWalletAddress", addr);
    } else {
      localStorage.removeItem("connectedWalletAddress");
    }
  }, [account?.address]);

  const wallets = useWallets();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();

  // Sector Scroll Logic
  const scrollSectors = (direction: "left" | "right") => {
    if (sectorScrollRef.current) {
      const container = sectorScrollRef.current;
      const scrollAmount = container.clientWidth;
      if (direction === "left") {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  };

  // 화살표 클릭 핸들러
  const handlePrev = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentStep((prev) => (prev < 2 ? prev + 1 : 2));
  };

  const getSlushWallet = () => wallets.find((w) => (w.name ?? "").toLowerCase().includes("slush"));
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const onConnectPreferred = () => {
    const slush = getSlushWallet();
    if (slush) {
      connectWallet({ wallet: slush });
      return;
    }
    setIsWalletModalOpen(true);
  };

  const networkLabel = useMemo(() => "Sui Testnet", []);

  return (
    <div className="min-h-screen text-white">
      <style>{`
        [data-scrollbar-hide]::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(87, 70, 255, 0.25), transparent 25%), radial-gradient(circle at 80% 0%, rgba(0, 200, 255, 0.2), transparent 25%), linear-gradient(135deg, rgba(20, 20, 24, 0.96), rgba(10, 10, 16, 0.98))",
        }}
      >
        {/* 1. Hero Section */}
        {/* 수정됨: 불필요한 하단 마진 제거 (mb-32 삭제됨) */}
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-semibold tracking-[0.16em] leading-[1.1]">CRYPTO</div>
              <div className="text-sm font-semibold tracking-[0.16em] leading-[1.1]">FUND</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
                <span className="text-xs font-semibold text-green-500">● {networkLabel}</span>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="mt-16">
            <div className="flex flex-row items-start gap-8">
              <div className="flex-shrink-0 text-left">
                <h1 className="text-3xl font-semibold leading-relaxed">
                  Empowering Creators<br />
                  <span className="text-white" style={{ color: "#a78bfa" }}>Without Intermediaries</span>
                </h1>
                <p className="mt-4 text-sm text-white/80">
                  블록체인을 통해 가장 투명하게 크리에이터를 응원하세요.<br />
                  수수료 없는 직접 후원의 여정을 지금 시작해보세요.
                </p>
                <div className="mt-8">
                  {!isConnected ? (
                    <>
                      <button onClick={onConnectPreferred} disabled={isConnecting} className="inline-flex items-center justify-center rounded-full bg-white px-8 py-2 text-sm font-semibold text-gray-900 transition-all hover:shadow-lg active:scale-[0.98]">
                        {isConnecting ? "Connecting..." : "Connect Slush Wallet"}
                      </button>
                      <ConnectModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} trigger={<button className="hidden" />} />
                    </>
                  ) : (
                    <button onClick={() => navigate("/explore")} className="inline-flex items-center justify-center rounded-full bg-white px-8 py-2 text-sm font-semibold text-gray-900 transition-all hover:shadow-lg active:scale-[0.98]">
                      Enter Explore
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-6">
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-5 flex flex-col items-center text-center">
                  <svg className="w-12 h-12 mb-3" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="12" height="12" fill="#c4b5fd" rx="2"/><rect x="28" y="8" width="12" height="12" fill="#c4b5fd" rx="2"/><rect x="18" y="28" width="12" height="12" fill="#c4b5fd" rx="2"/><line x1="14" y1="20" x2="34" y2="28" stroke="#c4b5fd" strokeWidth="1.5"/><line x1="34" y1="20" x2="24" y2="28" stroke="#c4b5fd" strokeWidth="1.5"/></svg>
                  <h3 className="text-xs font-semibold text-purple-300 mb-1">Trustless Tech</h3>
                  <p className="text-xs text-white/70">검증 가능한 투명성</p>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-5 flex flex-col items-center text-center">
                  <svg className="w-12 h-12 mb-3" viewBox="0 0 48 48" fill="none"><path d="M24 8V32" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/><path d="M18 20L24 8L30 20" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="24" cy="38" r="4" fill="#93c5fd"/><path d="M20 36H28" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/></svg>
                  <h3 className="text-xs font-semibold text-blue-300 mb-1">Zero Fee</h3>
                  <p className="text-xs text-white/70">효율과 상생</p>
                </div>
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-5 flex flex-col items-center text-center">
                  <svg className="w-12 h-12 mb-3" viewBox="0 0 48 48" fill="none"><path d="M12 16C12 12.68 14.68 10 18 10H30C33.32 10 36 12.68 36 16V28C36 31.32 33.32 34 30 34H18C14.68 34 12 31.32 12 28V16Z" fill="#86efac" opacity="0.3"/><path d="M18 16L24 22L30 16" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 28L24 22L30 28" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h3 className="text-xs font-semibold text-green-300 mb-1">Exclusive</h3>
                  <p className="text-xs text-white/70">참여와 보상</p>
                </div>
                <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 p-5 flex flex-col items-center text-center">
                  <svg className="w-12 h-12 mb-3" viewBox="0 0 48 48" fill="none"><path d="M24 40C15.17 40 8 36.33 8 28C8 20.42 13.24 14.43 20 13.46V6L32 16L20 26V19.58C14.53 20.47 10 25.65 10 28C10 34.63 16.37 40 24 40Z" fill="#fbcfe8"/></svg>
                  <h3 className="text-xs font-semibold text-pink-300 mb-1">Creative</h3>
                  <p className="text-xs text-white/70">독립과 확장</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sectors Section */}
        {/* mb-40 (약 160px) 적용: 이 섹션과 펀딩 과정 사이에 넓은 공간 확보 */}
        <div className="mx-auto w-full max-w-6xl px-6 py-24 mb-40">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold text-white mb-4">크라우드펀딩 섹터</h2>
          </div>
          <div className="relative flex items-center gap-4">
            <button onClick={() => scrollSectors("left")} className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all text-white/70 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <div className="flex-1 overflow-hidden">
              <div ref={sectorScrollRef} className="flex gap-6 pb-0 overflow-x-auto scroll-smooth" data-scrollbar-hide>
                {/* Sector Cards */}
                <div className="flex-shrink-0 w-full h-96 rounded-lg border border-blue-500/30 bg-blue-500/10 p-6 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4">💻</div>
                  <h3 className="text-lg font-semibold text-blue-300">Tech</h3>
                </div>
                <div className="flex-shrink-0 w-full h-96 rounded-lg border border-purple-500/30 bg-purple-500/10 p-6 flex flex-col items-center justify-center text-center"><div className="text-4xl mb-4">🎨</div><h3 className="text-lg font-semibold text-purple-300">Art</h3></div>
                <div className="flex-shrink-0 w-full h-96 rounded-lg border border-green-500/30 bg-green-500/10 p-6 flex flex-col items-center justify-center text-center"><div className="text-4xl mb-4">🤝</div><h3 className="text-lg font-semibold text-green-300">Social</h3></div>
                <div className="flex-shrink-0 w-full h-96 rounded-lg border border-pink-500/30 bg-pink-500/10 p-6 flex flex-col items-center justify-center text-center"><div className="text-4xl mb-4">🎮</div><h3 className="text-lg font-semibold text-pink-300">Game</h3></div>
              </div>
            </div>
            <button onClick={() => scrollSectors("right")} className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all text-white/70 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        {/* 3. Crowdfunding Process Section */}
        {/* mb-40 (약 160px) 적용: 이 섹션과 플랫폼 로고 사이에 넓은 공간 확보 */}
        <div className="mx-auto w-full max-w-7xl px-6 py-32 mb-40">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold text-white mb-4">크라우드펀딩, 3단계로 시작하세요</h2>
            <p className="text-sm text-white/70">탐색부터 펀딩까지, 간단하고 투명한 3단계 과정</p>
          </div>

          <div className="flex items-center justify-center gap-8">
            
            {/* Left Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex-shrink-0 z-20 w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xl backdrop-blur-sm ${currentStep === 0 ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed" : "bg-white/10 hover:bg-white/20 border-white/20 text-white/70 hover:text-white"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* 카드 컨테이너 */}
            <div className="w-[300px] overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentStep * 100}%)` }}
              >
                
                {/* Step 1 */}
                <div className="w-full flex-shrink-0 flex flex-col items-center">
                  <div className="w-[300px] h-[180px] rounded-lg overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center relative">
                    <img src="/process-step-1-explore.png" alt="Step 1" className="h-full w-full object-contain p-4" />
                  </div>
                  <div className="p-4 text-center w-full">
                    <div className="inline-flex items-center gap-3">
                      <div className="bg-cyan-500/90 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                      <h3 className="text-sm font-semibold text-cyan-300">프로젝트 탐색</h3>
                    </div>
                    <p className="text-xs text-white/60 mt-2">다양한 섹터의 프로젝트를 검색하세요.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="w-full flex-shrink-0 flex flex-col items-center">
                  <div className="w-[300px] h-[180px] rounded-lg overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center relative">
                    <img src="/process-step-2-detail.png" alt="Step 2" className="h-full w-full object-contain p-4" />
                  </div>
                  <div className="p-4 text-center w-full">
                    <div className="inline-flex items-center gap-3">
                      <div className="bg-purple-500/90 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                      <h3 className="text-sm font-semibold text-purple-300">상세 정보 확인</h3>
                    </div>
                    <p className="text-xs text-white/60 mt-2">프로젝트 목표와 리워드를 확인하세요.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="w-full flex-shrink-0 flex flex-col items-center">
                  <div className="w-[300px] h-[180px] rounded-lg overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center relative">
                    <img src="/process-step-3-fund.png" alt="Step 3" className="h-full w-full object-contain p-4" />
                  </div>
                  <div className="p-4 text-center w-full">
                    <div className="inline-flex items-center gap-3">
                      <div className="bg-green-500/90 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                      <h3 className="text-sm font-semibold text-green-300">펀딩 완료</h3>
                    </div>
                    <p className="text-xs text-white/60 mt-2">금액 입력 후 펀딩을 완료하세요.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 2}
              className={`flex-shrink-0 z-20 w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xl backdrop-blur-sm ${currentStep === 2 ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed" : "bg-white/10 hover:bg-white/20 border-white/20 text-white/70 hover:text-white"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* 4. Platforms Section */}
        <div className="mx-auto w-full max-w-6xl px-6 py-32 flex justify-center gap-12 flex-wrap">
            <div className="flex justify-center items-center h-24 bg-white/5 rounded-lg border border-white/10 p-4"><svg className="h-16 w-auto" viewBox="0 0 48 48"><path d="M45.012 10.793c-.503-1.855-1.99-3.316-3.822-3.816C39.667 6.5 24 6.5 24 6.5s-15.667 0-17.19.477c-1.833.5-3.319 1.961-3.822 3.816C2.5 12.635 2.5 17.5 2.5 24c0 6.5 0 11.365.488 13.207.503 1.855 1.989 3.316 3.822 3.816 1.523.477 17.19.477 17.19.477s15.667 0 17.19-.477c1.833-.5 3.319-1.961 3.822-3.816.488-1.842.488-6.707.488-13.207 0-6.5 0-11.365-.488-13.207z" fill="#FF0000"/><path d="M19.5 30.5L31 24L19.5 17.5V30.5Z" fill="white"/></svg></div>
            <img src="/숲 로고.png" alt="Soop" className="h-16 w-auto" />
            <img src="/치지직 로고.png" alt="Evilech" className="h-16 w-auto" />
            <img src="/트위치 로고.png" alt="Zigzag" className="h-16 w-auto" />
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}