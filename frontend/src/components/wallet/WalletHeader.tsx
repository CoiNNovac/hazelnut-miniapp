import { useState } from 'react';
import { motion } from 'motion/react';
import { ProfileButton } from '../ProfileButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { formatAddress, convertToUserFriendly } from '../../utils/tonAddress';

interface WalletHeaderProps {
  walletAddress: string | null;
  totalBalance: string;
  onNavigateToAbout?: () => void;
}

export function WalletHeader({ walletAddress, totalBalance, onNavigateToAbout }: WalletHeaderProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      const userFriendly = convertToUserFriendly(walletAddress);
      navigator.clipboard.writeText(userFriendly);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className={`sticky top-0 z-40 backdrop-blur-md border-b ${theme === 'Light'
        ? 'bg-white/80 border-gray-200'
        : 'bg-[#1A1B41]/80 border-white/10'
      }`}>
      <div className="flex items-center justify-between p-4">
        <h1 className={`text-xl font-semibold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
          {t('wallet.title')}
        </h1>
        <ProfileButton onNavigateToAbout={onNavigateToAbout} />
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Total Balance */}
        <div>
          <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
            {t('wallet.totalBalance')}
          </p>
          <p className={`text-3xl font-bold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
            €{totalBalance}
          </p>
        </div>

        {/* Wallet Address */}
        <motion.div
          className={`flex items-center gap-2 rounded-2xl p-3 ${theme === 'Light'
              ? 'bg-gray-50'
              : 'bg-white/5'
            }`}
        >
          {copied ? (
            <div className="flex items-center gap-2 flex-1 justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={theme === 'Light' ? 'text-green-600' : 'text-green-400'}
              >
                <path
                  d="M13.3333 4L6 11.3333L2.66667 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={`text-sm ${theme === 'Light' ? 'text-green-600' : 'text-green-400'}`}>
                {t('wallet.copied')}
              </span>
            </div>
          ) : (
            <code className={`flex-1 text-center text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              {formatAddress(walletAddress || '')}
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
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M4 13H3C2.44772 13 2 12.5523 2 12V4C2 3.44772 2.44772 3 3 3H11C11.5523 3 12 3.44772 12 4V5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
