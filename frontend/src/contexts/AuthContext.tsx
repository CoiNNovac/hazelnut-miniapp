import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (initData: string) => Promise<void>;
  logout: () => void;
  // Wallet state
  walletAddress: string | null;
  walletConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TON Connect integration
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Sync wallet state when wallet connection changes
  useEffect(() => {
    if (wallet) {
      const address = wallet.account.address;
      setWalletAddress(address);
      // Persist wallet address
      localStorage.setItem('tonWalletAddress', address);

      // Update user's wallet address in backend if user is authenticated
      if (user && token) {
        api.updateWalletAddress(address).catch(console.error);
      }
    } else {
      setWalletAddress(null);
      localStorage.removeItem('tonWalletAddress');
    }
  }, [wallet, user, token]);

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      api.setToken(storedToken);
      api
        .getMe()
        .then(({ user }) => {
          setUser(user);
          setToken(storedToken);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (initData: string) => {
    try {
      const { token: newToken, user: newUser } = await api.validateInitData(initData);
      api.setToken(newToken);
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Disconnect TON wallet
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }

    // Clear auth data
    api.setToken(null);
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('tonWalletAddress');

    // Reload page to reset app state
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    walletAddress,
    walletConnected: !!wallet,
    connectWallet,
    disconnectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
