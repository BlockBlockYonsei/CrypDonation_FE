import React, { useMemo } from "react";
import { DONATIONS_MOCK } from "../../assets/mock/donation.mock";
import type { Influencer, Donation } from "./types";
import * as S from "./Influencer-Details.style";

import CreatorHeader from "./components/CreatorHeader";
import CreatorMeta from "./components/CreatorMeta";
import TagChips from "./components/TagChips";
import DonationPanel from "./components/DonationPanel";
import RecentDonations from "./components/RecentDonation";

type Props = {
  influencer: Influencer;
};

export default function InfluencerDetailsContent({ influencer }: Props) {
  const donations: Donation[] = useMemo(() => {
    return DONATIONS_MOCK.filter((d) => d.influencerId === influencer.id);
  }, [influencer.id]);

  return (
    <div>
      <S.Title>Creator Profile</S.Title>

      <S.Grid>
        <S.Col>
          <S.Card>
            <CreatorHeader influencer={influencer} />
          </S.Card>
          <S.Card>
            <CreatorMeta influencer={influencer} />
          </S.Card>
          <S.Card>
            <TagChips tagIds={influencer.tags} />
          </S.Card>
        </S.Col>

        <S.Col>
          <S.Card>
            <DonationPanel influencer={influencer} />
          </S.Card>
          <S.Card>
            <RecentDonations donations={donations} />
          </S.Card>
        </S.Col>
      </S.Grid>
    </div>
  );
}
