export type TagId = number; // vector<u64> 대응 (FE에서는 number)

export type SocialTag =
  | "치지직"
  | "유튜브"
  | "숲"
  | "인스타그램"
  | "네이버블로그"
  | "티스토리"
  | "게임"
  | "일상"
  | "여행"
  | "꿀팁"
  | "먹방"
  | "V-log"
  | "버츄얼"
  | "주식"
  | "투자"
  | "학습관련";

export type SuiWallet = {
    walletAddress: string; // 받는 주소 (표시/ 도네이션 대상)
    suiBalanceMist: string; // 큰 숫자 대비 string으로
    suiBalanceSuiDisplay: string // UI 표시용
}

export type Influencer = {
    id: string;
    name: string;
    description: string;
    img: string;
    creator_urls: string[];
    wallet: SuiWallet;
    tags: TagId[];
};

export type Donation = {
    id: string;
    influencerId: string; 
    donor: string;
    amount: string;
    createdAT: string;
}