import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: 'en' | 'me';
  setLanguage: (lang: 'en' | 'me') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<'en' | 'me'>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'me' ? 'me' : 'en') as 'en' | 'me';
  });

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const setLanguage = (lang: 'en' | 'me') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
