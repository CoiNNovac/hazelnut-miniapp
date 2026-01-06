import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wheat, Settings, ChevronRight, X, Info, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface ProfileButtonProps {
  onNavigateToAbout?: () => void;
}

export function ProfileButton({ onNavigateToAbout }: ProfileButtonProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'SRB'>('EN');
  const [telegramName, setTelegramName] = useState<string | null>(null);
  const [telegramPhoto, setTelegramPhoto] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get Telegram user data
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const tgUser = tg.initDataUnsafe?.user;

      console.log('Telegram WebApp data:', tg.initDataUnsafe);

      if (tgUser) {
        const firstName = tgUser.first_name || '';
        const lastName = tgUser.last_name || '';
        const fullName = firstName + (lastName ? ' ' + lastName : '');
        setTelegramName(fullName);

        if (tgUser.photo_url) {
          setTelegramPhoto(tgUser.photo_url);
        }
      }
    }
  }, []);

  // Get user name and photo - prioritize Telegram data, then AuthContext
  const userName = telegramName ||
    (user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'User');
  const userPhoto = telegramPhoto || user?.photoUrl || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
        setShowComingSoon(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2);
  };

  const handleFarmMode = () => {
    setShowComingSoon(true);
    setTimeout(() => {
      setShowComingSoon(false);
    }, 2000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
      >
        <span className={`text-sm font-medium transition-colors ${
          theme === 'Light'
            ? 'text-gray-700 group-hover:text-gray-900'
            : 'text-white/80 group-hover:text-white'
        }`}>
          {userName}
        </span>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F47621] to-[#d66a1e] flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
          {userPhoto ? (
            <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">{getInitials(userName)}</span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-72 backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden z-50 ${
              theme === 'Light'
                ? 'bg-white border-gray-200'
                : 'bg-[#1A1B41]/95 border-white/10'
            }`}
          >
            {showComingSoon && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 backdrop-blur-xl z-10 flex items-center justify-center ${
                  theme === 'Light'
                    ? 'bg-white/98'
                    : 'bg-[#1A1B41]/98'
                }`}
              >
                <div className="text-center px-4">
                  <Wheat size={48} className="text-[#F47621] mx-auto mb-3" />
                  <p className={`font-medium text-lg ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Coming Soon</p>
                  <p className={`text-sm mt-1 mb-4 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Farm Mode is on the way!</p>
                  <a
                    href="https://t.me/ivanori"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-lg px-4 py-2.5 text-sm font-medium"
                  >
                    Contact @ivanori to list your token
                  </a>
                </div>
              </motion.div>
            )}
            
            {!showSettings ? (
              <>
                {/* User Info */}
                <div className={`px-4 py-3 border-b ${
                  theme === 'Light'
                    ? 'border-gray-200'
                    : 'border-white/10'
                }`}>
                  <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>{userName}</p>
                  <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>@{userName.toLowerCase().replace(' ', '_')}</p>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {/* Farm Mode Button */}
                  <button
                    onClick={handleFarmMode}
                    className="w-full bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-xl px-4 py-3 mb-2 flex items-center gap-3"
                  >
                    <Wheat size={20} />
                    <span className="font-medium">Farm Mode</span>
                  </button>

                  {/* Settings Button */}
                  <button 
                    onClick={() => setShowSettings(true)}
                    className={`w-full rounded-xl px-4 py-3 flex items-center justify-between ${
                      theme === 'Light'
                        ? 'text-gray-700'
                        : 'text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={20} />
                      <span>Settings</span>
                    </div>
                    <ChevronRight size={16} className={theme === 'Light' ? 'text-gray-400' : 'text-white/40'} />
                  </button>

                  {/* About Button */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateToAbout?.();
                    }}
                    className={`w-full rounded-xl px-4 py-3 flex items-center justify-between transition-colors ${
                      theme === 'Light'
                        ? 'text-gray-700 active:bg-gray-100'
                        : 'text-white/80 active:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Info size={20} />
                      <span>About</span>
                    </div>
                    <ChevronRight size={16} className={theme === 'Light' ? 'text-gray-400' : 'text-white/40'} />
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${
                      theme === 'Light'
                        ? 'text-red-600 active:bg-red-50'
                        : 'text-red-400 active:bg-red-500/10'
                    }`}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Settings Header */}
                <div className={`px-4 py-3 border-b flex items-center justify-between ${
                  theme === 'Light'
                    ? 'border-gray-200'
                    : 'border-white/10'
                }`}>
                  <h3 className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>Settings</h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Settings Content */}
                <div className="p-2">
                  {/* Language */}
                  <div className="mb-4">
                    <label className={`text-sm px-3 block mb-2 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Language</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage('EN')}
                        className={`flex-1 py-2.5 rounded-lg ${
                          language === 'EN'
                            ? 'bg-[#F47621] text-white'
                            : theme === 'Light'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-white/5 text-white/60'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('SRB')}
                        className={`flex-1 py-2.5 rounded-lg ${
                          language === 'SRB'
                            ? 'bg-[#F47621] text-white'
                            : theme === 'Light'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-white/5 text-white/60'
                        }`}
                      >
                        SRB
                      </button>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="mb-4">
                    <label className={`text-sm px-3 block mb-2 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>Theme</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTheme('Dark')}
                        className={`flex-1 py-2.5 rounded-lg ${
                          theme === 'Dark'
                            ? 'bg-[#F47621] text-white'
                            : theme === 'Light'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-white/5 text-white/60'
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme('Light')}
                        className={`flex-1 py-2.5 rounded-lg ${
                          theme === 'Light'
                            ? 'bg-[#F47621] text-white'
                            : 'bg-white/5 text-white/60'
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  {/* Contact Support */}
                  <a
                    href="https://t.me/ivanori"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full rounded-xl px-4 py-3 transition-colors flex items-center justify-between mb-4 ${
                      theme === 'Light'
                        ? 'text-gray-700'
                        : 'text-white/80'
                    }`}
                  >
                    <span>Contact Support</span>
                    <span className="text-[#F47621]">@ivanori</span>
                  </a>

                  {/* Version */}
                  <div className="px-4 py-2 text-center">
                    <p className={`text-xs ${theme === 'Light' ? 'text-gray-400' : 'text-white/40'}`}>Version 1.0.0</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}