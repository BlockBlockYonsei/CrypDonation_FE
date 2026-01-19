import { useEffect } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export default function ConnectTest() {
  const account = useCurrentAccount();

  useEffect(() => {
    console.log("window.sui =", (window as any).sui);
    console.log("window.slush =", (window as any).slush);
    console.log("window.wallet =", (window as any).wallet);
    console.log("all window keys sample =", Object.keys(window as any).slice(0, 50));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Connect Test</h1>
      <ConnectButton />
      <p style={{ marginTop: 12 }}>
        account: {account?.address ?? "not connected"}
      </p>
    </div>
  );
}
