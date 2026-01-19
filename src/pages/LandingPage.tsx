// src/pages/Landing.tsx
import { useEffect, useMemo, useState } from "react";
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

  // Persist connected wallet address for other pages (e.g., Explore navbar)
  useEffect(() => {
    const addr = account?.address;
    if (addr) {
      localStorage.setItem("connectedWalletAddress", addr);
    } else {
      localStorage.removeItem("connectedWalletAddress");
    }
  }, [account?.address]);

  // Direct-connect helpers (prefer Slush if available)
  const wallets = useWallets();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();

  const getSlushWallet = () =>
    wallets.find((w) => (w.name ?? "").toLowerCase().includes("slush"));

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

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

    // Fallback: open the modal so the user can pick any available wallet
    console.log("[Landing] Slush not detected. Opening wallet modal.");
    setIsWalletModalOpen(true);
  };

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

            <div className="mt-8 flex justify-center">
              {!isConnected ? (
                <>
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

                  {/* Fallback wallet picker modal (only opens if Slush is not detected) */}
                  <ConnectModal
                    open={isWalletModalOpen}
                    onOpenChange={setIsWalletModalOpen}
                    trigger={
                      <button
                        type="button"
                        className="hidden"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    }
                  />
                </>
              ) : (
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
              )}
            </div>

            {/* 상태 안내 */}
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
                    Detected wallets: {wallets.map((w) => w.name).join(", ") || "(none)"}
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
