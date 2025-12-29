import { motion } from 'motion/react';
import { Clock, Inbox, TrendingUp } from 'lucide-react';
import hazelnutLogo from 'figma:asset/046fb87f26c54a3a09d3015e2f795c228f4f6636.png';
import { CountdownTimer } from './CountdownTimer';
import { TokenDetailsPage } from './TokenDetailsPage';
import { ProfileButton } from './ProfileButton';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { ScrollIndicator } from './ScrollIndicator';

// Temporarily empty to show empty states - remove the comments to restore data
const upcomingTokens = [
  {
    id: 1,
    name: 'Hazelnut Farm',
    symbol: 'HAZEL',
    price: 125.50,
    launchDate: 'Mar 15, 2025',
    logo: hazelnutLogo,
    balance: 234,
    endTime: new Date('2025-03-15T23:59:59').getTime(),
    tag: 'New',
    tagColor: 'bg-green-500/20 text-green-400',
    issuer: {
      name: 'Marco Rossi',
      farmAddress: 'Via delle Nocciole 45, Piedmont, Italy',
      yearsOfExperience: 25,
      licenseNumber: 'IT-AGR-2015-00234'
    }
  },
  {
    id: 2,
    name: 'Organic Corn Farm',
    symbol: 'CORN',
    price: 89.30,
    launchDate: 'Apr 1, 2025',
    logo: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwZmFybXxlbnwxfHx8fDE3NjY1ODc3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    balance: 150,
    endTime: new Date('2025-04-01T23:59:59').getTime(),
    tag: 'Hot',
    tagColor: 'bg-orange-500/20 text-orange-400',
    issuer: {
      name: 'Sarah Johnson',
      farmAddress: '1240 Prairie Road, Iowa, USA',
      yearsOfExperience: 18,
      licenseNumber: 'US-IA-2018-05678'
    }
  },
  {
    id: 3,
    name: 'Rice Paddy Valley',
    symbol: 'RICE',
    price: 205.80,
    launchDate: 'Apr 20, 2025',
    logo: 'https://images.unsplash.com/photo-1602989106211-81de671c23a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZmllbGR8ZW58MXx8fHwxNzY2NTA4ODAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    balance: 0,
    endTime: new Date('2025-04-20T23:59:59').getTime(),
    tag: 'New',
    tagColor: 'bg-green-500/20 text-green-400',
    issuer: {
      name: 'Nguyen Van Minh',
      farmAddress: 'Mekong Delta, An Giang Province, Vietnam',
      yearsOfExperience: 32,
      licenseNumber: 'VN-AG-2010-01892'
    }
  },
  {
    id: 4,
    name: 'Soybean Collective',
    symbol: 'SOY',
    price: 156.20,
    launchDate: 'May 5, 2025',
    logo: 'https://images.unsplash.com/photo-1719846923269-6fdf75444cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3liZWFuJTIwcGxhbnR8ZW58MXx8fHwxNjY2NTg3NzI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    balance: 500,
    endTime: new Date('2025-05-05T23:59:59').getTime(),
    tag: 'Featured',
    tagColor: 'bg-blue-500/20 text-blue-400',
    issuer: {
      name: 'Carlos Silva',
      farmAddress: 'Ruta 9 km 487, Mato Grosso, Brazil',
      yearsOfExperience: 22,
      licenseNumber: 'BR-MT-2016-03421'
    }
  },
];

const yourTokens = [
  {
    id: 1,
    name: 'Cotton Fields',
    symbol: 'COTTON',
    price: 245.00,
    balance: 125.5,
    value: 30757.50,
    logo: 'https://images.unsplash.com/photo-1616431101491-554c0932ea40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBwbGFudHxlbnwxfHx8fDE3NjY1ODc3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    issuer: {
      name: 'Ahmed Hassan',
      farmAddress: 'Nile Delta, Dakahlia Governorate, Egypt',
      yearsOfExperience: 28,
      licenseNumber: 'EG-DK-2013-04567'
    }
  },
  {
    id: 2,
    name: 'Olive Grove',
    symbol: 'OLIVE',
    price: 432.50,
    balance: 50.0,
    value: 21625.00,
    logo: 'https://images.unsplash.com/photo-1544475925-9199e8ed85ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMHRyZWV8ZW58MXx8fHwxNzY2NTE0Njk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tag: 'Upcoming',
    tagColor: 'bg-purple-500/20 text-purple-400',
    endTime: new Date('2025-06-01T23:59:59').getTime(),
    issuer: {
      name: 'Dimitrios Papadopoulos',
      farmAddress: 'Kalamata, Messenia, Greece',
      yearsOfExperience: 35,
      licenseNumber: 'GR-ME-2008-02134'
    }
  },
  {
    id: 3,
    name: 'Vineyard Estate',
    symbol: 'VINE',
    price: 228.45,
    balance: 125.0,
    value: 28556.25,
    logo: 'https://images.unsplash.com/photo-1659038025134-5f47bf7956c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW5leWFyZCUyMGdyYXBlc3xlbnwxfHx8fDE3NjY1ODc3Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    issuer: {
      name: 'Pierre Dubois',
      farmAddress: 'Bordeaux, Nouvelle-Aquitaine, France',
      yearsOfExperience: 40,
      licenseNumber: 'FR-NA-2005-01256'
    }
  },
  {
    id: 4,
    name: 'Sunflower Plains',
    symbol: 'SUN',
    price: 110.00,
    balance: 500.0,
    value: 55000.00,
    logo: 'https://images.unsplash.com/photo-1535222830855-fd60aca7e065?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5mbG93ZXIlMjBmaWVsZHxlbnwxfHx8fDE3NjY0ODM4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    issuer: {
      name: 'Olena Kovalenko',
      farmAddress: 'Zaporizhzhia Oblast, Ukraine',
      yearsOfExperience: 20,
      licenseNumber: 'UA-ZP-2017-03890'
    }
  },
  // Upcoming tokens with balance should also appear here
  {
    id: 5,
    name: 'Hazelnut Farm',
    symbol: 'HAZEL',
    price: 125.50,
    balance: 234,
    value: 29367.00,
    logo: hazelnutLogo,
    tag: 'New',
    tagColor: 'bg-green-500/20 text-green-400',
    issuer: {
      name: 'Marco Rossi',
      farmAddress: 'Via delle Nocciole 45, Piedmont, Italy',
      yearsOfExperience: 25,
      licenseNumber: 'IT-AGR-2015-00234'
    }
  },
  {
    id: 6,
    name: 'Organic Corn Farm',
    symbol: 'CORN',
    price: 89.30,
    balance: 150,
    value: 13395.00,
    logo: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwZmFybXxlbnwxfHx8fDE3NjY1ODc3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tag: 'Hot',
    tagColor: 'bg-orange-500/20 text-orange-400',
    issuer: {
      name: 'Sarah Johnson',
      farmAddress: '1240 Prairie Road, Iowa, USA',
      yearsOfExperience: 18,
      licenseNumber: 'US-IA-2018-05678'
    }
  },
  {
    id: 7,
    name: 'Soybean Collective',
    symbol: 'SOY',
    price: 156.20,
    balance: 500,
    value: 78100.00,
    logo: 'https://images.unsplash.com/photo-1719846923269-6fdf75444cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3liZWFuJTIwcGxhbnR8ZW58MXx8fHwxNjY2NTg3NzI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tag: 'Featured',
    tagColor: 'bg-blue-500/20 text-blue-400',
    issuer: {
      name: 'Carlos Silva',
      farmAddress: 'Ruta 9 km 487, Mato Grosso, Brazil',
      yearsOfExperience: 22,
      licenseNumber: 'BR-MT-2016-03421'
    }
  },
];

interface TokensPageProps {
  onNavigateToTrade: () => void;
  onNavigateToTradeWithToken?: (tokenSymbol: string) => void;
  onNavigateToAbout?: () => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
}

export function TokensPage({ onNavigateToTrade, onNavigateToTradeWithToken, onNavigateToAbout, resetRef }: TokensPageProps) {
  const totalValue = yourTokens.reduce((sum, token) => sum + token.value, 0);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const { theme } = useTheme();

  // Expose reset function via ref
  useEffect(() => {
    if (resetRef) {
      resetRef.current = () => setSelectedToken(null);
    }
  }, [resetRef]);

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
          {upcomingTokens.length === 0 ? (
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
                {upcomingTokens.map((token, index) => (
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
                        <span className={`px-2 py-0.5 rounded-full text-xs ${token.tagColor}`}>
                          {token.tag}
                        </span>
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
          {yourTokens.length === 0 ? (
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
                {yourTokens.map((token, index) => (
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