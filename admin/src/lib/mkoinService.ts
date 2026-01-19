import api from './api';
import { MintMkoinRequest, MintMkoinResponse, TokenBalance } from '../types';

export const mkoinService = {
  /**
   * Mint MKOIN to a recipient address
   */
  mintMkoin: async (data: MintMkoinRequest): Promise<MintMkoinResponse> => {
    const res = await api.post<MintMkoinResponse>('/admin/mkoin/mint', data);
    return res.data;
  },

  /**
   * Get MKOIN balance for an address
   */
  getBalance: async (address: string): Promise<TokenBalance> => {
    const res = await api.get<TokenBalance>(`/admin/mkoin/balance/${address}`);
    return res.data;
  },

  /**
   * Get total MKOIN supply
   */
  getTotalSupply: async (): Promise<{ total_supply: string; total_supply_nanocoins: string }> => {
    const res = await api.get<{ total_supply: string; total_supply_nanocoins: string }>('/admin/mkoin/total-supply');
    return res.data;
  },

  /**
   * Get minting history
   * Note: This endpoint needs to be implemented in backend
   */
  getMintHistory: async (): Promise<any[]> => {
    try {
      const res = await api.get('/admin/mkoin/history');
      return res.data;
    } catch (error) {
      // Return empty array if endpoint not implemented yet
      return [];
    }
  },
};
