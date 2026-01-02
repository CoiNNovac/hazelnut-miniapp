import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  userAddress: string;
}

interface BankAccountContextType {
  bankDetails: BankDetails;
  setBankDetails: (details: BankDetails) => void;
  saveBankDetails: (details: BankDetails) => void;
  hasSavedBankAccount: boolean;
}

const BankAccountContext = createContext<BankAccountContextType | undefined>(undefined);

export function BankAccountProvider({ children }: { children: ReactNode }) {
  const [bankDetails, setBankDetailsState] = useState<BankDetails>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    userAddress: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('coinnovac_bank_details');
    if (saved) {
      try {
        setBankDetailsState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bank details:', e);
      }
    }
  }, []);

  const setBankDetails = (details: BankDetails) => {
    setBankDetailsState(details);
    localStorage.setItem('coinnovac_bank_details', JSON.stringify(details));
  };

  const saveBankDetails = (details: BankDetails) => {
    setBankDetailsState(details);
    localStorage.setItem('coinnovac_bank_details', JSON.stringify(details));
  };

  const hasSavedBankAccount = !!(
    bankDetails.bankName &&
    bankDetails.accountName &&
    bankDetails.accountNumber
  );

  return (
    <BankAccountContext.Provider value={{ bankDetails, setBankDetails, saveBankDetails, hasSavedBankAccount }}>
      {children}
    </BankAccountContext.Provider>
  );
}

export function useBankAccount() {
  const context = useContext(BankAccountContext);
  if (context === undefined) {
    throw new Error('useBankAccount must be used within a BankAccountProvider');
  }
  return context;
}