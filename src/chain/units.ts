// src/chain/units.ts
export function safeNumber(input: string): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : 0;
}

export function suiToMist(amountSui: number): bigint {
  if (!Number.isFinite(amountSui) || amountSui <= 0) return 0n;
  return BigInt(Math.floor(amountSui * 1_000_000_000));
}