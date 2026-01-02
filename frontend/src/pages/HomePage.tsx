import { useState, useRef } from 'react';
import { TokensPage } from './TokensPage';
import { TradePage } from './TradePage';
import { WalletPage } from './WalletPage';
import { AboutPage } from './AboutPage';
import { BottomNav } from '../components/BottomNav';
import { useTheme } from '../contexts/ThemeContext';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'trade' | 'wallet'>('tokens');
  const [currentPage, setCurrentPage] = useState<'main' | 'about'>('main');
  const [selectedTradeToken, setSelectedTradeToken] = useState<string | null>(null);
  const { theme } = useTheme();
  const tokensPageResetRef = useRef<() => void>(null);
  const walletPageResetRef = useRef<() => void>(null);

  const handleTabChange = (tab: 'tokens' | 'trade' | 'wallet') => {
    if (tab === 'tokens' && tokensPageResetRef.current) {
      tokensPageResetRef.current();
    }
    if (tab === 'wallet' && walletPageResetRef.current) {
      walletPageResetRef.current();
    }
    setActiveTab(tab);
  };

  const handleNavigateToTradeWithToken = (tokenSymbol: string) => {
    setSelectedTradeToken(tokenSymbol);
    setActiveTab('trade');
  };

  const handleNavigateToAbout = () => {
    setCurrentPage('about');
  };

  const handleBackFromAbout = () => {
    setCurrentPage('main');
  };

  if (currentPage === 'about') {
    return <AboutPage onBack={handleBackFromAbout} />;
  }

  return (
    <div className={`size-full flex flex-col ${theme === 'Light' ? 'bg-gray-50' : 'bg-[#1A1B41]'}`}>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tokens' && (
          <TokensPage 
            onNavigateToTrade={() => setActiveTab('trade')} 
            onNavigateToTradeWithToken={handleNavigateToTradeWithToken}
            onNavigateToAbout={handleNavigateToAbout}
            resetRef={tokensPageResetRef} 
          />
        )}
        {activeTab === 'trade' && (
          <TradePage 
            selectedTokenSymbol={selectedTradeToken} 
            onNavigateToAbout={handleNavigateToAbout}
          />
        )}
        {activeTab === 'wallet' && (
          <WalletPage 
            onNavigateToAbout={handleNavigateToAbout}
            resetRef={walletPageResetRef} 
          />
        )}
      </div>
      
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}