/// <reference types="vite/client" />

export const CHAIN = {
  PACKAGE_ID: '0x9df5ba2cde1e772c730c87e7943ae66642e4f8d1b5d67edbd28c966634a07081',
  PROJECT_MODULE: 'project_2',
  DASHBOARD_MODULE: 'dashboard_2',
  CLOCK_ID: '0x6',
  DASHBOARD_ID: '0x924cae1064cfaa25385ac9b207efbb0f114a30fd57fd0a70112f60795c44b189',
} as const;

export function assertChainConfig() {
  if (!CHAIN.PACKAGE_ID) {
    throw new Error('Missing PACKAGE_ID (set VITE_PACKAGE_ID in .env or use the default in src/chain/config.ts)');
  }
  if (!CHAIN.DASHBOARD_ID) {
    throw new Error('Missing DASHBOARD_ID (set VITE_DASHBOARD_ID in .env or use the default in src/chain/config.ts)');
  }
}