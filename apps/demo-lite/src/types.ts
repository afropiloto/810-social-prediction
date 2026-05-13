export interface User {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  bio?: string;
  socials?: {
    twitter?: string;
    tiktok?: string;
  };
  stats?: {
    winRate: number;
    totalProfit: number;
    marketsCreated: number;
    trades: number;
  };
  badges?: string[];
}

export interface Market {
  id: string;
  creator: User; // The content creator (e.g., TikToker)
  marketCreator: User; // The 810 user who created the market
  contentUrl: string;
  imageUrl: string;
  contentType: 'video' | 'image';
  question: string;
  metricLabel: string;
  currentValue: number;
  targetValue: number;
  endTime: string; // ISO string
  yesPrice: number; // 0 to 1
  noPrice: number; // 0 to 1
  volume: number;
  liquidity: number;
  category: string;
  whales: { username: string; position: 'YES' | 'NO'; amount: number }[];
}

export interface Position {
  marketId: string;
  position: 'YES' | 'NO';
  shares: number;
  avgPrice: number;
}
