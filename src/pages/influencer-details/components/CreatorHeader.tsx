import React from "react";
import type { Influencer } from "../types";
import * as S from "./CreatorHeader.style";

type Props = { influencer: Influencer };

export default function CreatorHeader({ influencer }: Props) {
  return (
    <S.Wrap>
      <S.Avatar src={influencer.img} alt={influencer.name} />
      <div>
        <S.Name>{influencer.name}</S.Name>
        <S.Desc>{influencer.description}</S.Desc>
      </div>
    </S.Wrap>
  );
}
