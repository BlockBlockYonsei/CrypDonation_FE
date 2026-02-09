// src/chain/errors.ts
export function humanizeTxError(e: unknown): string {
  const msg = (e as any)?.message ? String((e as any).message) : 'Transaction failed.';
  if (msg.toLowerCase().includes('user rejected')) return '지갑 서명이 취소되었습니다.';
  if (msg.includes('MoveAbort')) return `온체인 로직에서 실패: ${msg}`;
  return msg;
}