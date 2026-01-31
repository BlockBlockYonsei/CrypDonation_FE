export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  coverUrl: string;
  goalAmount: number;
  raisedAmount: number;
  daysLeft: number;
  status: 'live' | 'successful' | 'ended';
  creator: {
    walletAddress: string;
    verified: boolean;
    pastProjects: number;
  };
  story: string;
  updates: Array<{
    id: string;
    date: string;
    title: string;
    content: string;
  }>;
  supporters: number;
  rewards: Array<{
    id: string;
    amount: number;
    title: string;
    description: string;
    available: number;
  }>;
}

export const categories = ['All', 'Tech', 'Art', 'Social', 'Game', 'Design', 'Music'];

// NOTE: mockProjects is intentionally kept (empty) to avoid breaking imports.
// We now source project lists/details from the backend (DB/seed data).
export const mockProjects: Project[] = [];

// NOTE: userTransactions mock is no longer used. Backend will provide real activity/tx history.
export const userTransactions: Array<{
  id: string;
  type: 'funded' | 'created';
  projectTitle: string;
  amount: number;
  date: string;
  txHash: string;
}> = [];
