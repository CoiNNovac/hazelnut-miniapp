// User roles
export type UserRole = 'superadmin' | 'admin' | 'farmer';

// Campaign status
export type CampaignStatus =
  | 'pending'
  | 'approved'
  | 'running'
  | 'paused'
  | 'finished'
  | 'rejected'
  | 'cancelled';

// Transaction status
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// JWT Claims
export interface JwtClaims {
  sub: string;        // User ID
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Request DTOs
export interface LoginRequest {
  username: string;
  password: string;
}

export interface WalletLoginRequest {
  address: string;
  proof?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  address: string;
  role: UserRole;
  name?: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  logoUrl?: string;
  imageUrl?: string;
  startTime: string;
  endTime: string;
  suggestedPrice: string;
}

export interface UpdateCampaignStatusRequest {
  status: CampaignStatus;
}

export interface MintMkoinRequest {
  recipient: string;
  amount: string;
}

export interface CreatePurchaseRequest {
  campaignId: string;
  mkoinPaid: string;
  tokensReceived: string;
  txHash?: string;
}

// Response DTOs
export interface UserResponse {
  id: string;
  username?: string;
  address: string;
  role: UserRole;
  name?: string;
  isDisabled: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface CampaignResponse {
  id: string;
  farmerId: string;
  farmerName?: string;
  name: string;
  description?: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  logoUrl?: string;
  imageUrl?: string;
  startTime: Date;
  endTime: Date;
  suggestedPrice: string;
  status: CampaignStatus;
  tokenAddress?: string;
  mintedAt?: Date;
  mintTxHash?: string;
  createdAt: Date;
}

export interface PurchaseResponse {
  id: string;
  userAddress: string;
  campaignId: string;
  campaignName?: string;
  mkoinPaid: string;
  tokensReceived: string;
  txHash?: string;
  status: TransactionStatus;
  purchasedAt: Date;
  confirmedAt?: Date;
}

export interface MkoinMintResponse {
  id: string;
  recipientAddress: string;
  amount: string;
  txHash?: string;
  mintedBy?: string;
  status: TransactionStatus;
  mintedAt: Date;
  confirmedAt?: Date;
}

export interface BalanceResponse {
  address: string;
  mkoinBalance: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  tokenAddress: string;
  symbol: string;
  balance: string;
  campaignId?: string;
}

export interface PortfolioResponse {
  userAddress: string;
  totalValue: string;
  holdings: PortfolioHolding[];
}

export interface PortfolioHolding {
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;
  value: string;
  campaignId?: string;
}

export interface CampaignStats {
  campaignId: string;
  totalPurchases: number;
  totalMkoinPaid: string;
  totalTokensSold: string;
  uniqueBuyers: number;
}
