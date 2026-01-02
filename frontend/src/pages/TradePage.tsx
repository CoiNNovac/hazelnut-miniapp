import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { ProfileButton } from '../components/ProfileButton';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react';
import { ScrollIndicator } from '../components/ScrollIndicator';
import { useTokens } from '../hooks/useTokens';

interface TradePageProps {
  selectedTokenSymbol?: string | null;
  onNavigateToAbout?: () => void;
}

export function TradePage({ selectedTokenSymbol, onNavigateToAbout }: TradePageProps) {
  const { data: tokens, isLoading } = useTokens();
  const { theme } = useTheme();

  // Get active tokens for trading
  const tradingPairs = useMemo(() => {
    if (!tokens) return [];
    return tokens.filter(token => token.status === 'active');
  }, [tokens]);

  // Find the token based on the symbol passed from token details
  const initialToken = useMemo(() => {
    if (!tradingPairs.length) return null;
    return selectedTokenSymbol
      ? tradingPairs.find(pair => pair.symbol === selectedTokenSymbol) || tradingPairs[0]
      : tradingPairs[0];
  }, [tradingPairs, selectedTokenSymbol]);

  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedPair, setSelectedPair] = useState(initialToken);
  const [amount, setAmount] = useState('1');
  const [price, setPrice] = useState(initialToken?.price.toString() || '0');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const availableBalance = 500; // MKOIN
  const maxAmount = selectedPair ? Math.floor(availableBalance / selectedPair.price) : 0; // Max coins user can buy

  if (isLoading || !selectedPair) {
    return (
      <div className={`h-full flex items-center justify-center ${
        theme === 'Light' ? 'bg-gray-50' : 'bg-[#1A1B41]'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47621] mx-auto mb-4"></div>
          <p className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Loading...</p>
        </div>
      </div>
    );
  }

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
          <h2 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>Trade</h2>
          <ProfileButton onNavigateToAbout={onNavigateToAbout} />
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="px-6 pt-6">
        <div className={`backdrop-blur-sm rounded-2xl p-1 border flex ${
          theme === 'Light'
            ? 'bg-gray-100 border-gray-200'
            : 'bg-white/5 border-white/10'
        }`}>
          <button
            onClick={() => setOrderType('buy')}
            className={`flex-1 py-3 rounded-xl transition-colors ${
              orderType === 'buy'
                ? 'bg-[#F47621] text-white'
                : theme === 'Light'
                ? 'text-gray-600'
                : 'text-white/60'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`flex-1 py-3 rounded-xl transition-colors ${
              orderType === 'sell'
                ? 'bg-[#F47621] text-white'
                : theme === 'Light'
                ? 'text-gray-600'
                : 'text-white/60'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Token Selection */}
      <div className="px-6 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tradingPairs.map((pair) => (
            <button
              key={pair.id}
              onClick={() => {
                setSelectedPair(pair);
                setPrice(pair.price.toString());
              }}
              className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all ${
                selectedPair.id === pair.id
                  ? 'bg-[#F47621] text-white'
                  : theme === 'Light'
                  ? 'bg-white text-gray-700 border border-gray-200'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">{pair.symbol}</div>
                <div className="text-sm">€{pair.price}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coming Soon for Sell - Otherwise Show Order Form */}
      {orderType === 'sell' ? (
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="mb-6"
            >
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
              >
                <circle cx="50" cy="50" r="40" fill="#F47621" fillOpacity="0.2" />
                <circle cx="50" cy="50" r="28" fill="#F47621" fillOpacity="0.3" />
                <path
                  d="M50 25V75M35 40L50 25L65 40"
                  stroke="#F47621"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-5xl mb-3 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}
            >
              Coming Soon
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}
            >
              Sell feature is under development
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 inline-block"
            >
              <div className={`backdrop-blur-sm rounded-2xl px-6 py-3 border ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <p className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}>Stay tuned for updates!</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Order Form */}
          <div className="px-6 space-y-4 mt-4">
            {/* Price Display */}
            <div className="space-y-3">
              <label className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}>Price (MKOIN = €)</label>
              <div className={`backdrop-blur-sm rounded-2xl border p-4 ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className={`text-2xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>€{selectedPair.price}</div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}>Amount ({selectedPair.symbol})</label>
              <div className={`backdrop-blur-sm rounded-2xl border overflow-hidden ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow integers
                    if (value === '' || /^\d+$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  className={`w-full px-4 py-4 bg-transparent text-2xl focus:outline-none ${
                    theme === 'Light'
                      ? 'text-gray-900 placeholder:text-gray-400'
                      : 'text-white placeholder:text-white/40'
                  }`}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Amount Slider */}
            <div className="space-y-2">
              <div className={`flex justify-between text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                <span>1</span>
                <span>Max: {maxAmount}</span>
              </div>
              <input
                type="range"
                min="1"
                max={maxAmount}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #F47621 0%, #F47621 ${((parseFloat(amount) - 1) / (maxAmount - 1)) * 100}%, ${theme === 'Light' ? 'rgba(209,213,219,0.5)' : 'rgba(255,255,255,0.1)'} ${((parseFloat(amount) - 1) / (maxAmount - 1)) * 100}%, ${theme === 'Light' ? 'rgba(209,213,219,0.5)' : 'rgba(255,255,255,0.1)'} 100%)`
                }}
              />
            </div>

            {/* Total */}
            <div className={`backdrop-blur-sm rounded-2xl border px-4 py-4 ${
              theme === 'Light'
                ? 'bg-white border-gray-200'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex justify-between items-center">
                <span className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}>Total MKOIN</span>
                <span className={`text-2xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  {(parseFloat(amount || '0') * parseFloat(price)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              className={`w-full h-14 rounded-2xl text-white ${
                orderType === 'buy'
                  ? 'bg-[#F47621]'
                  : 'bg-red-500'
              }`}
              onClick={() => setShowConfirmModal(true)}
            >
              {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedPair.symbol}
            </Button>
          </div>
        </>
      )}

      {/* Available Balance */}
      <div className="px-6 mt-4 mb-8">
        <div className={`backdrop-blur-sm rounded-2xl p-4 border ${
          theme === 'Light'
            ? 'bg-white border-gray-200'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex justify-between items-center">
            <span className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}>Available Balance</span>
            <span className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>500.00 MKOIN</span>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowConfirmModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-w-[430px] mx-auto ${
                theme === 'Light'
                  ? 'bg-white'
                  : 'bg-[#1A1B41]'
              }`}
              style={{ height: '70vh' }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1 rounded-full ${
                  theme === 'Light' ? 'bg-gray-300' : 'bg-white/20'
                }`} />
              </div>

              {/* Header - Fixed at top */}
              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className={`text-2xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    Confirm Purchase
                  </h3>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className={`p-2 rounded-full ${
                      theme === 'Light'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <ScrollIndicator isModal={true} className="px-6" style={{ maxHeight: 'calc(70vh - 140px)' }}>
                <div className="pb-6">
                  {/* Token Info */}
                  <div className={`backdrop-blur-sm rounded-2xl p-4 border mb-4 ${
                    theme === 'Light'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Token</span>
                      <span className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        {selectedPair.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Symbol</span>
                      <span className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        {selectedPair.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Amount</span>
                      <span className={`font-medium text-xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        {amount} {selectedPair.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Price per Token</span>
                      <span className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                        €{selectedPair.price}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center pt-3 border-t ${
                      theme === 'Light' ? 'border-gray-200' : 'border-white/10'
                    }`}>
                      <span className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>Total Cost</span>
                      <span className={`font-medium text-xl text-[#F47621]`}>
                        {(parseFloat(amount || '0') * parseFloat(price)).toFixed(2)} MKOIN
                      </span>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className={`backdrop-blur-sm rounded-2xl p-4 border mb-4 ${
                    theme === 'Light'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <h4 className={`font-medium mb-3 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                      Transaction Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Platform Fee</span>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>0.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Network Fee (TON)</span>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>~0.02 TON</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Processing Time</span>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>~30 seconds</span>
                      </div>
                    </div>
                  </div>

                  {/* Expected Returns */}
                  <div className={`backdrop-blur-sm rounded-2xl p-4 border mb-4 ${
                    theme === 'Light'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <h4 className={`font-medium mb-3 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                      Expected Returns
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Annual ROI</span>
                        <span className={`text-sm font-medium text-green-500`}>12-18%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Distribution Frequency</span>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Quarterly</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Next Distribution</span>
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>March 2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className={`backdrop-blur-sm rounded-2xl p-4 border mb-4 ${
                    theme === 'Light'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-[#F47621]/10 border-[#F47621]/20'
                  }`}>
                    <h4 className={`font-medium mb-2 text-sm ${theme === 'Light' ? 'text-orange-900' : 'text-[#F47621]'}`}>
                      ⚠️ Important Notice
                    </h4>
                    <p className={`text-xs ${theme === 'Light' ? 'text-orange-800' : 'text-white/80'}`}>
                      • Investments in profit-sharing tokens carry risk<br/>
                      • Returns are not guaranteed and depend on farm performance<br/>
                      • Tokens are locked until the investment round ends<br/>
                      • Please ensure you have enough TON for transaction fees
                    </p>
                  </div>

                  {/* Info text */}
                  <p className={`text-sm text-center mb-4 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    Want to learn more about this token before purchasing?
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      className="w-full h-14 rounded-2xl bg-[#F47621] text-white"
                      onClick={() => {
                        setShowConfirmModal(false);
                        // Handle confirm buy logic here
                      }}
                    >
                      Confirm Buy
                    </Button>
                    <Button
                      className={`w-full h-14 rounded-2xl border ${
                        theme === 'Light'
                          ? 'bg-white border-gray-200 text-gray-900'
                          : 'bg-white/5 border-white/10 text-white'
                      }`}
                      onClick={() => {
                        setShowConfirmModal(false);
                        // Navigate to token details page
                        if (onNavigateToAbout) {
                          onNavigateToAbout();
                        }
                      }}
                    >
                      See {selectedPair.symbol} Page
                    </Button>
                  </div>
                </div>
              </ScrollIndicator>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}