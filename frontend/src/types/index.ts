export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  walletAddress?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface RoadmapItem {
  quarter: string;
  status: 'completed' | 'active' | 'upcoming';
  title: string;
  items: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TokenIssuer {
  name: string;
  farmAddress: string;
  yearsOfExperience: number;
  licenseNumber: string;
  verified?: boolean;
}

export interface TokenDistribution {
  label: string;
  value: number;
  color: string;
}

export interface YearlyYield {
  year: string;
  targetYield: number;
  actualYield: number;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  description: string;
  price: number; // EUR price
  totalSupply: number;
  availableSupply: number;
  saleStart: string; // ISO date
  saleEnd: string; // ISO date
  logo: string;
  status: 'upcoming' | 'active' | 'ended';
  issuer: TokenIssuer;
  apy: number; // Annual percentage yield (12-18%)
  createdAt: string;
  roadmap?: RoadmapItem[];
  faq?: FAQItem[];
  whitepaperUrl?: string;
  distribution?: TokenDistribution[];
  telegramChannel?: string;
  yearlyYields?: YearlyYield[];
  // UI-specific optional properties
  balance?: number; // User's token balance
  value?: number; // Calculated value (balance * price)
  endTime?: number; // Sale end timestamp (milliseconds)
  tag?: string; // UI tag (e.g., "New", "Hot")
  tagColor?: string; // Tailwind class for tag color
}

export interface Purchase {
  id: string;
  userId: string;
  tokenId: string;
  amount: number;
  price: number;
  total: number;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  token: Token;
}

export interface Profit {
  id: string;
  userId: string;
  amount: number;
  txHash?: string;
  claimedAt?: string;
  createdAt: string;
}

export interface Portfolio {
  totalInvested: number;
  totalValue: number;
  totalProfit: number;
  profitPercentage: number;
  holdings: PortfolioHolding[];
}

export interface PortfolioHolding {
  token: Token;
  amount: number;
  invested: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  from?: string;
  to?: string;
  amount: number;
  currency: string;
  eurValue: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

export interface InvestmentStats {
  yourInvestment: number;
  yourShare: number;
  totalReceived: number;
  investmentReturned: number;
  targetYearlyYield: number;
}
