import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";


const TESTNET_DASHBOARD = "0xfa273626aaca8b0039a1ccc10384d0ee8c2689714b1fc9785e027a17de1c942d";
const TESTNET_PACKAGE_ID = "0xbefd89098d0213e62043a04e3fbb5070bb1fccc41533f37c4b11fd86907843da";

const DEVNET_DASHBOARD = "";
const DEVNET_PACKAGE_ID = "";

const MAINNET_DASHBOARD = "";
const MAINNET_PACKAGE_ID = "";


const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables : {
        DashboardID : DEVNET_DASHBOARD,
        PackageID: DEVNET_PACKAGE_ID
      }
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables : {
        DashboardID : TESTNET_DASHBOARD,
        PackageID: TESTNET_PACKAGE_ID
      }
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables : {
        DashboardID : MAINNET_DASHBOARD,
        PackageID: MAINNET_PACKAGE_ID
      }
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
