import { Transaction } from '@mysten/sui/transactions';
import { CHAIN, assertChainConfig } from './config';
import { TARGETS } from './targets';
import { bcs } from '@mysten/sui/bcs';

// BCS layout for Move struct `Reward { amount: u64, title: string, description: string }`
const RewardBcs = bcs.struct('Reward', {
  amount: bcs.u64(),
  title: bcs.string(),
  description: bcs.string(),
});

const RewardsVecBcs = bcs.vector(RewardBcs);

export function buildDonateTx(params: {
  projectObjectId: string;   // Project 공유 객체 id
  amountMist: bigint;        // u64로 넣을 값
}): Transaction {
  assertChainConfig();

  const { projectObjectId, amountMist } = params;
  if (!projectObjectId) throw new Error('Missing projectObjectId');
  if (amountMist <= 0n) throw new Error('Invalid amount');

  const tx = new Transaction();

  // payment: Coin<SUI> 만들기 (gas coin에서 split)
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);

  // donate(project: &mut Project, payment: Coin<SUI>, clock: &Clock, ctx)
  tx.moveCall({
    target: TARGETS.donate(),
    arguments: [
      tx.object(projectObjectId),
      paymentCoin,
      tx.object(CHAIN.CLOCK_ID),
    ],
    // ⚠️ 너 donate는 제네릭이 아니므로 typeArguments 넣지 마!
  });

  return tx;
}

export function buildCreateAndRegisterProjectTx(input: {
  title: string;
  description: string;
  category: string;
  thumbnailUrlBytes: Uint8Array; // vector<u8>
  coverUrlBytes: Uint8Array;     // vector<u8>
  goalAmount: bigint;            // u64
  durationMs: bigint;            // u64 (너 contract는 ms 기준으로 비교함)
  rewards: Array<{ amount: bigint; title: string; description: string }>; // BCS-encoded into vector<u8>
}): Transaction {
  assertChainConfig();

  const tx = new Transaction();

  // Serialize `vector<Reward>` using BCS. We pass raw bytes as a Pure arg;
  // the Move call will decode it as `vector<Reward>` based on the function signature.
  const rewardsBcsBytes = RewardsVecBcs
    .serialize(
      input.rewards.map((r) => ({
        amount: r.amount,
        title: r.title,
        description: r.description,
      }))
    )
    .toBytes();

  const projectId = tx.moveCall({
    target: TARGETS.createProject(),
    arguments: [
      tx.pure.string(input.title),
      tx.pure.string(input.description),
      tx.pure.string(input.category),

      tx.pure.vector('u8', Array.from(input.thumbnailUrlBytes)),
      tx.pure.vector('u8', Array.from(input.coverUrlBytes)),

      tx.pure.u64(input.goalAmount),
      tx.pure.u64(input.durationMs),

      // rewards: vector<Reward> (BCS bytes)
      tx.pure(rewardsBcsBytes),

      tx.object(CHAIN.CLOCK_ID),
    ],
  });

  // dashboard_2::register_project(&mut Dashboard, project_id: ID)
  tx.moveCall({
    target: TARGETS.registerProject(),
    arguments: [
      tx.object(CHAIN.DASHBOARD_ID),
      projectId,
    ],
  });

  return tx;
}