// src/chain/targets.ts
import { CHAIN } from './config';

export const TARGETS = {
  createProject: () => `${CHAIN.PACKAGE_ID}::${CHAIN.PROJECT_MODULE}::create_project`,
  donate: () => `${CHAIN.PACKAGE_ID}::${CHAIN.PROJECT_MODULE}::donate`,
  registerProject: () => `${CHAIN.PACKAGE_ID}::${CHAIN.DASHBOARD_MODULE}::register_project`,
} as const;