import React, { useMemo, useState } from "react";
import type { Influencer } from "../types";
import * as S from "./DonationPanael.style";

type Props = { influencer: Influencer };

export default function DonationPanel({ influencer }: Props) {
  const presets = useMemo(() => ["0.01", "0.05", "0.1", "0.5"], []);
  const [amount, setAmount] = useState<string>(presets[1]);

  const onClickDonate = () => {
    // TODO: Sui wallet connect + tx 전송으로 교체
    alert(`Donate ${amount} SUI to ${influencer.wallet.walletAddress}`);
  };

  return (
    <div>
      <S.Title>Donate</S.Title>

      <S.Row>
        {presets.map((p) => (
          <S.PresetButton
            key={p}
            $active={amount === p}
            type="button"
            onClick={() => setAmount(p)}
          >
            {p} SUI
          </S.PresetButton>
        ))}
      </S.Row>

      <S.InputRow>
        <S.Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Custom amount"
        />
        <S.Unit>SUI</S.Unit>
      </S.InputRow>

      <S.PrimaryButton type="button" onClick={onClickDonate}>
        Donate Now
      </S.PrimaryButton>

      <S.Note>
        Later: wallet connect 상태 확인 → tx status UI 추가
      </S.Note>
    </div>
  );
}
