// src/chain/bcs.ts
import { bcs } from '@mysten/sui/bcs';

export const RewardBCS = bcs.struct('Reward', {
  amount: bcs.u64(),
  title: bcs.string(),
  description: bcs.string(),
});

export const RewardsVecBCS = bcs.vector(RewardBCS);