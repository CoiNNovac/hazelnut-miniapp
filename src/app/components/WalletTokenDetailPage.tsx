import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Copy, Check, Plus, Minus, Gift } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useBankAccount } from '../contexts/BankAccountContext';
import { Button } from './ui/button';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ProfileButton } from './ProfileButton';
import tonIcon from 'figma:asset/d0e33f18fb64aadb39e5cd1f89baa7ce085ebcf9.png';
import { MKOINLogo } from './MKOINLogo';

interface WalletTokenDetailPageProps {
  token: {
    symbol: string;
    name: string;
    balance: number;
    price: number;
  };
  onBack: () => void;
  onNavigateToAbout?: () => void;
}

// Mock transaction history for the token
const generateTokenActivity = (symbol: string) => [
  {
    id: 1,
    type: 'received',
    amount: 50.0,
    from: '0xF3a...7d2E',
    date: '2024-12-24 15:30',
    status: 'completed',
    txHash: '0x7f8e9d...',
  },
  {
    id: 2,
    type: 'sent',
    amount: 25.0,
    to: '0x8Bc...4f1A',
    date: '2024-12-23 10:15',
    status: 'completed',
    txHash: '0x3a2b1c...',
  },
  {
    id: 3,
    type: 'received',
    amount: 100.0,
    from: '0x5Dd...9a3C',
    date: '2024-12-21 08:45',
    status: 'completed',
    txHash: '0x9e8d7f...',
  },
  {
    id: 4,
    type: 'sent',
    amount: 75.5,
    to: '0x2Ef...6b8D',
    date: '2024-12-20 16:20',
    status: 'pending',
    txHash: '0x4c5d6e...',
  },
  {
    id: 5,
    type: 'received',
    amount: 125.0,
    from: '0x9Aa...2e1F',
    date: '2024-12-18 12:00',
    status: 'completed',
    txHash: '0x6f7g8h...',
  },
];

export function WalletTokenDetailPage({ token, onBack, onNavigateToAbout }: WalletTokenDetailPageProps) {
  const { theme } = useTheme();
  const { bankDetails, saveBankDetails: saveBankDetailsToContext } = useBankAccount();
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendFormData, setSendFormData] = useState({
    address: '',
    amount: '',
  });
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [showBuyMKOIN, setShowBuyMKOIN] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [copiedBankDetail, setCopiedBankDetail] = useState<string | null>(null);
  const [showBuyConfirmation, setShowBuyConfirmation] = useState(false);
  const [pendingBuyTransaction, setPendingBuyTransaction] = useState<any>(null);

  const [showSellMKOIN, setShowSellMKOIN] = useState(false);
  const [sellAmount, setSellAmount] = useState('');
  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  const [pendingSellTransaction, setPendingSellTransaction] = useState<any>(null);
  const [sellBankDetails, setSellBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    userAddress: '',
  });
  const [saveBankDetails, setSaveBankDetails] = useState(false);

  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [tonClaimed, setTonClaimed] = useState(false);
  
  // Activity tab state (for MKOIN only)
  const [activityTab, setActivityTab] = useState<'onchain' | 'bank'>('onchain');
  
  const tokenActivity = generateTokenActivity(token.symbol);
  
  // Combine base activity with pending transactions if exists
  let allActivity = [...tokenActivity];
  if (pendingBuyTransaction) {
    allActivity = [pendingBuyTransaction, ...allActivity];
  }
  if (pendingSellTransaction) {
    allActivity = [pendingSellTransaction, ...allActivity];
  }

  // Filter activities based on the active tab (only for MKOIN)
  const displayedActivity = token.symbol === 'MKOIN' 
    ? allActivity.filter(activity => {
        if (activityTab === 'onchain') {
          return activity.type === 'sent' || activity.type === 'received';
        } else {
          return activity.type === 'purchase' || activity.type === 'sale';
        }
      })
    : allActivity;

  const walletAddress = 'UQD3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleCopyBankDetail = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankDetail(field);
    setTimeout(() => {
      setCopiedBankDetail(null);
    }, 2000);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSend(false);
    setShowSendConfirmation(true);
  };

  const handleBuySubmit = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) return;
    
    // Create new pending transaction
    const newTransaction = {
      id: Date.now(),
      type: 'purchase',
      amount: parseFloat(buyAmount),
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ''),
      status: 'pending',
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
    };
    
    setPendingBuyTransaction(newTransaction);
    setShowBuyMKOIN(false);
    setShowBuyConfirmation(true);
  };

  const handleSellSubmit = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) return;
    
    // Save bank details if checkbox is checked
    if (saveBankDetails) {
      saveBankDetailsToContext(sellBankDetails);
    }
    
    // Create new pending transaction
    const newTransaction = {
      id: Date.now(),
      type: 'sale',
      amount: parseFloat(sellAmount),
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ''),
      status: 'pending',
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
    };
    
    setPendingSellTransaction(newTransaction);
    setShowSellMKOIN(false);
    setShowSellConfirmation(true);
  };

  const handleClaimTon = () => {
    setShowClaimSuccess(true);
    if (!tonClaimed) {
      setTonClaimed(true);
    }
  };

  const isSendFormValid = () => {
    return (
      sendFormData.address.trim() !== '' &&
      sendFormData.amount.trim() !== '' &&
      parseFloat(sendFormData.amount) > 0 &&
      parseFloat(sendFormData.amount) <= token.balance
    );
  };

  return (
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
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-full ${
                theme === 'Light'
                  ? 'bg-gray-100 text-gray-600 active:bg-gray-200'
                  : 'bg-white/5 text-white/60 active:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={`text-xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              {token.symbol}
            </h1>
          </div>
          <ProfileButton onNavigateToAbout={onNavigateToAbout} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Token Balance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#F47621] to-[#d66a1e] rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              {token.symbol === 'TON' ? (
                <img src={tonIcon} alt={token.symbol} className="w-12 h-12" />
              ) : token.symbol === 'MKOIN' ? (
                <MKOINLogo size="lg" />
              ) : (
                <span className="text-white font-bold text-2xl">{token.symbol.slice(0, 1)}</span>
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm">{token.name}</p>
              <p className="text-white text-sm font-medium">{token.symbol}</p>
            </div>
          </div>

          <div className="mb-2">
            <p className="text-white/80 text-sm mb-1">Balance</p>
            <p className="text-white text-4xl font-bold">
              {token.balance.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Current Price</p>
              <p className="text-white font-medium">
                €{token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Total Value</p>
              <p className="text-white font-medium">
                €{(token.balance * token.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Send & Receive Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={token.symbol === 'MKOIN' ? 'grid grid-cols-4 gap-2' : token.symbol === 'TON' ? 'grid grid-cols-3 gap-3' : 'flex gap-3'}
        >
          <button
            onClick={() => setShowSend(true)}
            className={`flex-1 rounded-2xl p-4 border transition-colors ${
              theme === 'Light'
                ? 'bg-white border-gray-200 hover:bg-gray-50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#F47621]/20 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-[#F47621]" />
              </div>
              <span className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                Send
              </span>
            </div>
          </button>

          <button
            onClick={() => setShowReceive(true)}
            className={`flex-1 rounded-2xl p-4 border transition-colors ${
              theme === 'Light'
                ? 'bg-white border-gray-200 hover:bg-gray-50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#F47621]/20 flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-[#F47621]" />
              </div>
              <span className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                Receive
              </span>
            </div>
          </button>

          {/* TON-specific: Claim TON button */}
          {token.symbol === 'TON' && (
            <button
              onClick={handleClaimTon}
              className={`flex-1 rounded-2xl p-4 border transition-colors ${
                theme === 'Light'
                  ? 'bg-white border-gray-200 hover:bg-gray-50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#F47621]/20 flex items-center justify-center">
                  {tonClaimed ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#F47621]"
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
                    <Gift className="w-6 h-6 text-[#F47621]" />
                  )}
                </div>
                <span className={`font-medium text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  {tonClaimed ? 'Claimed' : 'Claim TON'}
                </span>
              </div>
            </button>
          )}

          {/* MKOIN-specific: Buy and Sell buttons */}
          {token.symbol === 'MKOIN' && (
            <>
              <button
                onClick={() => setShowBuyMKOIN(true)}
                className={`flex-1 rounded-2xl p-4 border transition-colors ${
                  theme === 'Light'
                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-green-500" />
                  </div>
                  <span className={`font-medium text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    Buy
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSellBankDetails(bankDetails);
                  setShowSellMKOIN(true);
                }}
                className={`flex-1 rounded-2xl p-4 border transition-colors ${
                  theme === 'Light'
                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Minus className="w-6 h-6 text-red-500" />
                  </div>
                  <span className={`font-medium text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    Sell
                  </span>
                </div>
              </button>
            </>
          )}
        </motion.div>

        {/* Activity Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
            Activity
          </h2>

          {/* Activity Toggle (MKOIN only) */}
          {token.symbol === 'MKOIN' && (
            <div className={`flex gap-2 p-1 rounded-2xl mb-4 ${
              theme === 'Light'
                ? 'bg-gray-100'
                : 'bg-white/5'
            }`}>
              <button
                onClick={() => setActivityTab('onchain')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activityTab === 'onchain'
                    ? theme === 'Light'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-white/10 text-white shadow-sm'
                    : theme === 'Light'
                    ? 'text-gray-600'
                    : 'text-white/60'
                }`}
              >
                Onchain Activity
              </button>
              <button
                onClick={() => setActivityTab('bank')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activityTab === 'bank'
                    ? theme === 'Light'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-white/10 text-white shadow-sm'
                    : theme === 'Light'
                    ? 'text-gray-600'
                    : 'text-white/60'
                }`}
              >
                Bank Activity
              </button>
            </div>
          )}

          <div className="space-y-3">
            {displayedActivity.length === 0 ? (
              <div className={`rounded-2xl p-8 border text-center ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <p className={`text-sm ${theme === 'Light' ? 'text-gray-500' : 'text-white/50'}`}>
                  {token.symbol === 'MKOIN' && activityTab === 'bank' 
                    ? 'No bank transactions yet. Use Buy or Sell MKOIN to get started.'
                    : 'No transactions yet'}
                </p>
              </div>
            ) : (
              displayedActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`rounded-2xl p-4 border ${
                    theme === 'Light'
                      ? 'bg-white border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'received' || activity.type === 'purchase'
                        ? 'bg-green-500/20'
                        : activity.type === 'sale'
                        ? 'bg-red-500/20'
                        : 'bg-blue-500/20'
                    }`}>
                      {activity.type === 'received' || activity.type === 'purchase' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      ) : activity.type === 'sale' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        {activity.type === 'purchase' ? 'Buy' : activity.type === 'sale' ? 'Sell' : activity.type === 'received' ? 'Received' : 'Sent'}
                      </p>
                      <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                        {activity.type === 'purchase' 
                          ? 'Bank Transfer' 
                          : activity.type === 'sale'
                          ? 'Bank Transfer'
                          : activity.type === 'received' 
                          ? `From ${activity.from}` 
                          : `To ${activity.to}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      activity.type === 'received' || activity.type === 'purchase'
                        ? 'text-green-500'
                        : activity.type === 'sale'
                        ? 'text-red-500'
                        : theme === 'Light'
                        ? 'text-gray-900'
                        : 'text-white'
                    }`}>
                      {activity.type === 'received' || activity.type === 'purchase' ? '+' : '-'}{activity.amount.toLocaleString()} {token.symbol}
                    </p>
                    <p className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                      €{(activity.amount * token.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </div>
                  <p className={`text-xs ${theme === 'Light' ? 'text-gray-500' : 'text-white/50'}`}>
                    {activity.date}
                  </p>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Send Modal */}
      {showSend && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSend(false)}
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
              <h3 className={`text-xl mb-6 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                Send {token.symbol}
              </h3>

              <form onSubmit={handleSendSubmit} className="space-y-4">
                {/* Recipient Address */}
                <div>
                  <label className={`block text-sm mb-2 ${theme === 'Light' ? 'text-gray-700' : 'text-white/80'}`}>
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="UQD3a..."
                    value={sendFormData.address}
                    onChange={(e) => setSendFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full rounded-xl px-4 py-3 border ${
                      theme === 'Light'
                        ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className={`block text-sm mb-2 ${theme === 'Light' ? 'text-gray-700' : 'text-white/80'}`}>
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={sendFormData.amount}
                      onChange={(e) => setSendFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className={`w-full rounded-xl px-4 py-3 pr-20 border ${
                        theme === 'Light'
                          ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                          : 'bg-white/5 border-white/10 text-white placeholder-white/40'
                      } focus:outline-none focus:ring-2 focus:ring-[#F47621]`}
                    />
                    <button
                      type="button"
                      onClick={() => setSendFormData(prev => ({ ...prev, amount: token.balance.toString() }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#F47621] text-white text-sm rounded-lg"
                    >
                      MAX
                    </button>
                  </div>
                  <p className={`text-xs mt-1 ${theme === 'Light' ? 'text-gray-500' : 'text-white/50'}`}>
                    Available: {token.balance.toLocaleString()} {token.symbol}
                  </p>
                </div>

                {/* Estimated Value */}
                {sendFormData.amount && (
                  <div className={`rounded-xl p-4 border ${
                    theme === 'Light'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Estimated Value</span>
                      <span className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                        €{(parseFloat(sendFormData.amount || '0') * token.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowSend(false)}
                    className={`flex-1 rounded-xl h-12 border ${
                      theme === 'Light'
                        ? 'bg-gray-100 text-gray-700 border-gray-200'
                        : 'bg-white/5 text-white border-white/10'
                    }`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isSendFormValid()}
                    className={`flex-1 rounded-xl h-12 border-0 ${
                      isSendFormValid()
                        ? 'bg-[#F47621] text-white'
                        : theme === 'Light'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white/5 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}

      {/* Receive Modal */}
      {showReceive && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReceive(false)}
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
              <h3 className={`text-xl mb-6 text-center ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                Receive {token.symbol}
              </h3>

              {/* QR Code Placeholder */}
              <div className="flex justify-center mb-6">
                <div className={`w-48 h-48 rounded-2xl border-2 flex items-center justify-center ${
                  theme === 'Light'
                    ? 'bg-white border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="text-center">
                    <div className={`w-32 h-32 rounded-xl mx-auto mb-2 ${
                      theme === 'Light' ? 'bg-gray-200' : 'bg-white/10'
                    }`} />
                    <p className={`text-xs ${theme === 'Light' ? 'text-gray-500' : 'text-white/50'}`}>
                      QR Code
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label className={`block text-sm mb-2 text-center ${theme === 'Light' ? 'text-gray-700' : 'text-white/80'}`}>
                  Your {token.symbol} Address
                </label>
                <div className={`rounded-xl p-4 border ${
                  theme === 'Light'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <p className={`text-sm font-mono text-center mb-3 break-all ${
                    theme === 'Light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {walletAddress}
                  </p>
                  <Button
                    onClick={handleCopyAddress}
                    className={`w-full rounded-xl h-10 border ${
                      copied
                        ? 'bg-green-500/20 text-green-500 border-green-500/30'
                        : theme === 'Light'
                        ? 'bg-white text-gray-700 border-gray-200'
                        : 'bg-white/5 text-white border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowReceive(false)}
                className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e] mt-6"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </>
      )}

      {/* Send Confirmation Modal */}
      {showSendConfirmation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSendConfirmation(false)}
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
                Transaction Sent
              </h3>
              
              <p className={`text-center mb-6 ${theme === 'Light' ? 'text-gray-600' : 'text-white/70'}`}>
                Your transaction of <span className="font-semibold text-[#F47621]">{sendFormData.amount} {token.symbol}</span> has been sent successfully.
              </p>

              <Button
                onClick={() => {
                  setShowSendConfirmation(false);
                  setSendFormData({ address: '', amount: '' });
                }}
                className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e]"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </>
      )}

      {/* Buy MKOIN Modal */}
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

                {/* Close Button */}
                <Button
                  type="button"
                  onClick={handleBuySubmit}
                  className="w-full bg-[#F47621] text-white border-0 rounded-xl h-12 hover:bg-[#d66a1e]"
                >
                  Buy MKOIN
                </Button>
              </form>
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
                Your purchase request for <span className="font-semibold text-[#F47621]">{pendingBuyTransaction?.amount} MKOIN</span> has been submitted. MKOIN will be added to your wallet within minutes after your payment is received.
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

      {/* Sell MKOIN Modal */}
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
                      onClick={() => setSellAmount((token.balance * 0.25).toFixed(2))}
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
                      onClick={() => setSellAmount((token.balance * 0.5).toFixed(2))}
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
                      onClick={() => setSellAmount((token.balance * 0.75).toFixed(2))}
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
                      onClick={() => setSellAmount(token.balance.toString())}
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
                      id="saveBankDetailsDetail"
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
                      htmlFor="saveBankDetailsDetail" 
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
                Your sale request for <span className="font-semibold text-[#F47621]">{pendingSellTransaction?.amount} MKOIN</span> has been submitted. EUR will be transferred to your bank account within minutes after MKOIN is deducted from your wallet.
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

      {/* Claim Success Modal */}
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
    </div>
  );
}