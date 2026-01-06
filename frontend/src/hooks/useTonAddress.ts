import { useTonWallet } from '@tonconnect/ui-react';
import { useMemo } from 'react';

/**
 * Hook for getting TON wallet address in different formats
 */
export function useTonAddress() {
  const wallet = useTonWallet();

  const address = useMemo(() => {
    if (!wallet) return null;
    return wallet.account.address;
  }, [wallet]);

  const shortAddress = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return {
    address,
    shortAddress,
    isConnected: !!wallet,
  };
}
