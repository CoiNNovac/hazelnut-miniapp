import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { LoadingScreen } from './pages/LoadingScreen';
import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BankAccountProvider } from './contexts/BankAccountContext';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './lib/queryClient';

// Configure TON Connect manifest URL
const manifestUrl = import.meta.env.VITE_TON_CONNECT_MANIFEST_URL ||
  `${window.location.origin}/tonconnect-manifest.json`;

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/app'
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <BankAccountProvider>
                <div className="size-full bg-[#0f1028] flex items-center justify-center">
                  <div className="w-full h-full max-w-[430px] max-h-[932px] relative overflow-hidden bg-[#1A1B41] shadow-2xl">
                    {showLoading ? (
                      <LoadingScreen onComplete={() => setShowLoading(false)} />
                    ) : showWelcome ? (
                      <WelcomePage onGetStarted={() => setShowWelcome(false)} />
                    ) : (
                      <HomePage />
                    )}
                  </div>
                </div>
              </BankAccountProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}
