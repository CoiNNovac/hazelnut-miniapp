import { useEffect, useState } from 'react';
import { useTonWallet, CHAIN } from '@tonconnect/ui-react';
import './style.scss';

export const Balance = () => {
  const wallet = useTonWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) {
      setBalance(null);
      setError(null);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get address from wallet account
        const address = wallet.account.address;
        
        // Use TON API to fetch balance
        // For mainnet: https://tonapi.io/v2/accounts/{address}
        // For testnet: https://testnet.tonapi.io/v2/accounts/{address}
        const isTestnet = wallet.account.chain === CHAIN.TESTNET;
        // URL encode the address to handle special characters
        const encodedAddress = encodeURIComponent(address);
        const apiUrl = isTestnet 
          ? `https://testnet.tonapi.io/v2/accounts/${encodedAddress}`
          : `https://tonapi.io/v2/accounts/${encodedAddress}`;

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        
        // TON API returns balance in nanoTON format
        // The balance might be in data.balance or data.balance.balance
        let balanceNano = '0';
        if (typeof data.balance === 'string') {
          balanceNano = data.balance;
        } else if (typeof data.balance === 'number') {
          balanceNano = data.balance.toString();
        } else if (data.balance && typeof data.balance === 'object' && 'balance' in data.balance) {
          balanceNano = data.balance.balance?.toString() || '0';
        }
        
        // Convert from nanoTON to TON (1 TON = 1,000,000,000 nanoTON)
        const balanceDecimal = (Number(balanceNano) / 1000000000).toFixed(4);
        
        setBalance(balanceDecimal);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to load balance');
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    
    return () => clearInterval(interval);
  }, [wallet]);

  if (!wallet) {
    return (
      <div className="balance balance-disconnected">
        <p>Connect your wallet to view your TON balance</p>
      </div>
    );
  }

  if (loading && balance === null) {
    return (
      <div className="balance">
        <div className="balance-label">TON Balance</div>
        <div className="balance-value">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="balance">
        <div className="balance-label">TON Balance</div>
        <div className="balance-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="balance">
      <div className="balance-label">TON Balance</div>
      <div className="balance-value">{balance} TON</div>
    </div>
  );
};

