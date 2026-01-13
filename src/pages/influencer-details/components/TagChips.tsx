import React from "react";
import type { TagId } from "../types";
import { TAGS } from "../../../assets/tags";
import * as S from "./Tagchips.style";

type Props = { tagIds: TagId[] };

export default function TagChips({ tagIds }: Props) {
  const labels = tagIds
    .map((id) => TAGS[id])
    .filter(Boolean);

  return (
    <div>
      <S.Title>Tags</S.Title>
      <S.Wrap>
        {labels.map((label) => (
          <S.Chip key={label}>#{label}</S.Chip>
        ))}
      </S.Wrap>
    </div>
  );
}
