import React from "react";
import type { Influencer } from "../types";
import * as S from "./CreatorMeta.style";

type Props = { influencer: Influencer };

const shorten = (addr: string) => {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function CreatorMeta({ influencer }: Props) {
  return (
    <div>
      <S.SectionTitle>Wallet</S.SectionTitle>
      <S.MetaRow>
        <S.MetaLabel>Address</S.MetaLabel>
        <S.MetaValue title={influencer.wallet.walletAddress}>
          {shorten(influencer.wallet.walletAddress)}
        </S.MetaValue>
      </S.MetaRow>
      <S.MetaRow>
        <S.MetaLabel>Balance</S.MetaLabel>
        <S.MetaValue>{influencer.wallet.suiBalanceSuiDisplay}</S.MetaValue>
      </S.MetaRow>

      <S.Divider />

      <S.SectionTitle>Links</S.SectionTitle>
      <S.List>
        {influencer.creator_urls.map((url) => (
          <S.Item key={url}>
            <S.Link href={url} target="_blank" rel="noreferrer">
              {url}
            </S.Link>
          </S.Item>
        ))}
      </S.List>
    </div>
  );
}
