// src/api/index.ts

// Explicit exports from https.ts to avoid name collisions with ./types
export { api, ApiError, healthCheck } from "./https";
export type { HttpMethod } from "./https";

// Types and DTOs
export * from "./types";

// API modules
export * from "./modules/projects.api";
export * from "./modules/funding.api";
export * from "./modules/users.api";