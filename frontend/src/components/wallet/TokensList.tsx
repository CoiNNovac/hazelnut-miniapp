import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Gift } from 'lucide-react';
import { MKOINLogo } from '../MKOINLogo';
import { useTheme } from '../../contexts/ThemeContext';

export interface WalletToken {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  alwaysShow: boolean;
  icon?: string;
}

interface TokensListProps {
  tokens: WalletToken[];
  tonClaimed: boolean;
  showTokenInfo: string | null;
  onTokenClick: (token: WalletToken) => void;
  onClaimTon: () => void;
  onBuyMKOIN: () => void;
  onSellMKOIN: () => void;
  onTokenInfoToggle: (symbol: string | null) => void;
}

export function TokensList({
  tokens,
  tonClaimed,
  showTokenInfo,
  onTokenClick,
  onClaimTon,
  onBuyMKOIN,
  onSellMKOIN,
  onTokenInfoToggle,
}: TokensListProps) {
  const { theme } = useTheme();

  return (
    <div className="p-4 space-y-3">
      {tokens
        .filter((token) => token.alwaysShow || token.balance > 0)
        .map((token, index) => (
          <motion.div
            key={token.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-2xl p-4 ${
              theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F47621] to-[#d66a1e] flex items-center justify-center text-white font-medium">
                  {token.icon ? (
                    <img src={token.icon} alt={token.symbol} className="w-6 h-6" />
                  ) : token.symbol === 'MKOIN' ? (
                    <MKOINLogo className="w-6 h-6" />
                  ) : (
                    token.symbol.slice(0, 2)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                      {token.symbol}
                    </p>
                    {token.symbol === 'MKOIN' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTokenInfoToggle(showTokenInfo === 'MKOIN' ? null : 'MKOIN');
                        }}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          theme === 'Light'
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        i
                      </button>
                    )}
                  </div>
                  <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    {token.balance.toLocaleString()} {token.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    €{(token.balance * token.price).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    €{token.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => onTokenClick(token)}
                  className={theme === 'Light' ? 'text-gray-400' : 'text-white/40'}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* TON Claim Gift */}
            {token.symbol === 'TON' && !tonClaimed && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimTon();
                }}
                className="w-full mt-3 bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <Gift size={20} />
                <span>Claim 25 TON Reward</span>
              </motion.button>
            )}

            {/* MKOIN Info */}
            <AnimatePresence>
              {showTokenInfo === 'MKOIN' && token.symbol === 'MKOIN' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    MKOIN is a stablecoin pegged to EUR (1 MKOIN = 1 EUR). Use it to buy and sell
                    tokens on the platform.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuyMKOIN();
                      }}
                      className="flex-1 bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-lg py-2 text-sm"
                    >
                      Buy MKOIN
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSellMKOIN();
                      }}
                      className={`flex-1 rounded-lg py-2 text-sm border ${
                        theme === 'Light'
                          ? 'border-gray-300 text-gray-700'
                          : 'border-white/20 text-white'
                      }`}
                    >
                      Sell MKOIN
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
    </div>
  );
}
