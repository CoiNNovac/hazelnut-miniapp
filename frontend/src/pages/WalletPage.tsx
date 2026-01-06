import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { ProfileButton } from '../components/ProfileButton';
import { useTheme } from '../contexts/ThemeContext';
import { useBankAccount } from '../contexts/BankAccountContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useImperativeHandle } from 'react';
import { MKOINLogo } from '../components/MKOINLogo';
import { ScrollIndicator } from '../components/ScrollIndicator';
import { ArrowLeft, Gift, Plus, Minus, Copy, Check } from 'lucide-react';
import { WalletTokenDetailPage } from './WalletTokenDetailPage';
import { Address } from '@ton/core';

const tonIcon = '/assets/ton-icon.svg';

// Transaction data - keeping Figma's structure for now as it includes bank/onchain categories

const recentTransactions = [
  {
    id: 1,
    type: 'receive',
    token: 'TON',
    amount: 25.5,
    eurValue: 62.48,
    date: '2024-12-24',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 2,
    type: 'send',
    token: 'USDT',
    amount: 100,
    eurValue: 100,
    date: '2024-12-23',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 3,
    type: 'buy',
    token: 'MKOIN',
    amount: 500,
    eurValue: 500,
    date: '2024-12-22',
    status: 'completed',
    category: 'bank' as const,
  },
  {
    id: 4,
    type: 'receive',
    token: 'BTC',
    amount: 0.001,
    eurValue: 43.25,
    date: '2024-12-22',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 5,
    type: 'send',
    token: 'ETH',
    amount: 0.5,
    eurValue: 1140.23,
    date: '2024-12-21',
    status: 'pending',
    category: 'onchain' as const,
  },
  {
    id: 6,
    type: 'receive',
    token: 'COTTON',
    amount: 125.5,
    eurValue: 30756.25,
    date: '2024-12-20',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 7,
    type: 'sell',
    token: 'MKOIN',
    amount: 300,
    eurValue: 300,
    date: '2024-12-19',
    status: 'completed',
    category: 'bank' as const,
  },
  {
    id: 8,
    type: 'send',
    token: 'MKOIN',
    amount: 500,
    eurValue: 500,
    date: '2024-12-19',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 9,
    type: 'receive',
    token: 'OLIVE',
    amount: 50,
    eurValue: 21625,
    date: '2024-12-18',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 10,
    type: 'send',
    token: 'TON',
    amount: 10,
    eurValue: 24.50,
    date: '2024-12-17',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 11,
    type: 'buy',
    token: 'MKOIN',
    amount: 1000,
    eurValue: 1000,
    date: '2024-12-16',
    status: 'completed',
    category: 'bank' as const,
  },
  {
    id: 12,
    type: 'receive',
    token: 'VINE',
    amount: 125,
    eurValue: 28556.25,
    date: '2024-12-16',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 13,
    type: 'send',
    token: 'USDT',
    amount: 200,
    eurValue: 200,
    date: '2024-12-15',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 14,
    type: 'receive',
    token: 'SUN',
    amount: 500,
    eurValue: 55000,
    date: '2024-12-14',
    status: 'completed',
    category: 'onchain' as const,
  },
  {
    id: 15,
    type: 'sell',
    token: 'MKOIN',
    amount: 750,
    eurValue: 750,
    date: '2024-12-13',
    status: 'completed',
    category: 'bank' as const,
  },
  {
    id: 16,
    type: 'send',
    token: 'MKOIN',
    amount: 1000,
    eurValue: 1000,
    date: '2024-12-13',
    status: 'completed',
    category: 'onchain' as const,
  },
];

// Token balances
const walletTokens = [
  {
    symbol: 'TON',
    name: 'Toncoin',
    balance: 125.5,
    price: 2.45,
    alwaysShow: true,
    icon: tonIcon, // TON icon
  },
  {
    symbol: 'MKOIN',
    name: 'Moj Koin',
    balance: 1500.0,
    price: 1.0,
    alwaysShow: true,
  },
  // Your Tokens - from portfolio (show only if balance > 0)
  {
    symbol: 'COTTON',
    name: 'Cotton Fields',
    balance: 125.5,
    price: 245.00,
    alwaysShow: false,
  },
  {
    symbol: 'OLIVE',
    name: 'Olive Grove',
    balance: 50.0,
    price: 432.50,
    alwaysShow: false,
  },
  {
    symbol: 'VINE',
    name: 'Vineyard Estate',
    balance: 125.0,
    price: 228.45,
    alwaysShow: false,
  },
  {
    symbol: 'SUN',
    name: 'Sunflower Plains',
    balance: 500.0,
    price: 110.00,
    alwaysShow: false,
  },
  // Upcoming Tokens - show only if balance > 0
  {
    symbol: 'HAZEL',
    name: 'Hazelnut Farm',
    balance: 234,
    price: 125.50,
    alwaysShow: false,
  },
  {
    symbol: 'CORN',
    name: 'Organic Corn Farm',
    balance: 150,
    price: 89.30,
    alwaysShow: false,
  },
  {
    symbol: 'RICE',
    name: 'Rice Paddy Valley',
    balance: 0,
    price: 205.80,
    alwaysShow: false,
  },
  {
    symbol: 'SOY',
    name: 'Soybean Collective',
    balance: 500,
    price: 156.20,
    alwaysShow: false,
  },
];

interface WalletPageProps {
  onNavigateToAbout?: () => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
}

export function WalletPage({ onNavigateToAbout, resetRef }: WalletPageProps = {}) {
  const { theme } = useTheme();
  const { bankDetails, saveBankDetails: saveBankDetailsToContext } = useBankAccount();
  const { walletAddress } = useAuth();
  const [copied, setCopied] = useState(false);

  // Format wallet address to show first 3 and last 4 characters
  const formatWalletAddress = (address: string | null) => {
    if (!address) return 'Not connected';
    try {
      // Convert to user-friendly format
      const parsedAddress = Address.parse(address);
      const userFriendly = parsedAddress.toString({ bounceable: true, urlSafe: true });
      return `${userFriendly.slice(0, 3)}...${userFriendly.slice(-4)}`;
    } catch (error) {
      // Fallback to raw format if parsing fails
      return `${address.slice(0, 3)}...${address.slice(-4)}`;
    }
  };
  const [showTokenInfo, setShowTokenInfo] = useState<string | null>(null);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [tonClaimed, setTonClaimed] = useState(false);
  const [activeView, setActiveView] = useState<'tokens' | 'transactions'>('tokens');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof recentTransactions[0] | null>(null);
  const [selectedTokenDetail, setSelectedTokenDetail] = useState<typeof walletTokens[0] | null>(null);
  const [showBankActivity, setShowBankActivity] = useState(false);
  
  // Buy/Sell MKOIN states
  const [showBuyMKOIN, setShowBuyMKOIN] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [copiedBankDetail, setCopiedBankDetail] = useState<string | null>(null);
  const [showBuyConfirmation, setShowBuyConfirmation] = useState(false);

  const [showSellMKOIN, setShowSellMKOIN] = useState(false);
  const [sellAmount, setSellAmount] = useState('');
  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  const [sellBankDetails, setSellBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    userAddress: '',
  });
  const [saveBankDetails, setSaveBankDetails] = useState(false);

  // Set up reset function
  useImperativeHandle(resetRef, () => () => {
    setSelectedTokenDetail(null);
    setShowAllTransactions(false);
    setShowBankActivity(false);
    setSelectedTransaction(null);
    setActiveView('tokens');
  });
  
  const handleCopy = () => {
    if (walletAddress) {
      try {
        // Convert to user-friendly format before copying
        const parsedAddress = Address.parse(walletAddress);
        const userFriendly = parsedAddress.toString({ bounceable: true, urlSafe: true });
        navigator.clipboard.writeText(userFriendly);
      } catch (error) {
        // Fallback to raw format if parsing fails
        navigator.clipboard.writeText(walletAddress);
      }
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  const handleClaimTon = () => {
    setShowClaimSuccess(true);
    if (!tonClaimed) {
      setTonClaimed(true);
    }
  };

  const handleCopyBankDetail = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankDetail(field);
    setTimeout(() => {
      setCopiedBankDetail(null);
    }, 2000);
  };

  const handleBuySubmit = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) return;
    setShowBuyMKOIN(false);
    setShowBuyConfirmation(true);
  };

  const handleSellSubmit = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) return;
    
    // Save bank details if checkbox is checked
    if (saveBankDetails) {
      saveBankDetailsToContext(sellBankDetails);
    }
    
    setShowSellMKOIN(false);
    setShowSellConfirmation(true);
  };
  
  // If showing token detail, render the detail page
  if (selectedTokenDetail) {
    return (
      <WalletTokenDetailPage
        token={selectedTokenDetail}
        onBack={() => setSelectedTokenDetail(null)}
        onNavigateToAbout={onNavigateToAbout}
      />
    );
  }

  // If showing bank activity, render the dedicated page
  if (showBankActivity) {
    return (
      <ScrollIndicator>
        <div className={`h-full pb-20 ${
          theme === 'Light' 
            ? 'bg-gradient-to-b from-gray-50 to-gray-100' 
            : 'bg-gradient-to-b from-[#1A1B41] to-[#0f1028]'
        }`}>
          {/* Header with Back Button */}
          <div className={`sticky top-0 backdrop-blur-sm border-b z-10 ${
            theme === 'Light'
              ? 'bg-white/95 border-gray-200'
              : 'bg-[#1A1B41]/95 border-white/10'
          }`}>
            <div className="px-6 py-4 flex items-center gap-3">
              <button 
                onClick={() => setShowBankActivity(false)}
                className={`p-2 rounded-xl ${
                  theme === 'Light' 
                    ? 'hover:bg-gray-100' 
                    : 'hover:bg-white/10'
                }`}
              >
                <ArrowLeft
                  className={theme === 'Light' ? 'text-gray-900' : 'text-white'}
                />
              </button>
              <h2 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>Bank Activity</h2>
            </div>
          </div>

          {/* Bank Transactions List */}
          <div className="px-6 pt-6 space-y-3">
            {recentTransactions.filter(tx => tx.category === 'bank').length === 0 ? (
              <div className={`text-center py-12 px-6 backdrop-blur-sm rounded-2xl border ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className={`text-4xl mb-3 ${theme === 'Light' ? 'opacity-40' : 'opacity-30'}`}>
                  🏦
                </div>
                <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                  No bank transactions yet
                </p>
              </div>
            ) : (
              recentTransactions.filter(tx => tx.category === 'bank').map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTransaction(tx)}
                className={`backdrop-blur-sm rounded-2xl p-4 border cursor-pointer ${
                  theme === 'Light'
                    ? 'bg-white border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'buy'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}
                    >
                      {tx.type === 'buy' ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-400"
                        >
                          <path
                            d="M10 5V15M5 10H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-red-400"
                        >
                          <path
                            d="M5 10H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                      <p className="text-sm font-bold">
                        {tx.type === 'buy' ? 'Bought' : 'Sold'}
                      </p>
                      <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/80'}`}>
                        {tx.amount} {tx.token}
                      </p>
                    </div>
                  </div>
                  <div className={`${theme === 'Light' ? 'text-gray-900' : 'text-white'} text-right`}>
                    <p className="text-sm font-bold">
                      €{tx.eurValue}
                    </p>
                    <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/80'}`}>
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )))
            }
          </div>
        </div>
      </ScrollIndicator>
    );
  }

  // If showing all transactions, render the dedicated page
  if (showAllTransactions) {
    return (
      <ScrollIndicator>
        <div className={`h-full pb-20 ${
          theme === 'Light' 
            ? 'bg-gradient-to-b from-gray-50 to-gray-100' 
            : 'bg-gradient-to-b from-[#1A1B41] to-[#0f1028]'
        }`}>
          {/* Header with Back Button */}
          <div className={`sticky top-0 backdrop-blur-sm border-b z-10 ${
            theme === 'Light'
              ? 'bg-white/95 border-gray-200'
              : 'bg-[#1A1B41]/95 border-white/10'
          }`}>
            <div className="px-6 py-4 flex items-center gap-3">
              <button 
                onClick={() => setShowAllTransactions(false)}
                className={`p-2 rounded-xl ${
                  theme === 'Light' 
                    ? 'hover:bg-gray-100' 
                    : 'hover:bg-white/10'
                }`}
              >
                <ArrowLeft
                  className={theme === 'Light' ? 'text-gray-900' : 'text-white'}
                />
              </button>
              <h2 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>All Transactions</h2>
            </div>
          </div>

          {/* All Transactions List */}
          <div className="px-6 pt-6 space-y-3">
            {recentTransactions.filter(tx => tx.category === 'onchain').length === 0 ? (
              <div className={`text-center py-12 px-6 backdrop-blur-sm rounded-2xl border ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className={`text-4xl mb-3 ${theme === 'Light' ? 'opacity-40' : 'opacity-30'}`}>
                  ⛓️
                </div>
                <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                  No onchain transactions yet
                </p>
              </div>
            ) : (
              recentTransactions.filter(tx => tx.category === 'onchain').map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTransaction(tx)}
                className={`backdrop-blur-sm rounded-2xl p-4 border cursor-pointer ${
                  theme === 'Light'
                    ? 'bg-white border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'receive'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}
                    >
                      {tx.type === 'receive' ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-400"
                        >
                          <path
                            d="M10 16V4M10 16L6 12M10 16L14 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-red-400"
                        >
                          <path
                            d="M10 4V16M10 4L6 8M10 4L14 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                      <p className="text-sm font-bold">
                        {tx.type === 'receive' ? 'Received' : 'Sent'}
                      </p>
                      <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/80'}`}>
                        {tx.amount} {tx.token}
                      </p>
                    </div>
                  </div>
                  <div className={`${theme === 'Light' ? 'text-gray-900' : 'text-white'} text-right`}>
                    <p className="text-sm font-bold">
                      €{tx.eurValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/80'}`}>
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )))
            }
          </div>
        </div>
      </ScrollIndicator>
    );
  }
  
  return (
    <ScrollIndicator>
      <div className={`h-full pb-20 ${
        theme === 'Light' 
          ? 'bg-gradient-to-b from-gray-50 to-gray-100' 
          : 'bg-gradient-to-b from-[#1A1B41] to-[#0f1028]'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 backdrop-blur-sm border-b z-10 ${
          theme === 'Light'
            ? 'bg-white/95 border-gray-200'
            : 'bg-[#1A1B41]/95 border-white/10'
        }`}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>Wallet</h2>
            <ProfileButton onNavigateToAbout={onNavigateToAbout} />
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-[#F47621] to-[#d66a1e] rounded-3xl p-5 shadow-xl"
          >
            <p className="text-white/80 mb-1">Total Balance</p>
            <h1 className="text-white mb-4">
              €5,820.55
            </h1>
            
            {/* Action Buttons - Claim TON, Buy MKOIN, Sell MKOIN */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-white/20 text-white border-0 rounded-xl h-auto py-3 flex-col gap-2" onClick={handleClaimTon}>
                {tonClaimed ? (
                  <svg
                    width="96"
                    height="96"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <Gift className="w-8 h-8 text-white" />
                )}
                <div className="flex flex-col items-center leading-tight min-h-[32px] justify-start">
                  <span className="text-sm font-medium">{tonClaimed ? 'Claimed' : 'Claim'}</span>
                  <span className="text-sm">TON</span>
                </div>
              </Button>
              
              <Button className="flex-1 bg-white/20 text-white border-0 rounded-xl h-auto py-3 flex-col gap-2" onClick={() => setShowBuyMKOIN(true)}>
                <Plus className="w-8 h-8 text-white" />
                <div className="flex flex-col items-center leading-tight min-h-[32px] justify-start">
                  <span className="text-sm font-medium">Buy</span>
                  <span className="text-sm">MKOIN</span>
                </div>
              </Button>

              <Button className="flex-1 bg-white/20 text-white border-0 rounded-xl h-auto py-3 flex-col gap-2" onClick={() => {
                setSellBankDetails(bankDetails);
                setShowSellMKOIN(true);
              }}>
                <Minus className="w-8 h-8 text-white" />
                <div className="flex flex-col items-center leading-tight min-h-[32px] justify-start">
                  <span className="text-sm font-medium">Sell</span>
                  <span className="text-sm">MKOIN</span>
                </div>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wallet Address */}
        <div className="px-6 mb-6">
          <div className={`backdrop-blur-sm rounded-2xl p-3 border ${
            theme === 'Light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <p className={`flex-shrink-0 text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Your Wallet Address</p>
              {copied ? (
                <div className="flex-1 text-center flex items-center justify-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-500"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className={`text-sm ${theme === 'Light' ? 'text-green-600' : 'text-green-400'}`}>Copied</span>
                </div>
              ) : (
                <code className={`flex-1 text-center text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  {formatWalletAddress(walletAddress)}
                </code>
              )}
              <button className="flex-shrink-0 p-1 rounded-lg" onClick={handleCopy}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#F47621]"
                >
                  <rect
                    x="7"
                    y="7"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M13 7V5C13 3.89543 12.1046 3 11 3H5C3.89543 3 3 3.89543 3 5V11C3 12.1046 3.89543 13 5 13H7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Toggle: Your Tokens / Recent Transactions */}
        <div className="px-6">
          <div className={`backdrop-blur-sm rounded-2xl p-1 border flex mb-6 ${
            theme === 'Light'
              ? 'bg-gray-100 border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}>
            <button
              onClick={() => setActiveView('tokens')}
              className={`flex-1 py-3 rounded-xl transition-colors ${
                activeView === 'tokens'
                  ? 'bg-[#F47621] text-white'
                  : theme === 'Light'
                  ? 'text-gray-600'
                  : 'text-white/60'
              }`}
            >
              Your Tokens
            </button>
            <button
              onClick={() => setActiveView('transactions')}
              className={`flex-1 py-3 rounded-xl transition-colors ${
                activeView === 'transactions'
                  ? 'bg-[#F47621] text-white'
                  : theme === 'Light'
                  ? 'text-gray-600'
                  : 'text-white/60'
              }`}
            >
              Recent Transactions
            </button>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'tokens' ? (
          /* Token List */
          <div className="px-6 space-y-3">
            {walletTokens
              .filter(token => token.alwaysShow || token.balance > 0)
              .map((token, index) => (
                <motion.div
                  key={token.symbol}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedTokenDetail(token)}
                  className={`backdrop-blur-sm rounded-2xl p-4 border cursor-pointer active:scale-95 transition-transform ${
                    theme === 'Light'
                      ? 'bg-white border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#F47621]/20 flex items-center justify-center">
                        {token.symbol === 'TON' ? (
                          <img src={tonIcon} alt={token.symbol} className="w-10 h-10" style={{ filter: 'brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(1697%) hue-rotate(0deg) brightness(98%) contrast(93%)' }} />
                        ) : token.symbol === 'MKOIN' ? (
                          <MKOINLogo size="md" />
                        ) : (
                          <span className="text-[#F47621] font-bold text-lg">{token.symbol.slice(0, 1)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>{token.symbol}</h4>
                        <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>{token.name}</p>
                      </div>
                      {(token.symbol === 'TON' || token.symbol === 'MKOIN') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTokenInfo(token.symbol);
                          }}
                          className={`p-1 rounded-full transition-colors self-center ${
                            theme === 'Light'
                              ? 'hover:bg-gray-100'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 16V12M12 8H12.01"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>{token.balance.toLocaleString()}</p>
                      <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>€{(token.balance * token.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        ) : (
          /* Recent Transactions */
          <div className="px-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <button className="text-[#F47621]" onClick={() => setShowAllTransactions(true)}>
                See All
              </button>
              <button className="text-[#F47621]" onClick={() => setShowBankActivity(true)}>
                Bank Activity
              </button>
            </div>

            {recentTransactions.filter(tx => tx.category === 'onchain').length === 0 ? (
              <div className={`text-center py-12 px-6 backdrop-blur-sm rounded-2xl border ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className={`text-4xl mb-3 ${theme === 'Light' ? 'opacity-40' : 'opacity-30'}`}>
                  ⛓️
                </div>
                <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                  No onchain transactions yet
                </p>
              </div>
            ) : (
              recentTransactions.filter(tx => tx.category === 'onchain').slice(0, 5).map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTransaction(tx)}
                className={`backdrop-blur-sm rounded-2xl p-4 border cursor-pointer ${
                  theme === 'Light'
                    ? 'bg-white border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'receive' || tx.type === 'buy'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}
                    >
                      {tx.type === 'buy' ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-400"
                        >
                          <path
                            d="M10 5V15M5 10H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : tx.type === 'sell' ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-red-400"
                        >
                          <path
                            d="M5 10H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : tx.type === 'receive' ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-400"
                        >
                          <path
                            d="M10 16V4M10 16L6 12M10 16L14 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-red-400"
                        >
                          <path
                            d="M10 4V16M10 4L6 8M10 4L14 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                      <p className="text-sm font-bold">
                        {tx.type === 'receive' ? 'Received' : tx.type === 'send' ? 'Sent' : tx.type === 'buy' ? 'Bought' : 'Sold'}
                      </p>
                      <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/80'}`}>
                        {tx.amount} {tx.token}
                      </p>
                    </div>
                  </div>
                  <div className={`${theme === 'Light' ? 'text-gray-900' : 'text-white'} text-right`}>
                    <p className="text-sm font-bold">
                      €{tx.eurValue}
                    </p>
                    <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/80'}`}>
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )))}
          </div>
        )}

        {/* Token Info Bottom Sheet */}
        {showTokenInfo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTokenInfo(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 max-w-[430px] mx-auto max-h-[85vh] flex flex-col ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-[#1A1B41] border-white/10'
              }`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1">
                <div className="p-6 pb-8">
                  {/* Token Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-[#F47621]/20 flex items-center justify-center">
                      {showTokenInfo === 'TON' ? (
                        <img src={tonIcon} alt="TON" className="w-10 h-10" style={{ filter: 'brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(1697%) hue-rotate(0deg) brightness(98%) contrast(93%)' }} />
                      ) : (
                        <MKOINLogo size="md" />
                      )}
                    </div>
                    <div>
                      <h3 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                        {showTokenInfo === 'TON' ? 'Toncoin (TON)' : 'Moj Koin (MKOIN)'}
                      </h3>
                      <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                        {showTokenInfo === 'TON' ? 'Blockchain Currency' : 'Platform Currency'}
                      </p>
                    </div>
                  </div>

                  {/* Token Description */}
                  <div className="space-y-4 mb-6">
                    {showTokenInfo === 'TON' ? (
                      <>
                        <div>
                          <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            What is TON?
                          </h4>
                          <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                            The Open Network (TON), previously known as the Telegram Open Network is the native cryptocurrency of the TON blockchain. It's used for transaction fees, staking, and as the primary currency for Telegram Mini Apps.
                          </p>
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            Why do you need it?
                          </h4>
                          <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                            Small amount of TON is required for all blockchain transactions in this app, as fee. You can claim TON by taping on "Claim TON" button.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            What is MKOIN?
                          </h4>
                          <p className={`text-sm mb-3 ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                            MKOIN (Moj Koin) is the platform's internal currency used for trading profit-sharing tokens. It's designed to provide a stable and convenient way to invest in agricultural DeFi projects.
                          </p>
                          <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                            MKOIN is pegged 1:1 to EUR. All euros are securely stored in the CoinNovac bank account. When you deposit EUR, an equivalent amount of MKOIN is minted. When you withdraw EUR from CoinNovac, the corresponding MKOIN is permanently burned from circulation.
                          </p>
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            Why do you need it?
                          </h4>
                          <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                            MKOIN is your primary trading currency for buying profit-sharing tokens like COTTON, OLIVE, and VINE. Deposit MKOIN to start investing in agricultural projects and earning rewards. <span className="font-semibold">1 MKOIN = €1.00</span>
                          </p>
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            How to get MKOIN
                          </h4>
                          <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                            Tap on "Deposit" and send EUR to the CoinNovac bank account. You will receive the same amount of MKOIN as the EUR you sent. The transaction is instant and secure.
                          </p>
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            How to convert MKOIN to EUR
                          </h4>
                          <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                            Tap on "Withdraw", enter your bank account details (account number, name, and address) along with the MKOIN amount you wish to withdraw. After you tap "Send", your MKOIN will be automatically transferred to the CoinNovac TON address and burned. You will receive EUR in your bank account as soon as possible. The burned MKOIN ensures the 1:1 EUR backing remains accurate.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Close Button */}
                  <Button
                    onClick={() => setShowTokenInfo(null)}
                    className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e]"
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Claim Success Bottom Sheet */}
        {showClaimSuccess && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimSuccess(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 max-w-[430px] mx-auto ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-[#1A1B41] border-white/10'
              }`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              <div className="p-6 pb-8">
                {/* Token Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#F47621]/20 flex items-center justify-center">
                    <img src={tonIcon} alt="TON" className="w-10 h-10" style={{ filter: 'brightness(0) saturate(100%) invert(46%) sepia(99%) saturate(1697%) hue-rotate(0deg) brightness(98%) contrast(93%)' }} />
                  </div>
                  <div>
                    <h3 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                      Toncoin (TON)
                    </h3>
                    <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                      Blockchain Currency
                    </p>
                  </div>
                </div>

                {/* Token Description */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                      {tonClaimed ? 'Already Claimed' : 'Request Submitted'}
                    </h4>
                    <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                      {tonClaimed 
                        ? 'You already submitted claim request, it is one time only.' 
                        : 'Your request has been submitted successfully. Expect TON coins in your wallet soon.'}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  onClick={() => setShowClaimSuccess(false)}
                  className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e]"
                >
                  Got it
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Transaction Details Bottom Sheet */}
        {selectedTransaction && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransaction(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 max-w-[430px] mx-auto ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-[#1A1B41] border-white/10'
              }`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              <div className="p-6 pb-8">
                {/* Transaction Type Header */}
                <div className="text-center mb-6">
                  <h3 className={`text-xl mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    {selectedTransaction.type === 'receive' ? 'Received' : 
                     selectedTransaction.type === 'send' ? 'Sent' : 
                     selectedTransaction.type === 'buy' ? 'Bought' : 'Sold'}
                  </h3>
                </div>

                {/* Token Icon and Amount */}
                <div className="flex flex-col items-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    selectedTransaction.type === 'receive' || selectedTransaction.type === 'buy'
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {selectedTransaction.type === 'receive' || selectedTransaction.type === 'buy' ? (
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-green-400"
                      >
                        <path
                          d="M10 16V4M10 16L6 12M10 16L14 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-red-400"
                      >
                        <path
                          d="M10 4V16M10 4L6 8M10 4L14 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  
                  <p className={`text-3xl font-bold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    €{selectedTransaction.eurValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    {selectedTransaction.amount} {selectedTransaction.token}
                  </p>
                  
                  {/* Status Badge */}
                  <div className={`mt-3 px-4 py-1 rounded-full ${
                    selectedTransaction.status === 'completed'
                      ? 'bg-green-500/20'
                      : 'bg-yellow-500/20'
                  }`}>
                    <span className={`text-sm font-medium ${
                      selectedTransaction.status === 'completed'
                        ? 'text-green-500'
                        : 'text-yellow-500'
                    }`}>
                      {selectedTransaction.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4 mb-6">
                  {/* From/To fields - show differently for bank vs onchain */}
                  {selectedTransaction.type === 'buy' || selectedTransaction.type === 'sell' ? (
                    // Bank Activity - Show Payment Method
                    <div className={`flex justify-between items-center py-3 border-b ${
                      theme === 'Light' ? 'border-gray-200' : 'border-white/10'
                    }`}>
                      <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                        Payment Method
                      </span>
                      <span className={`text-sm font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        Bank Transfer
                      </span>
                    </div>
                  ) : (
                    // Onchain Activity - Show From/To addresses
                    <>
                      <div className={`flex justify-between items-center py-3 border-b ${
                        theme === 'Light' ? 'border-gray-200' : 'border-white/10'
                      }`}>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>From</span>
                        <span className={`text-sm font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                          {selectedTransaction.type === 'receive' ? 'FfxU1A...rYBsH' : 'UQA...x7k2'}
                        </span>
                      </div>
                      
                      <div className={`flex justify-between items-center py-3 border-b ${
                        theme === 'Light' ? 'border-gray-200' : 'border-white/10'
                      }`}>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>To</span>
                        <span className={`text-sm font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                          {selectedTransaction.type === 'receive' ? 'UQA...x7k2' : 'Bhn9Qj...grnBo'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className={`flex justify-between items-center py-3 border-b ${
                    theme === 'Light' ? 'border-gray-200' : 'border-white/10'
                  }`}>
                    <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Time</span>
                    <span className={`text-sm font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                      {new Date(selectedTransaction.date).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </span>
                  </div>
                  
                  {/* Network Fee and Explorer - Only show for onchain activities */}
                  {selectedTransaction.type !== 'buy' && selectedTransaction.type !== 'sell' && (
                    <>
                      <div className={`flex justify-between items-center py-3 border-b ${
                        theme === 'Light' ? 'border-gray-200' : 'border-white/10'
                      }`}>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Network Fee</span>
                        <span className={`text-sm font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                          ~0.00001 TON
                        </span>
                      </div>
                      
                      <div className={`flex justify-between items-center py-3`}>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Explorer</span>
                        <button className="text-sm font-medium text-[#F47621] flex items-center gap-1">
                          View on TON
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-[#F47621]"
                          >
                            <path
                              d="M10 4L16 10M16 10L10 16M16 10H4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Close Button */}
                <Button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e]"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Buy MKOIN Bottom Sheet */}
        {showBuyMKOIN && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuyMKOIN(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 max-w-[430px] mx-auto max-h-[85vh] flex flex-col ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-[#1A1B41] border-white/10'
              }`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1">
                <div className="p-6 pb-8">
                  <h3 className={`text-xl mb-6 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    Buy MKOIN
                  </h3>

                  <form className="space-y-4">
                    {/* Amount */}
                    <div>
                      <label className={`block text-sm mb-2 ${theme === 'Light' ? 'text-gray-700' : 'text-white/80'}`}>
                        Amount of MKOIN to Buy
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 border ${
                            theme === 'Light'
                              ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                              : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                        />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${theme === 'Light' ? 'text-gray-500' : 'text-white/50'}`}>
                          MKOIN
                        </span>
                      </div>
                    </div>

                    {/* EUR Equivalent */}
                    {buyAmount && parseFloat(buyAmount) > 0 && (
                      <div className={`rounded-xl p-4 border ${
                        theme === 'Light'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        <div className="flex justify-between items-center text-sm">
                          <span className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}>You will pay (EUR)</span>
                          <span className={`font-bold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            €{parseFloat(buyAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          1 MKOIN = €1.00
                        </p>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className={`rounded-xl p-4 border ${
                      theme === 'Light'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}>
                      <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        How to Buy MKOIN
                      </h4>
                      <ol className={`text-xs space-y-1 list-decimal list-inside ${theme === 'Light' ? 'text-gray-700' : 'text-white/70'}`}>
                        <li>Transfer EUR to the CoinNovac bank account below</li>
                        <li>Use the exact amount shown above</li>
                        <li>MKOIN will be added to your wallet automatically</li>
                      </ol>
                    </div>

                    {/* Bank Details */}
                    <div className={`rounded-xl p-4 border space-y-3 ${
                      theme === 'Light'
                        ? 'bg-white border-gray-200'
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <h4 className={`text-sm font-semibold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        CoinNovac Bank Details
                      </h4>
                      
                      {/* Bank Name */}
                      <div>
                        <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          Bank Name
                        </p>
                        <div className={`flex items-center justify-between rounded-lg p-2 ${
                          theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <span className={`text-sm font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            Raiffeisen Bank Serbia
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBankDetail('Raiffeisen Bank Serbia', 'bankName')}
                            className={`p-1 rounded transition-colors ${
                              copiedBankDetail === 'bankName'
                                ? 'text-green-500'
                                : theme === 'Light'
                                ? 'text-gray-500 hover:text-gray-700'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            {copiedBankDetail === 'bankName' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Account Name */}
                      <div>
                        <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          Account Name
                        </p>
                        <div className={`flex items-center justify-between rounded-lg p-2 ${
                          theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <span className={`text-sm font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            CoinNovac d.o.o.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBankDetail('CoinNovac d.o.o.', 'accountName')}
                            className={`p-1 rounded transition-colors ${
                              copiedBankDetail === 'accountName'
                                ? 'text-green-500'
                                : theme === 'Light'
                                ? 'text-gray-500 hover:text-gray-700'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            {copiedBankDetail === 'accountName' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Account Number */}
                      <div>
                        <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          Account Number
                        </p>
                        <div className={`flex items-center justify-between rounded-lg p-2 ${
                          theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <span className={`text-sm font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            265-1050310000956-94
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBankDetail('265-1050310000956-94', 'accountNumber')}
                            className={`p-1 rounded transition-colors ${
                              copiedBankDetail === 'accountNumber'
                                ? 'text-green-500'
                                : theme === 'Light'
                                ? 'text-gray-500 hover:text-gray-700'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            {copiedBankDetail === 'accountNumber' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* IBAN (optional) */}
                      <div>
                        <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          IBAN (International)
                        </p>
                        <div className={`flex items-center justify-between rounded-lg p-2 ${
                          theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <span className={`text-sm font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            RS35265105031000095694
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBankDetail('RS35265105031000095694', 'iban')}
                            className={`p-1 rounded transition-colors ${
                              copiedBankDetail === 'iban'
                                ? 'text-green-500'
                                : theme === 'Light'
                                ? 'text-gray-500 hover:text-gray-700'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            {copiedBankDetail === 'iban' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Buy Button */}
                    <Button
                      type="button"
                      onClick={handleBuySubmit}
                      disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                      className={`w-full border-0 rounded-xl h-12 ${
                        buyAmount && parseFloat(buyAmount) > 0
                          ? 'bg-[#F47621] text-white hover:bg-[#d66a1e]'
                          : theme === 'Light'
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white/5 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      Buy MKOIN
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Buy Confirmation Modal */}
        {showBuyConfirmation && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuyConfirmation(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 max-w-[430px] mx-auto ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-[#1A1B41] border-white/10'
              }`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              <div className="p-6 pb-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-green-500"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className={`text-xl text-center mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  Request Submitted
                </h3>
                
                <p className={`text-center mb-6 ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                  Your purchase request for <span className="font-semibold text-[#F47621]">{buyAmount} MKOIN</span> has been submitted. MKOIN will be added to your wallet within minutes after your payment is received.
                </p>

                <Button
                  onClick={() => {
                    setShowBuyConfirmation(false);
                    setBuyAmount('');
                  }}
                  className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e]"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Sell MKOIN Bottom Sheet */}
        {showSellMKOIN && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSellMKOIN(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 max-w-[430px] mx-auto max-h-[85vh] flex flex-col ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-[#1A1B41] border-white/10'
              }`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1">
                <div className="p-6 pb-8">
                  <h3 className={`text-xl mb-6 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    Sell MKOIN
                  </h3>

                  <form className="space-y-4">
                    {/* Amount */}
                    <div>
                      <label className={`block text-sm mb-2 ${theme === 'Light' ? 'text-gray-700' : 'text-white/80'}`}>
                        Amount of MKOIN to Sell
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={sellAmount}
                          onChange={(e) => setSellAmount(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 border ${
                            theme === 'Light'
                              ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                              : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                        />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${theme === 'Light' ? 'text-gray-500' : 'text-white/50'}`}>
                          MKOIN
                        </span>
                      </div>
                      
                      {/* Percentage Buttons */}
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setSellAmount((1500 * 0.25).toFixed(2))}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'Light'
                              ? 'bg-gray-100 text-gray-700 active:bg-gray-200'
                              : 'bg-white/5 text-white/80 active:bg-white/10'
                          }`}
                        >
                          25%
                        </button>
                        <button
                          type="button"
                          onClick={() => setSellAmount((1500 * 0.5).toFixed(2))}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'Light'
                              ? 'bg-gray-100 text-gray-700 active:bg-gray-200'
                              : 'bg-white/5 text-white/80 active:bg-white/10'
                          }`}
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setSellAmount((1500 * 0.75).toFixed(2))}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'Light'
                              ? 'bg-gray-100 text-gray-700 active:bg-gray-200'
                              : 'bg-white/5 text-white/80 active:bg-white/10'
                          }`}
                        >
                          75%
                        </button>
                        <button
                          type="button"
                          onClick={() => setSellAmount('1500.00')}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'Light'
                              ? 'bg-[#F47621] text-white active:bg-[#d66a1e]'
                              : 'bg-[#F47621] text-white active:bg-[#d66a1e]'
                          }`}
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* EUR Equivalent */}
                    {sellAmount && parseFloat(sellAmount) > 0 && (
                      <div className={`rounded-xl p-4 border ${
                        theme === 'Light'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        <div className="flex justify-between items-center text-sm">
                          <span className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}>You will receive (EUR)</span>
                          <span className={`font-bold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                            €{parseFloat(sellAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          1 MKOIN = €1.00
                        </p>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className={`rounded-xl p-4 border ${
                      theme === 'Light'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}>
                      <h4 className={`text-sm font-semibold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        How to Sell MKOIN
                      </h4>
                      <ol className={`text-xs space-y-1 list-decimal list-inside ${theme === 'Light' ? 'text-gray-700' : 'text-white/70'}`}>
                        <li>Enter your bank account details below</li>
                        <li>Submit your sell request</li>
                        <li>EUR will be transferred to your account within minutes after MKOIN is deducted</li>
                      </ol>
                    </div>

                    {/* Bank Details */}
                    <div className={`rounded-xl p-4 border space-y-3 ${
                      theme === 'Light'
                        ? 'bg-white border-gray-200'
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <h4 className={`text-sm font-semibold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        Your Bank Account Details
                      </h4>
                      
                      {/* Bank Name */}
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          Bank Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Raiffeisen Bank Serbia"
                          value={sellBankDetails.bankName}
                          onChange={(e) => setSellBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                          className={`w-full rounded-lg px-3 py-2 text-sm border ${
                            theme === 'Light'
                              ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                              : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                        />
                      </div>

                      {/* Account Name */}
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          Account Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., John Doe"
                          value={sellBankDetails.accountName}
                          onChange={(e) => setSellBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                          className={`w-full rounded-lg px-3 py-2 text-sm border ${
                            theme === 'Light'
                              ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                              : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                        />
                      </div>

                      {/* Account Number */}
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 265-1050310000956-94"
                          value={sellBankDetails.accountNumber}
                          onChange={(e) => setSellBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className={`w-full rounded-lg px-3 py-2 text-sm border ${
                            theme === 'Light'
                              ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                              : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                        />
                      </div>

                      {/* User Address (optional) */}
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                          User Address <span className="text-gray-500">- Optional</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Kneza Miloša 10, Belgrade"
                          value={sellBankDetails.userAddress}
                          onChange={(e) => setSellBankDetails(prev => ({ ...prev, userAddress: e.target.value }))}
                          className={`w-full rounded-lg px-3 py-2 text-sm border ${
                            theme === 'Light'
                              ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                              : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                        />
                      </div>

                      {/* Save Bank Details Checkbox */}
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="checkbox"
                          id="saveBankDetails"
                          checked={saveBankDetails}
                          onChange={(e) => setSaveBankDetails(e.target.checked)}
                          className={`w-5 h-5 rounded border cursor-pointer ${
                            theme === 'Light'
                              ? 'border-gray-300'
                              : 'border-white/30 bg-white/5'
                          }`}
                          style={{
                            accentColor: '#F47621'
                          }}
                        />
                        <label 
                          htmlFor="saveBankDetails" 
                          className={`text-sm cursor-pointer select-none ${theme === 'Light' ? 'text-gray-700' : 'text-white/80'}`}
                        >
                          Save bank details for next time
                        </label>
                      </div>
                    </div>

                    {/* Sell Button */}
                    <Button
                      type="button"
                      onClick={handleSellSubmit}
                      disabled={!sellAmount || parseFloat(sellAmount) <= 0 || !sellBankDetails.bankName || !sellBankDetails.accountName || !sellBankDetails.accountNumber}
                      className={`w-full border-0 rounded-xl h-12 ${
                        sellAmount && parseFloat(sellAmount) > 0 && sellBankDetails.bankName && sellBankDetails.accountName && sellBankDetails.accountNumber
                          ? 'bg-[#F47621] text-white hover:bg-[#d66a1e]'
                          : theme === 'Light'
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white/5 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      Sell MKOIN
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Sell Confirmation Modal */}
        {showSellConfirmation && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSellConfirmation(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 max-w-[430px] mx-auto ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-[#1A1B41] border-white/10'
              }`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              <div className="p-6 pb-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-green-500"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className={`text-xl text-center mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  Request Submitted
                </h3>
                
                <p className={`text-center mb-6 ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                  Your sale request for <span className="font-semibold text-[#F47621]">{sellAmount} MKOIN</span> has been submitted. EUR will be transferred to your bank account within minutes after MKOIN is deducted from your wallet.
                </p>

                <Button
                  onClick={() => {
                    setShowSellConfirmation(false);
                    setSellAmount('');
                    setSellBankDetails({ bankName: '', accountName: '', accountNumber: '', userAddress: '' });
                    setSaveBankDetails(false);
                  }}
                  className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e]"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </ScrollIndicator>
  );
}