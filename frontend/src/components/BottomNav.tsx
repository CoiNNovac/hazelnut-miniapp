import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

interface BottomNavProps {
  activeTab: 'tokens' | 'trade' | 'wallet';
  onTabChange: (tab: 'tokens' | 'trade' | 'wallet') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`relative border-t ${
      theme === 'Light'
        ? 'bg-white border-gray-200'
        : 'bg-[#0f1028] border-white/10'
    }`}>
      <div className="flex items-center justify-around h-20 px-4">
        <NavButton
          active={activeTab === 'tokens'}
          onClick={() => onTabChange('tokens')}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stacked coins */}
              <ellipse cx="12" cy="8" rx="7" ry="3" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M5 8V12C5 13.6569 8.13401 15 12 15C15.866 15 19 13.6569 19 12V8" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M5 12V16C5 17.6569 8.13401 19 12 19C15.866 19 19 17.6569 19 16V12" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          }
          label="Tokens"
        />

        <NavButton
          active={activeTab === 'trade'}
          onClick={() => onTabChange('trade')}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Arrow up */}
              <path d="M8 10L8 3M8 3L5 6M8 3L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Arrow down */}
              <path d="M16 14L16 21M16 21L13 18M16 21L19 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          label="Trade"
          isCenter
        />

        <NavButton
          active={activeTab === 'wallet'}
          onClick={() => onTabChange('wallet')}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 9L3 7C3 5.89543 3.89543 5 5 5L16 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="16"
                cy="15"
                r="2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          }
          label="Wallet"
        />
      </div>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isCenter?: boolean;
}

function NavButton({ active, onClick, icon, label, isCenter }: NavButtonProps) {
  const { theme } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all"
    >
      {isCenter && active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -top-10 w-14 h-14 rounded-full bg-[#F47621] flex items-center justify-center shadow-lg shadow-[#F47621]/20"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="text-white">{icon}</div>
        </motion.div>
      )}

      {!isCenter && (
        <div className={`transition-colors ${active ? 'text-[#F47621]' : theme === 'Light' ? 'text-gray-400' : 'text-white/50'}`}>
          {icon}
        </div>
      )}

      {!isCenter && (
        <span
          className={`transition-colors ${
            active ? 'text-[#F47621]' : theme === 'Light' ? 'text-gray-400' : 'text-white/50'
          }`}
        >
          {label}
        </span>
      )}

      {isCenter && !active && (
        <>
          <div className={theme === 'Light' ? 'text-gray-400' : 'text-white/50'}>{icon}</div>
          <span className={theme === 'Light' ? 'text-gray-400' : 'text-white/50'}>{label}</span>
        </>
      )}

      {isCenter && active && (
        <span className="text-[#F47621] mt-6">{label}</span>
      )}
    </button>
  );
}