import { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { WelcomePage } from './components/WelcomePage';
import { HomePage } from './components/HomePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { BankAccountProvider } from './contexts/BankAccountContext';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}