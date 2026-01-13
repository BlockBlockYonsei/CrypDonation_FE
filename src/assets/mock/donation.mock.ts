import type { Donation } from "../../pages/influencer-details/types";

export const DONATIONS_MOCK: Donation[] = [
  {
    id: "1",
    influencerId: "1",
    donor: "0x12ab...90ef",
    amount: "0.05 SUI",
    createdAT: "2026-01-13",
  },
  {
    id: "2",
    influencerId: "2",
    donor: "0x98cd...12aa",
    amount: "0.12 SUI",
    createdAT: "2026-01-12",
  },
  {
    id: "3",
    influencerId: "3",
    donor: "0x44ff...77bb",
    amount: "1.00 SUI",
    createdAT: "2026-01-10",
  },
];
