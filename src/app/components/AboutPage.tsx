import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import logo from 'figma:asset/07d53540cb4d65ebf202579f8142b08e6b848c38.png';
import ivanPhoto from 'figma:asset/439f4185cb5b2e7b49c876bb0b0ce377f70d3fc9.png';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  const { theme } = useTheme();

  return (
    <div className={`size-full flex flex-col ${theme === 'Light' ? 'bg-gray-50' : 'bg-[#1A1B41]'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        theme === 'Light' 
          ? 'bg-white border-gray-200' 
          : 'bg-[#1A1B41] border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-full ${
              theme === 'Light'
                ? 'bg-gray-100 text-gray-600 active:bg-gray-200'
                : 'bg-white/5 text-white/60 active:bg-white/10'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-xl ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
            About
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* App Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center shadow-lg">
              <img src={logo} alt="CoinNovac Logo" className="w-28 h-28" />
            </div>
          </div>

          {/* App Name */}
          <div className="text-center mb-6">
            <h2 className={`text-2xl mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              CoinNovac
            </h2>
            <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              Version 1.0.0
            </p>
          </div>

          {/* Description */}
          <div className={`rounded-2xl p-4 ${
            theme === 'Light'
              ? 'bg-white border border-gray-200'
              : 'bg-white/5 border border-white/10'
          }`}>
            <h3 className={`font-medium mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              About This App
            </h3>
            <p className={`text-sm leading-relaxed ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              CoinNovac is a Telegram mini app for investing in profit sharing TON tokens. 
              Our platform focuses on agriculture decentralized finance, connecting investors 
              with farmers and agricultural projects through blockchain technology.
            </p>
          </div>

          {/* Mission */}
          <div className={`rounded-2xl p-4 ${
            theme === 'Light'
              ? 'bg-white border border-gray-200'
              : 'bg-white/5 border border-white/10'
          }`}>
            <h3 className={`font-medium mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              Our Mission
            </h3>
            <p className={`text-sm leading-relaxed ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              To revolutionize agricultural financing by providing transparent, accessible, 
              and profitable investment opportunities in the farming sector through blockchain 
              technology and profit-sharing tokens.
            </p>
          </div>

          {/* Team */}
          <div className={`rounded-2xl p-4 ${
            theme === 'Light'
              ? 'bg-white border border-gray-200'
              : 'bg-white/5 border border-white/10'
          }`}>
            <h3 className={`font-medium mb-3 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              Team
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <img 
                  src={ivanPhoto} 
                  alt="Ivan Coric" 
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                
                {/* Info */}
                <div className="flex-1">
                  <h4 className={`font-medium text-sm mb-1 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                    Ivan Coric
                  </h4>
                  <p className={`text-xs mb-2 ${theme === 'Light' ? 'text-gray-500' : 'text-white/50'}`}>
                    QA & Project Manager
                  </p>
                  <p className={`text-sm leading-relaxed ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                    6 years in decentralized finance as QA and project manager, working on various 
                    projects, from top tier Tether projects, to well known wallets, DeFi protocols 
                    and other projects.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className={`rounded-2xl p-4 ${
            theme === 'Light'
              ? 'bg-white border border-gray-200'
              : 'bg-white/5 border border-white/10'
          }`}>
            <h3 className={`font-medium mb-3 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              Key Features
            </h3>
            <ul className={`space-y-2 text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              <li className="flex items-start gap-2">
                <span className="text-[#F47621] mt-0.5">•</span>
                <span>Browse and invest in verified agricultural tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F47621] mt-0.5">•</span>
                <span>Track your investments and profit returns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F47621] mt-0.5">•</span>
                <span>Secure trading powered by TON blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F47621] mt-0.5">•</span>
                <span>Real-time updates on token performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F47621] mt-0.5">•</span>
                <span>Direct connection with token issuers</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={`rounded-2xl p-4 ${
            theme === 'Light'
              ? 'bg-white border border-gray-200'
              : 'bg-white/5 border border-white/10'
          }`}>
            <h3 className={`font-medium mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              Contact & Support
            </h3>
            <p className={`text-sm mb-3 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              Have questions or need assistance? Reach out to our team:
            </p>
            <a
              href="https://t.me/ivanori"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              Contact Support
            </a>
          </div>

          {/* Legal */}
          <div className="text-center pt-4 pb-8">
            <p className={`text-xs ${theme === 'Light' ? 'text-gray-500' : 'text-white/40'}`}>
              © 2025 CoinNovac. All rights reserved.
            </p>
            <p className={`text-xs mt-2 ${theme === 'Light' ? 'text-gray-500' : 'text-white/40'}`}>
              Built with ❤️ for the agricultural community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}