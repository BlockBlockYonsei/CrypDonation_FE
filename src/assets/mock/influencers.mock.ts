import type { Influencer } from "../../pages/influencer-details/types";
import streamerMeta from "../Streamer_Profile_Demo/streamers.meta.json";

const streamerImages = import.meta.glob(
  "../Streamer_Profile_Demo/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
);

// id 기반으로 "서로 다른" 지갑 문자열을 만들어주는 함수 (MVP용)
const makeWalletAddress = (id: string) => {
  // 40자리 hex 비슷하게 만들어서 0x + 40 chars 형태로 맞춰줌
  const core = (id.repeat(40)).slice(0, 40);
  return `0x${core}`;
};

type Meta = {
  description?: string;
  creator_urls?: string[];
  tags?: number[];
};

export const INFLUENCERS_MOCK: Influencer[] = Object.entries(streamerImages).map(
  ([path, image], index) => {
    const fileName = path.split("/").pop()!;
    const id = String(index + 1);
    const name = fileName.replace(/\.[^/.]+$/, "");
    const meta = (streamerMeta as Record<string, Meta>)[name];
    const sui = (Number(id) * 1.25).toFixed(3); // 1.250, 2.500, ...
    const mist = String(Math.round(Number(sui) * 1_000_000_000)); // 임의 환산

    return {
      id,
      name,
      description: meta?.description ?? "설명이 없습니다.",
      img: image as string,
      creator_urls: meta?.creator_urls ?? [], // meta에 있으면 반영
      wallet: {
        walletAddress: makeWalletAddress(id),      // ✅ 이제 0000 아님
        suiBalanceMist: mist,                      // ✅ id별 상이
        suiBalanceSuiDisplay: `${sui} SUI`,        // ✅ id별 상이
      },
      tags: meta?.tags ?? [],
    };
  }
);
