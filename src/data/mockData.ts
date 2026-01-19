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

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Decentralized Social Network Platform',
    description: 'A privacy-first social network built on blockchain technology',
    category: 'Tech',
    thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80',
    goalAmount: 50000,
    raisedAmount: 38500,
    daysLeft: 12,
    status: 'live',
    creator: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      verified: true,
      pastProjects: 3,
    },
    story: 'Our mission is to create a truly decentralized social network where users own their data and control their privacy. This platform will use blockchain technology to ensure transparency and security.',
    updates: [
      {
        id: 'u1',
        date: '2026-01-15',
        title: 'Beta Testing Phase Begins',
        content: 'We are excited to announce that beta testing will begin next week.',
      },
    ],
    supporters: 247,
    rewards: [
      {
        id: 'r1',
        amount: 100,
        title: 'Early Adopter',
        description: 'Get early access to the platform',
        available: 50,
      },
      {
        id: 'r2',
        amount: 500,
        title: 'Premium Member',
        description: 'Early access + premium features for 1 year',
        available: 20,
      },
    ],
  },
  {
    id: '2',
    title: 'NFT Art Gallery Metaverse',
    description: 'Virtual gallery space for digital artists to showcase their work',
    category: 'Art',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=1200&q=80',
    goalAmount: 75000,
    raisedAmount: 82000,
    daysLeft: 0,
    status: 'successful',
    creator: {
      walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      verified: true,
      pastProjects: 5,
    },
    story: 'Creating immersive virtual spaces where artists can display and sell their NFT artwork.',
    updates: [],
    supporters: 512,
    rewards: [
      {
        id: 'r3',
        amount: 250,
        title: 'Virtual Gallery Pass',
        description: 'Access to exclusive gallery events',
        available: 100,
      },
    ],
  },
  {
    id: '3',
    title: 'Blockchain-Based Gaming Platform',
    description: 'Play-to-earn gaming ecosystem with cross-game assets',
    category: 'Game',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80',
    goalAmount: 100000,
    raisedAmount: 65000,
    daysLeft: 23,
    status: 'live',
    creator: {
      walletAddress: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8',
      verified: false,
      pastProjects: 1,
    },
    story: 'Building a gaming platform where players truly own their in-game assets.',
    updates: [],
    supporters: 389,
    rewards: [
      {
        id: 'r4',
        amount: 50,
        title: 'Founder Token',
        description: 'Exclusive founder NFT token',
        available: 500,
      },
    ],
  },
  {
    id: '4',
    title: 'Open Source Design System',
    description: 'Comprehensive design system for Web3 applications',
    category: 'Design',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
    goalAmount: 25000,
    raisedAmount: 18500,
    daysLeft: 8,
    status: 'live',
    creator: {
      walletAddress: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
      verified: true,
      pastProjects: 2,
    },
    story: 'A comprehensive, open-source design system specifically built for Web3 applications.',
    updates: [],
    supporters: 156,
    rewards: [
      {
        id: 'r5',
        amount: 100,
        title: 'Supporter',
        description: 'Early access to design system',
        available: 200,
      },
    ],
  },
  {
    id: '5',
    title: 'Decentralized Music Streaming',
    description: 'Fair compensation for artists through blockchain royalties',
    category: 'Music',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
    goalAmount: 60000,
    raisedAmount: 42000,
    daysLeft: 15,
    status: 'live',
    creator: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      verified: true,
      pastProjects: 4,
    },
    story: 'Revolutionizing music streaming by ensuring artists get fair compensation through blockchain technology.',
    updates: [],
    supporters: 298,
    rewards: [
      {
        id: 'r6',
        amount: 75,
        title: 'Music Lover',
        description: 'Lifetime premium subscription',
        available: 300,
      },
    ],
  },
  {
    id: '6',
    title: 'Community-Driven Education DAO',
    description: 'Decentralized learning platform governed by community',
    category: 'Social',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    goalAmount: 40000,
    raisedAmount: 35000,
    daysLeft: 5,
    status: 'live',
    creator: {
      walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      verified: true,
      pastProjects: 2,
    },
    story: 'Building a community-governed education platform where learners and educators collaborate.',
    updates: [],
    supporters: 421,
    rewards: [
      {
        id: 'r7',
        amount: 50,
        title: 'Student Pass',
        description: 'Access to all courses',
        available: 500,
      },
    ],
  },
];

export const userTransactions = [
  {
    id: 't1',
    type: 'funded',
    projectTitle: 'Decentralized Social Network Platform',
    amount: 500,
    date: '2026-01-15',
    txHash: '0x1234...5678',
  },
  {
    id: 't2',
    type: 'funded',
    projectTitle: 'NFT Art Gallery Metaverse',
    amount: 250,
    date: '2026-01-10',
    txHash: '0xabcd...efgh',
  },
  {
    id: 't3',
    type: 'created',
    projectTitle: 'My Amazing Project',
    amount: 0,
    date: '2026-01-05',
    txHash: '0x9876...5432',
  },
];
