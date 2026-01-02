import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wheat, Settings, ChevronRight, X, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ProfileButtonProps {
  onNavigateToAbout?: () => void;
}

export function ProfileButton({ onNavigateToAbout }: ProfileButtonProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [language, setLanguage] = useState<'EN' | 'SRB'>('EN');
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try to get Telegram user data
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        setUserName(firstName + (lastName ? ' ' + lastName : ''));
        
        // Note: Telegram Mini Apps don't provide direct access to profile photos
        // You would need to use the Bot API on your backend to fetch the photo
        if (user.photo_url) {
          setUserPhoto(user.photo_url);
        }
      }
    }
  }, []);

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
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F47621] to-[#d66a1e] flex items-center justify-center text-white font-medium overflow-hidden"
      >
        {userPhoto ? (
          <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm">{getInitials(userName)}</span>
        )}
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