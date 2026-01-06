import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const logo = '/assets/logo.svg';

interface WelcomePageProps {
  onGetStarted: () => void;
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  const { connectWallet, walletConnected } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-navigate when wallet is connected
  useEffect(() => {
    if (walletConnected && isConnecting) {
      // Wallet just connected, navigate to home
      setTimeout(() => {
        onGetStarted();
      }, 500);
    }
  }, [walletConnected, isConnecting, onGetStarted]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
      // Don't navigate here - let the useEffect handle it when wallet connects
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-white">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <img src={logo} alt="CoinNovac" className="w-48 h-auto" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-3 w-full px-4"
        >
          <h1 className="text-[#1A1B41]">
            Invest in Profit Sharing Tokens
          </h1>
          <p className="text-[#1A1B41]/70">
            Be a part of the agriculture decentralized finance. Buy Tokens, get yearly yield based on farmers real revenues
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-3 w-full"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F47621] flex items-center justify-center flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 4L6 11.3333L2.66667 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[#1A1B41]">Secure & Transparent</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F47621] flex items-center justify-center flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 4L6 11.3333L2.66667 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[#1A1B41]">Profit Sharing Rewards</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F47621] flex items-center justify-center flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 4L6 11.3333L2.66667 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[#1A1B41]">Invest in small business</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full pb-4"
      >
        <Button
          onClick={handleConnect}
          disabled={isConnecting || walletConnected}
          className="w-full h-14 bg-[#F47621] text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </Button>
      </motion.div>
    </div>
  );
}