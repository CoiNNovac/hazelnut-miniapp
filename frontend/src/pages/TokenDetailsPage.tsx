import { motion } from 'motion/react';
import { ArrowLeft, Download, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileButton } from '../components/ProfileButton';
import type { Token } from '../types';

interface TokenDetailsPageProps {
  token: Token;
  onBack: () => void;
  onBuyNow: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const distributionData = [
  { name: 'Public Sale', value: 30, color: '#F47621' },
  { name: 'Farmers', value: 25, color: '#1A1B41' },
  { name: 'Team', value: 15, color: '#3B82F6' },
  { name: 'Reserve', value: 20, color: '#10B981' },
  { name: 'Liquidity', value: 10, color: '#8B5CF6' },
];

const roadmapItems = [
  { quarter: 'Q1 2025', title: 'Token Launch', status: 'completed', items: ['Public sale begins', 'Smart contract deployment', 'Initial distribution'] },
  { quarter: 'Q2 2025', title: 'Farm Operations', status: 'in-progress', items: ['Planting season starts', 'First harvest begins', 'Yield reporting system'] },
  { quarter: 'Q3 2025', title: 'Profit Distribution', status: 'upcoming', items: ['First profit sharing', 'Market expansion', 'New farm partnerships'] },
  { quarter: 'Q4 2025', title: 'Platform Growth', status: 'upcoming', items: ['Secondary market launch', 'Mobile app release', 'Global expansion'] },
];

const faqs = [
  { question: 'What are profit-sharing tokens?', answer: 'Profit-sharing tokens represent ownership in agricultural ventures. Token holders receive a share of the farm\'s profits based on their token holdings.' },
  { question: 'How often are profits distributed?', answer: 'Profits are distributed quarterly after each harvest season. Distribution dates are announced in advance through our platform.' },
  { question: 'What is the minimum investment?', answer: 'The minimum investment is 10 tokens. You can purchase tokens during the investment round period.' },
  { question: 'Can I sell my tokens?', answer: 'Yes, tokens can be traded on our secondary market after the initial lock-up period of 6 months.' },
  { question: 'What risks are involved?', answer: 'Agricultural investments carry risks including weather, market prices, and operational factors. Past performance doesn\'t guarantee future results.' },
];

// Mock data for yearly returns
const yearlyReturns = [
  {
    year: 2025,
    targetYield: 10,
    actualYield: 11.2,
    totalReceived: 201.90,
    date: 'Dec 15, 2025'
  },
  {
    year: 2024,
    targetYield: 10,
    actualYield: 9.5,
    totalReceived: 181.80,
    date: 'Dec 10, 2024'
  },
  {
    year: 2023,
    targetYield: 10,
    actualYield: 12.8,
    totalReceived: 245.50,
    date: 'Dec 12, 2023'
  },
];

export function TokenDetailsPage({ token, onBack, onBuyNow }: TokenDetailsPageProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Show footer for upcoming tokens (any token with endTime is an upcoming token that should show buy footer)
  const isUpcomingToken = !!token.endTime;

  // Mock data for token sale
  const maxTokens = 10000;
  const soldTokens = 8000;
  const progressPercentage = (soldTokens / maxTokens) * 100;
  const eurRaised = soldTokens * token.price;

  useEffect(() => {
    if (!token.endTime) return; // Don't run timer if no endTime
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = (token.endTime || 0) - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [token.endTime]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const { theme } = useTheme();

  return (
    <div className={`min-h-screen pb-28 ${
      theme === 'Light' 
        ? 'bg-gradient-to-b from-gray-50 to-gray-100' 
        : 'bg-[#0f1028]'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-sm border-b ${
        theme === 'Light'
          ? 'bg-white/95 border-gray-200'
          : 'bg-[#1A1B41]/95 border-white/10'
      }`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'}
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={onBack}
              className={theme === 'Light' ? 'text-gray-900' : 'text-white'}
            >
              {token.name}
            </button>
          </div>
          <ProfileButton />
        </div>
      </div>

      <div className="px-6 py-6 space-y-8 pb-40">{/* Increased bottom padding for floating footer */}
        {/* Token Price & Sale Info - Only show for upcoming tokens */}
        {isUpcomingToken && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`backdrop-blur-sm rounded-3xl p-6 border ${
              theme === 'Light'
                ? 'bg-blue-100 border-blue-200'
                : 'bg-gradient-to-br from-blue-600/30 to-blue-800/30 border-blue-500/30'
            }`}
          >
            {/* Price */}
            <div className="text-center mb-4">
              <div className={theme === 'Light' ? 'text-gray-900 text-2xl' : 'text-white text-2xl'}>
                1 {token.symbol} = €{token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`mt-1 ${theme === 'Light' ? 'text-gray-700' : 'text-white/70'}`}>1 Token represents 1 tree</div>
            </div>

            {/* Countdown Message */}
            <div className={`text-center mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white/90'}`}>
              Buy now before the price increase in:
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center">
                <div className={`text-4xl font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{formatNumber(timeLeft.days)}</div>
                <div className={`text-sm mt-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Days</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{formatNumber(timeLeft.hours)}</div>
                <div className={`text-sm mt-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Hours</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{formatNumber(timeLeft.minutes)}</div>
                <div className={`text-sm mt-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Minutes</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{formatNumber(timeLeft.seconds)}</div>
                <div className={`text-sm mt-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Seconds</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className={`w-full h-3 rounded-full overflow-hidden ${
                theme === 'Light' ? 'bg-blue-200' : 'bg-white/20'
              }`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                />
              </div>
            </div>

            {/* EUR Raised */}
            <div className={`text-center ${theme === 'Light' ? 'text-gray-900' : 'text-white/90'}`}>
              EUR Raised: €{eurRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </motion.div>
        )}

        {/* Token Issuer Information */}
        {token.issuer && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`backdrop-blur-sm rounded-2xl p-6 border ${
              theme === 'Light'
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-500/30'
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Farmer Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                theme === 'Light' ? 'bg-green-500' : 'bg-green-600'
              }`}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`mb-1 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  Token Issuer
                </h3>
                <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                  Verified agricultural producer
                </p>
              </div>
            </div>

            {/* Issuer Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 mt-0.5 ${theme === 'Light' ? 'text-green-600' : 'text-green-400'}`}
                >
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="flex-1">
                  <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-500' : 'text-white/40'}`}>
                    Name
                  </div>
                  <div className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                    {token.issuer.name}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 mt-0.5 ${theme === 'Light' ? 'text-green-600' : 'text-green-400'}`}
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="flex-1">
                  <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-500' : 'text-white/40'}`}>
                    Farm Address
                  </div>
                  <div className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                    {token.issuer.farmAddress}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 mt-0.5 ${theme === 'Light' ? 'text-green-600' : 'text-green-400'}`}
                >
                  <path
                    d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="flex-1">
                  <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-500' : 'text-white/40'}`}>
                    Experience
                  </div>
                  <div className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>
                    {token.issuer.yearsOfExperience} years in agriculture
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 mt-0.5 ${theme === 'Light' ? 'text-green-600' : 'text-green-400'}`}
                >
                  <path
                    d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15.01L9.41 16.42L11 14.84V19H13V14.84L14.59 16.43L16 15.01L12.01 11L8 15.01Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="flex-1">
                  <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-500' : 'text-white/40'}`}>
                    Agricultural License
                  </div>
                  <div className={`font-mono ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    {token.issuer.licenseNumber}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Join Official Telegram Channel */}
        <motion.a
          href="https://t.me/your_token_channel"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`block backdrop-blur-sm rounded-2xl p-6 border ${
            theme === 'Light'
              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
              : 'bg-gradient-to-r from-blue-900/20 to-cyan-900/10 border-blue-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Telegram Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                theme === 'Light' ? 'bg-blue-500' : 'bg-blue-600'
              }`}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h3 className={`mb-1 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Join Official Channel</h3>
                <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Get updates and announcements</p>
              </div>
            </div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={theme === 'Light' ? 'text-gray-400' : 'text-white/40'}
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.a>

        {/* Your Investment */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`backdrop-blur-sm rounded-2xl p-6 border ${
            theme === 'Light'
              ? 'bg-orange-100 border-orange-200'
              : 'bg-gradient-to-br from-[#F47621]/20 to-[#F47621]/5 border-[#F47621]/30'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>Your Investment</div>
            <div className={`text-right ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Your share</div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{token.balance}</span>
              <span className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}>{token.symbol}</span>
            </div>
            <div className={`text-3xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              {(((token.balance || 0) / maxTokens) * 100).toFixed(2)}%
            </div>
          </div>
          <div className={`mt-2 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
            ≈ €{((token.balance || 0) * token.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </motion.div>

        {/* Target Interest Rate */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className={`backdrop-blur-sm rounded-2xl p-6 border text-center ${
            theme === 'Light'
              ? 'bg-green-100 border-green-200'
              : 'bg-gradient-to-br from-green-600/20 to-green-800/10 border-green-500/30'
          }`}
        >
          <h3 className={`mb-2 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Target Yearly Yield</h3>
          <div className={`text-6xl mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>10%</div>
          <div className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Expected annual return on investment</div>
        </motion.div>

        {/* Investment Return Overview - Only show for owned tokens */}
        {!isUpcomingToken && (() => {
          // Check if this is an upcoming token with no data yet
          if (token.tag === 'Upcoming') {
            return (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 }}
                className={`backdrop-blur-sm rounded-2xl p-6 border ${
                  theme === 'Light'
                    ? 'bg-white border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <h3 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Investment Return Overview</h3>
                
                {/* No Data Yet Message */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-xl p-8 border text-center ${
                    theme === 'Light'
                      ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                      : 'bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border-purple-500/30'
                  }`}
                >
                  <div className={`text-5xl mb-3 ${theme === 'Light' ? 'text-purple-400' : 'text-purple-300'}`}>📊</div>
                  <h4 className={`mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>No Data Yet</h4>
                  <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    Investment return data will appear here once farming operations begin
                  </p>
                </motion.div>
              </motion.div>
            );
          }

          const totalReceivedAllYears = yearlyReturns.reduce((sum, year) => sum + year.totalReceived, 0);
          const totalInvestmentValue = (token.balance || 0) * token.price;
          const totalReturnPercentage = (totalReceivedAllYears / totalInvestmentValue) * 100;
          
          return (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className={`backdrop-blur-sm rounded-2xl p-6 border ${
                theme === 'Light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <h3 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Investment Return Overview</h3>
              
              {/* Summary Section */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`rounded-xl p-5 mb-4 border-2 ${
                  theme === 'Light'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : 'bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-500/30'
                }`}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Total Received</div>
                    <div className={`text-3xl font-bold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                      €{totalReceivedAllYears.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Investment Returned</div>
                    <div className={`text-3xl font-bold ${
                      totalReturnPercentage >= 30 
                        ? theme === 'Light' ? 'text-green-700' : 'text-green-400'
                        : theme === 'Light' ? 'text-orange-700' : 'text-orange-400'
                    }`}>
                      {totalReturnPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4">
                {yearlyReturns.map((yearData, yearIndex) => {
                  const yieldDifference = yearData.actualYield - yearData.targetYield;
                  const isAboveTarget = yieldDifference >= 0;
                  
                  return (
                    <motion.div
                      key={yearData.year}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + yearIndex * 0.05 }}
                      className={`rounded-xl p-4 border ${
                        theme === 'Light'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Year Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`text-lg ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{yearData.year}</div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                          isAboveTarget 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          <span className={`text-sm ${
                            isAboveTarget 
                              ? theme === 'Light' ? 'text-green-700' : 'text-green-400'
                              : theme === 'Light' ? 'text-red-700' : 'text-red-400'
                          }`}>
                            {isAboveTarget ? '↑' : '↓'} {Math.abs(yieldDifference).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Yield Comparison */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className={`p-3 rounded-lg ${
                          theme === 'Light' ? 'bg-white' : 'bg-white/5'
                        }`}>
                          <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Target Yield</div>
                          <div className={`text-xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{yearData.targetYield}%</div>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          theme === 'Light' ? 'bg-white' : 'bg-white/5'
                        }`}>
                          <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Actual Yield</div>
                          <div className={`text-xl ${
                            isAboveTarget 
                              ? theme === 'Light' ? 'text-green-700' : 'text-green-400'
                              : theme === 'Light' ? 'text-red-700' : 'text-red-400'
                          }`}>{yearData.actualYield}%</div>
                        </div>
                      </div>

                      {/* Total Received */}
                      <div className={`mb-3 p-3 rounded-lg ${
                        theme === 'Light' ? 'bg-orange-50 border border-orange-200' : 'bg-[#F47621]/10 border border-[#F47621]/20'
                      }`}>
                        <div className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Total Received</div>
                        <div className={`text-2xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>€{yearData.totalReceived.toFixed(2)}</div>
                      </div>

                      {/* Transactions */}
                      <div className="space-y-2">
                        <div className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'} mb-2`}>Distributions:</div>
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            theme === 'Light' ? 'bg-white' : 'bg-white/5'
                          }`}
                        >
                          <div>
                            <div className={`text-sm ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Q4 Harvest Distribution</div>
                            <div className={`text-xs ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                              {yearData.date}
                            </div>
                          </div>
                          <div className={`font-medium ${theme === 'Light' ? 'text-green-700' : 'text-green-400'}`}>
                            +€{yearData.totalReceived.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Token Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`backdrop-blur-sm rounded-2xl p-6 border ${
            theme === 'Light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <h3 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Token Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ value }) => `${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ color: theme === 'Light' ? '#111827' : '#fff' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`backdrop-blur-sm rounded-2xl p-6 border ${
            theme === 'Light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <h3 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Roadmap</h3>
          <div className="space-y-4">
            {roadmapItems.map((item, index) => (
              <div key={index} className={`relative pl-6 border-l-2 last:border-transparent pb-6 ${
                theme === 'Light' ? 'border-gray-300' : 'border-white/20'
              }`}>
                <div
                  className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-green-500'
                      : item.status === 'in-progress'
                      ? 'bg-[#F47621]'
                      : theme === 'Light'
                      ? 'bg-gray-300'
                      : 'bg-white/30'
                  }`}
                />
                <div className={`text-sm mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>{item.quarter}</div>
                <div className={`mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</div>
                <ul className="space-y-1">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex} className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                      • {subItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Whitepaper */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button className={`w-full backdrop-blur-sm rounded-2xl p-6 border flex items-center justify-between ${
            theme === 'Light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="text-left">
              <h3 className={`mb-1 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Whitepaper</h3>
              <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Download detailed project documentation</p>
            </div>
            <Download className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'} size={24} />
          </button>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`backdrop-blur-sm rounded-2xl p-6 border ${
            theme === 'Light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <h3 className={`mb-4 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className={`border-b last:border-0 pb-3 last:pb-0 ${
                theme === 'Light' ? 'border-gray-200' : 'border-white/10'
              }`}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left py-2"
                >
                  <span className={theme === 'Light' ? 'text-gray-900' : 'text-white'}>{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'} size={20} />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedFaq === index ? 'auto' : 0,
                    opacity: expandedFaq === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className={`text-sm pt-2 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>{faq.answer}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Buy Now Footer - Above Navigation */}
      {isUpcomingToken && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-24 left-0 right-0 px-6 z-20"
        >
          <div className="max-w-[430px] mx-auto bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-blue-400/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                  <img src={token.logo} alt={token.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white font-medium">{token.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F47621] text-white text-xs px-2 py-0.5 rounded-md">{token.tag}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onBuyNow}
                className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-medium shadow-lg"
              >
                Buy Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}