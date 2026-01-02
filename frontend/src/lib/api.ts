import type { User, Token, Purchase, Profit, Portfolio } from '@/types';
import { mockUser, mockTokens, mockPurchases, mockProfits } from './mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

class MockApiClient {
  private token: string | null = null;
  private user: User | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private getAuthToken() {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  // Auth endpoints
  async validateInitData(_initData: string): Promise<{ token: string; user: User }> {
    await delay();
    const token = 'mock_jwt_token_' + Date.now();
    this.user = mockUser;
    return { token, user: mockUser };
  }

  async getMe(): Promise<{ user: User }> {
    await delay();
    if (!this.getAuthToken()) {
      throw new Error('Unauthorized');
    }
    return { user: this.user || mockUser };
  }

  // Token endpoints
  async getTokens(): Promise<{ tokens: Token[] }> {
    await delay();
    return { tokens: mockTokens };
  }

  async getToken(id: string): Promise<{ token: Token }> {
    await delay();
    const token = mockTokens.find(t => t.id === id);
    if (!token) {
      throw new Error('Token not found');
    }
    return { token };
  }

  // Purchase endpoints
  async createPurchase(data: {
    tokenId: string;
    amount: number;
    txHash: string
  }): Promise<{ purchase: Purchase }> {
    await delay(1000);
    const token = mockTokens.find(t => t.id === data.tokenId);
    if (!token) {
      throw new Error('Token not found');
    }

    const purchase: Purchase = {
      id: 'purchase_' + Date.now(),
      userId: mockUser.id,
      tokenId: data.tokenId,
      amount: data.amount,
      price: token.price,
      total: data.amount * token.price,
      txHash: data.txHash,
      status: 'pending',
      createdAt: new Date().toISOString(),
      token,
    };

    // Simulate confirmation after 2 seconds
    setTimeout(() => {
      purchase.status = 'confirmed';
    }, 2000);

    return { purchase };
  }

  async getPurchases(): Promise<{ purchases: Purchase[] }> {
    await delay();
    return { purchases: mockPurchases };
  }

  // Profit endpoints
  async getProfits(): Promise<{ profits: Profit[] }> {
    await delay();
    return { profits: mockProfits };
  }

  async claimProfit(profitId: string): Promise<{ profit: Profit }> {
    await delay(1500);
    const profit = mockProfits.find(p => p.id === profitId);
    if (!profit) {
      throw new Error('Profit not found');
    }

    profit.claimedAt = new Date().toISOString();
    profit.txHash = 'tx_claim_' + Date.now();

    return { profit };
  }

  // Portfolio endpoint
  async getPortfolio(): Promise<{ portfolio: Portfolio }> {
    await delay();

    const holdings = mockPurchases.map(purchase => {
      const currentPrice = purchase.token.price * 1.15; // Simulate 15% profit
      const currentValue = purchase.amount * currentPrice;
      const profit = currentValue - purchase.total;

      return {
        token: purchase.token,
        amount: purchase.amount,
        invested: purchase.total,
        currentValue,
        profit,
        profitPercentage: (profit / purchase.total) * 100,
      };
    });

    const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfit = totalValue - totalInvested;

    return {
      portfolio: {
        totalInvested,
        totalValue,
        totalProfit,
        profitPercentage: (totalProfit / totalInvested) * 100,
        holdings,
      },
    };
  }
}

export const api = new MockApiClient();
