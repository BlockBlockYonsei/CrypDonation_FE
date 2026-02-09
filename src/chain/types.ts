// src/chain/types.ts

export type ObjectId = string;
export type PackageId = string;
export type ModuleName = string;
export type MoveTarget = string;

export interface RewardInput {
  amount: bigint; // u64
  title: string;
  description: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  category: string;
  thumbnailUrlBytes: Uint8Array; // vector<u8>
  coverUrlBytes: Uint8Array; // vector<u8>
  goalAmount: bigint; // u64
  durationMs: bigint; // u64
  rewards: RewardInput[]; // vector<Reward>
}

export interface DonateInput {
  projectObjectId: ObjectId;
  amountMist: bigint; // u64
}