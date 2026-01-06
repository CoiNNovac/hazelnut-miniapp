import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useCallback } from 'react';

/**
 * Hook for TON Connect wallet connection management
 * Provides connection state and connect/disconnect methods
 */
export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const isConnected = !!wallet;

  const connect = useCallback(async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to open TON Connect modal:', error);
      throw error;
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }, [tonConnectUI]);

  return {
    isConnected,
    wallet,
    connect,
    disconnect,
    tonConnectUI,
  };
}
