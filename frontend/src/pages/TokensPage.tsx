import { motion } from 'motion/react';
import { Clock, Inbox, TrendingUp } from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { TokenDetailsPage } from './TokenDetailsPage';
import { ProfileButton } from '../components/ProfileButton';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect, useMemo } from 'react';
import { ScrollIndicator } from '../components/ScrollIndicator';
import { useTokens } from '../hooks/useTokens';
import { usePurchases } from '../hooks/usePurchases';
import type { Token } from '../types';

interface TokensPageProps {
  onNavigateToTrade: () => void;
  onNavigateToTradeWithToken?: (tokenSymbol: string) => void;
  onNavigateToAbout?: () => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
}

export function TokensPage({ onNavigateToTrade, onNavigateToTradeWithToken, onNavigateToAbout, resetRef }: TokensPageProps) {
  const { data: tokens, isLoading: tokensLoading } = useTokens();
  const { data: purchases, isLoading: purchasesLoading } = usePurchases();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const { theme } = useTheme();

  // Calculate user's tokens with balances
  const yourTokensData = useMemo(() => {
    if (!tokens || !purchases) return [];

    const tokenBalances = purchases.reduce((acc, purchase) => {
      if (purchase.status === 'confirmed') {
        acc[purchase.tokenId] = (acc[purchase.tokenId] || 0) + purchase.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return tokens
      .filter(token => tokenBalances[token.id])
      .map(token => ({
        ...token,
        balance: tokenBalances[token.id],
        value: tokenBalances[token.id] * token.price,
        endTime: new Date(token.saleEnd).getTime(),
        tag: token.apy >= 15 ? 'Hot' : undefined,
        tagColor: token.apy >= 15 ? 'bg-orange-500/20 text-orange-400' : undefined,
      }));
  }, [tokens, purchases]);

  // Filter active tokens for upcoming section
  const upcomingTokensData = useMemo(() => {
    if (!tokens) return [];
    return tokens
      .filter(token => token.status === 'active')
      .map(token => ({
        ...token,
        endTime: new Date(token.saleEnd).getTime(),
        tag: token.apy >= 15 ? 'Hot' : 'New',
        tagColor: token.apy >= 15 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400',
      }));
  }, [tokens]);

  const totalValue = yourTokensData.reduce((sum, token) => sum + token.value, 0);
  const isLoading = tokensLoading || purchasesLoading;

  // Expose reset function via ref (must be before early returns)
  useEffect(() => {
    if (resetRef) {
      resetRef.current = () => setSelectedToken(null);
    }
  }, [resetRef]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${
        theme === 'Light' ? 'bg-gray-50' : 'bg-[#1A1B41]'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47621] mx-auto mb-4"></div>
          <p className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (selectedToken) {
    return (
      <TokenDetailsPage 
        token={selectedToken} 
        onBack={() => setSelectedToken(null)}
        onBuyNow={() => {
          setSelectedToken(null);
          if (onNavigateToTradeWithToken) {
            onNavigateToTradeWithToken(selectedToken.symbol);
          } else {
            onNavigateToTrade();
          }
        }}
      />
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
            <h2 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>Tokens</h2>
            <ProfileButton onNavigateToAbout={onNavigateToAbout} />
          </div>
        </div>

        {/* Portfolio Value Card */}
        <div className="p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-[#F47621] to-[#d66a1e] rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-white/80">Total Portfolio Value</p>
              <p className="text-white/80 text-right">Total Investment Returned</p>
            </div>
            <div className="flex items-baseline justify-between">
              <h1 className="text-white">
                €{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <h1 className="text-white">
                €12,450.75
              </h1>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Tokens Section */}
        <div className="px-6 mb-6">
          <h3 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Upcoming Tokens</h3>
          {upcomingTokensData.length === 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`backdrop-blur-sm rounded-2xl p-8 border text-center ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#F47621]/20 flex items-center justify-center">
                  <TrendingUp size={32} className="text-[#F47621]" />
                </div>
                <div>
                  <h4 className={`mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>No Upcoming Tokens</h4>
                  <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    New investment opportunities will appear here. Check back soon!
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <ScrollIndicator className="h-[280px]">
              <div className="space-y-3 pr-2">
                {upcomingTokensData.map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`backdrop-blur-sm rounded-2xl p-4 border cursor-pointer ${
                      theme === 'Light'
                        ? 'bg-white border-gray-200'
                        : 'bg-white/5 border-white/10'
                    }`}
                    onClick={() => setSelectedToken(token)}
                  >
                    {/* First Row: Logo, Name, Tag */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                        <img src={token.logo} alt={token.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>{token.name}</h4>
                        {token.tag && token.tagColor && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${token.tagColor}`}>
                            {token.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Second Row: Your Balance */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Your balance:</span>
                      <span className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>{token.balance} {token.symbol}</span>
                    </div>

                    {/* Third Row: Investment Round Timer */}
                    <div className={`flex justify-between items-center rounded-xl p-2 ${
                      theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'} />
                        <span className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Investment Round ends in:</span>
                      </div>
                      <CountdownTimer endTime={token.endTime} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollIndicator>
          )}
        </div>

        {/* Your Tokens Section */}
        <div className="px-6">
          <h3 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Your Tokens</h3>
          {yourTokensData.length === 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`backdrop-blur-sm rounded-2xl p-8 border text-center ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                  theme === 'Light'
                    ? 'bg-gray-100 border-gray-300'
                    : 'bg-[#1A1B41] border-white/10'
                }`}>
                  <Inbox size={32} className={theme === 'Light' ? 'text-gray-400' : 'text-white/60'} />
                </div>
                <div>
                  <h4 className={`mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>No Tokens Yet</h4>
                  <p className={`text-sm mb-4 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    Start investing in profit-sharing tokens to grow your portfolio
                  </p>
                  <button
                    onClick={onNavigateToTrade}
                    className="bg-[#F47621] text-white px-6 py-2 rounded-xl"
                  >
                    Explore Tokens
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <ScrollIndicator className="h-[280px]">
              <div className="space-y-3 pr-2">
                {yourTokensData.map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`backdrop-blur-sm rounded-2xl p-4 border cursor-pointer ${
                      theme === 'Light'
                        ? 'bg-white border-gray-200'
                        : 'bg-white/5 border-white/10'
                    }`}
                    onClick={() => setSelectedToken(token)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          <img src={token.logo} alt={token.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>{token.name}</h4>
                          <p className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>{token.balance} {token.symbol}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>€{token.value.toLocaleString()}</p>
                        <p className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>€{token.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollIndicator>
          )}
        </div>
      </div>
    </ScrollIndicator>
  );
}