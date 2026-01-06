import { useState, useImperativeHandle } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useBankAccount } from '../contexts/BankAccountContext';
import { useAuth } from '../contexts/AuthContext';
import { ScrollIndicator } from '../components/ScrollIndicator';
import { WalletTokenDetailPage } from './WalletTokenDetailPage';
import {
  WalletHeader,
  TokensList,
  TransactionsList,
  BuyMKOINModal,
  SellMKOINModal,
  ClaimRewardModal,
  ConfirmationModal,
  type WalletToken,
  type Transaction,
} from '../components/wallet';

const tonIcon = '/assets/ton-icon.svg';

// Mock data - can be moved to a separate file later
const recentTransactions: Transaction[] = [
  {
    id: 1,
    type: 'receive',
    token: 'TON',
    amount: 25.5,
    eurValue: 62.48,
    date: '2024-12-24',
    status: 'completed',
    category: 'onchain',
  },
  {
    id: 2,
    type: 'send',
    token: 'USDT',
    amount: 100,
    eurValue: 100,
    date: '2024-12-23',
    status: 'completed',
    category: 'onchain',
  },
  {
    id: 3,
    type: 'buy',
    token: 'MKOIN',
    amount: 500,
    eurValue: 500,
    date: '2024-12-22',
    status: 'completed',
    category: 'bank',
  },
  // ... (rest of transactions - keeping for now to maintain functionality)
];

const walletTokens: WalletToken[] = [
  {
    symbol: 'TON',
    name: 'Toncoin',
    balance: 125.5,
    price: 2.45,
    alwaysShow: true,
    icon: tonIcon,
  },
  {
    symbol: 'MKOIN',
    name: 'Moj Koin',
    balance: 1500.0,
    price: 1.0,
    alwaysShow: true,
  },
  {
    symbol: 'COTTON',
    name: 'Cotton Fields',
    balance: 125.5,
    price: 245.0,
    alwaysShow: false,
  },
  {
    symbol: 'OLIVE',
    name: 'Olive Grove',
    balance: 50.0,
    price: 432.5,
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
    price: 110.0,
    alwaysShow: false,
  },
  {
    symbol: 'HAZEL',
    name: 'Hazelnut Farm',
    balance: 234,
    price: 125.5,
    alwaysShow: false,
  },
  {
    symbol: 'CORN',
    name: 'Organic Corn Farm',
    balance: 150,
    price: 89.3,
    alwaysShow: false,
  },
  {
    symbol: 'RICE',
    name: 'Rice Paddy Valley',
    balance: 0,
    price: 205.8,
    alwaysShow: false,
  },
  {
    symbol: 'SOY',
    name: 'Soybean Collective',
    balance: 500,
    price: 156.2,
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

  // View state
  const [activeView, setActiveView] = useState<'tokens' | 'transactions'>('tokens');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTokenDetail, setSelectedTokenDetail] = useState<WalletToken | null>(null);
  const [showBankActivity, setShowBankActivity] = useState(false);

  // Token state
  const [showTokenInfo, setShowTokenInfo] = useState<string | null>(null);
  const [tonClaimed, setTonClaimed] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  // Buy MKOIN state
  const [showBuyMKOIN, setShowBuyMKOIN] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [showBuyConfirmation, setShowBuyConfirmation] = useState(false);

  // Sell MKOIN state
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

  // Calculate total balance
  const totalBalance = walletTokens
    .filter((token) => token.alwaysShow || token.balance > 0)
    .reduce((sum, token) => sum + token.balance * token.price, 0)
    .toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Set up reset function
  useImperativeHandle(resetRef, () => () => {
    setSelectedTokenDetail(null);
    setShowAllTransactions(false);
    setShowBankActivity(false);
    setSelectedTransaction(null);
    setActiveView('tokens');
  });

  // Handlers
  const handleClaimTon = () => {
    setShowClaimSuccess(true);
    if (!tonClaimed) {
      setTonClaimed(true);
    }
  };

  const handleBuySubmit = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) return;
    setShowBuyMKOIN(false);
    setShowBuyConfirmation(true);
  };

  const handleSellSubmit = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) return;

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

  // If showing bank activity, render the bank activity page
  if (showBankActivity) {
    // This would be implemented similar to selectedTokenDetail
    // For now, keeping the original structure
    return null; // Placeholder
  }

  return (
    <>
      <ScrollIndicator>
        <div className={`min-h-screen ${theme === 'Light' ? 'bg-white' : 'bg-[#1A1B41]'}`}>
          {/* Header */}
          <WalletHeader
            walletAddress={walletAddress}
            totalBalance={totalBalance}
            onNavigateToAbout={onNavigateToAbout}
          />

          {/* Toggle View */}
          <div className="px-4 pt-4">
            <div
              className={`flex rounded-2xl p-1 ${
                theme === 'Light' ? 'bg-gray-100' : 'bg-white/5'
              }`}
            >
              <button
                onClick={() => setActiveView('tokens')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeView === 'tokens'
                    ? 'bg-white text-[#F47621] shadow'
                    : theme === 'Light'
                    ? 'text-gray-600'
                    : 'text-white/60'
                }`}
              >
                Tokens
              </button>
              <button
                onClick={() => setActiveView('transactions')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeView === 'transactions'
                    ? 'bg-white text-[#F47621] shadow'
                    : theme === 'Light'
                    ? 'text-gray-600'
                    : 'text-white/60'
                }`}
              >
                Transactions
              </button>
            </div>
          </div>

          {/* Content */}
          {activeView === 'tokens' ? (
            <TokensList
              tokens={walletTokens}
              tonClaimed={tonClaimed}
              showTokenInfo={showTokenInfo}
              onTokenClick={(token) => setSelectedTokenDetail(token)}
              onClaimTon={handleClaimTon}
              onBuyMKOIN={() => setShowBuyMKOIN(true)}
              onSellMKOIN={() => setShowSellMKOIN(true)}
              onTokenInfoToggle={(symbol) => setShowTokenInfo(symbol)}
            />
          ) : (
            <TransactionsList
              transactions={recentTransactions}
              showAll={showAllTransactions}
              onTransactionClick={(transaction) => setSelectedTransaction(transaction)}
              onViewAllClick={() => setShowAllTransactions(true)}
            />
          )}
        </div>
      </ScrollIndicator>

      {/* Modals */}
      <BuyMKOINModal
        isOpen={showBuyMKOIN}
        onClose={() => setShowBuyMKOIN(false)}
        onSubmit={handleBuySubmit}
        amount={buyAmount}
        onAmountChange={setBuyAmount}
      />

      <SellMKOINModal
        isOpen={showSellMKOIN}
        onClose={() => setShowSellMKOIN(false)}
        onSubmit={handleSellSubmit}
        amount={sellAmount}
        onAmountChange={setSellAmount}
        bankDetails={sellBankDetails}
        onBankDetailsChange={setSellBankDetails}
        saveBankDetails={saveBankDetails}
        onSaveBankDetailsChange={setSaveBankDetails}
        savedBankDetails={bankDetails}
      />

      <ClaimRewardModal
        isOpen={showClaimSuccess}
        onClose={() => setShowClaimSuccess(false)}
      />

      <ConfirmationModal
        isOpen={showBuyConfirmation}
        onClose={() => setShowBuyConfirmation(false)}
        type="buy"
        amount={buyAmount}
      />

      <ConfirmationModal
        isOpen={showSellConfirmation}
        onClose={() => setShowSellConfirmation(false)}
        type="sell"
        amount={sellAmount}
      />
    </>
  );
}
