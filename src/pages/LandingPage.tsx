// src/pages/LandingPage.tsx
// Landing 페이지
// - Slush Wallet을 우선으로 지갑 연결을 유도하고, 연결 완료 시 Explore로 진입
// - 연결된 지갑 주소는 localStorage에 저장해 다른 페이지에서 ‘표시/참조’할 수 있게 함

// Imports
// - React hooks: 상태/메모/사이드이펙트
// - Router: 연결 완료 후 Explore 이동
// - Mysten Sui dApp Kit: 지갑 탐지/연결/모달
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ConnectModal,
  useConnectWallet,
  useCurrentAccount,
  useWallets,
} from "@mysten/dapp-kit";

export default function Landing() {
  // Routing
  const navigate = useNavigate();

  // Wallet State
  // - account: 현재 연결된 계정(지갑 주소 등)
  // - isConnected: 주소 유무로 연결 여부 판단
  const account = useCurrentAccount();
  const isConnected = !!account?.address;

  // Effects
  // - 연결된 지갑 주소를 localStorage에 저장/해제 시 제거 (다른 페이지에서 표시/참조용)
  useEffect(() => {
    const addr = account?.address;
    if (addr) {
      localStorage.setItem("connectedWalletAddress", addr);
    } else {
      localStorage.removeItem("connectedWalletAddress");
    }
  }, [account?.address]);

  // Wallet Detection & Connect
  // - useWallets(): 브라우저에 주입된 지갑 목록 탐지
  // - useConnectWallet(): 특정 지갑으로 연결 요청(mutate)
  // - Slush가 탐지되면 Slush로 바로 연결, 없으면 ConnectModal을 열어 사용자가 선택
  const wallets = useWallets();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();

  // "Slush" 지갑 탐지(이름에 slush 포함 여부)
  const getSlushWallet = () =>
    wallets.find((w) => (w.name ?? "").toLowerCase().includes("slush"));

  // Slush 미탐지 시 대체 지갑 선택 모달 상태
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Connect CTA
  // - Slush 우선 연결 시도 → 실패(미탐지) 시 지갑 선택 모달 오픈
  const onConnectPreferred = () => {
    console.log("[Landing] Connect button clicked");
    console.log(
      "[Landing] Detected wallets =",
      wallets.map((w) => w.name),
    );

    const slush = getSlushWallet();

    if (slush) {
      console.log("[Landing] Connecting to Slush wallet:", slush.name);
      connectWallet({ wallet: slush });
      return;
    }

    console.log("[Landing] Slush not detected. Opening wallet modal.");
    setIsWalletModalOpen(true);
  };

  // Derived
  // - 네트워크 라벨(현재는 고정 문자열, 추후 env/config로 분리 가능)
  const networkLabel = useMemo(() => "Sui Testnet", []);

  return (
    <div className="min-h-screen text-white">
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(87, 70, 255, 0.25), transparent 25%), radial-gradient(circle at 80% 0%, rgba(0, 200, 255, 0.2), transparent 25%), linear-gradient(135deg, rgba(20, 20, 24, 0.96), rgba(10, 10, 16, 0.98))",
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-semibold tracking-[0.16em] leading-[1.1]">
                CRYPTO
              </div>
              <div className="text-sm font-semibold tracking-[0.16em] leading-[1.1]">
                FUND
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
                <span className="text-xs font-semibold text-green-500">
                  ● {networkLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mt-16 text-center">
            <h1 className="text-3xl font-semibold leading-relaxed">
              Empowering Creators
              <br />
              <span className="text-white" style={{ color: "#a78bfa" }}>
                Without Intermediaries
              </span>
            </h1>

            <p className="mt-4 text-sm text-white/80">
              블록체인을 통해 가장 투명하게 크리에이터를 응원하세요.
              <br />
              수수료 없는 직접 후원의 여정을 지금 시작해보세요.
            </p>

            {/* Connect CTA */}
            <div className="mt-8 flex justify-center">
              {!isConnected ? (
                <>
                  {/* Primary: prefer Slush wallet */}
                  <button
                    type="button"
                    onClick={onConnectPreferred}
                    disabled={isConnecting}
                    className="
                      inline-flex items-center justify-center rounded-full
                      bg-white px-8 py-2 text-sm font-semibold text-gray-900
                      cursor-pointer select-none
                      transition-transform transition-shadow duration-150
                      hover:shadow-lg active:scale-[0.98] active:shadow-md
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                      disabled:cursor-not-allowed disabled:opacity-70
                    "
                  >
                    {isConnecting ? "Connecting..." : "Connect Slush Wallet"}
                  </button>

                  {/* Fallback: wallet select modal (when Slush not detected) */}
                  <ConnectModal
                    open={isWalletModalOpen}
                    onOpenChange={setIsWalletModalOpen}
                    trigger={
                      <>
                        {/* trigger prop is required; hidden button used only for compliance */}
                        <button
                          type="button"
                          className="hidden"
                          aria-hidden="true"
                          tabIndex={-1}
                        />
                      </>
                    }
                  />
                </>
              ) : (
                <>
                  {/* Connected: enter Explore */}
                  <button
                    type="button"
                    onClick={() => navigate("/explore")}
                    className="
                      inline-flex items-center justify-center rounded-full
                      bg-white px-8 py-2 text-sm font-semibold text-gray-900
                      cursor-pointer select-none
                      transition-transform transition-shadow duration-150
                      hover:shadow-lg active:scale-[0.98] active:shadow-md
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                    "
                  >
                    Enter Explore
                  </button>
                </>
              )}
            </div>

            {/* Status / Debug */}
            <div className="mt-3 text-xs text-white/60">
              {isConnected ? (
                <span>
                  Connected:{" "}
                  <span className="text-white/80">{account?.address}</span>
                </span>
              ) : (
                <span>
                  Slush Wallet을 연결하면 Explore로 이동하는 버튼이 나타납니다.
                  <br />
                  <span className="text-white/40">
                    Detected wallets:{" "}
                    {/* Detected wallet names (debug) */}
                    {wallets.map((w) => w.name).join(", ") || "(none)"}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
