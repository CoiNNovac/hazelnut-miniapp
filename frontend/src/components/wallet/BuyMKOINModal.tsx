import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

interface BuyMKOINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  amount: string;
  onAmountChange: (amount: string) => void;
}

export function BuyMKOINModal({
  isOpen,
  onClose,
  onSubmit,
  amount,
  onAmountChange,
}: BuyMKOINModalProps) {
  const { theme } = useTheme();
  const [copiedBankDetail, setCopiedBankDetail] = useState<string | null>(null);

  const handleCopyBankDetail = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankDetail(field);
    setTimeout(() => {
      setCopiedBankDetail(null);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto ${
            theme === 'Light' ? 'bg-white' : 'bg-[#1A1B41]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              Buy MKOIN
            </h2>
            <button
              onClick={onClose}
              className={theme === 'Light' ? 'text-gray-600' : 'text-white/60'}
            >
              <X size={24} />
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className={`text-sm block mb-2 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              Amount (EUR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              className={`w-full px-4 py-3 rounded-xl text-lg ${
                theme === 'Light'
                  ? 'bg-gray-50 text-gray-900 border border-gray-200'
                  : 'bg-white/5 text-white border border-white/10'
              }`}
            />
            <p className={`text-sm mt-2 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              You will receive: {amount || '0'} MKOIN
            </p>
          </div>

          {/* Bank Details */}
          <div className="mb-6 space-y-3">
            <p className={`text-sm font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              Transfer to:
            </p>

            {/* Bank Name */}
            <div className={`p-3 rounded-xl ${theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'}`}>
              <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                Bank Name
              </p>
              <div className="flex items-center justify-between">
                <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  Raiffeisen Bank Serbia
                </p>
                <button
                  onClick={() => handleCopyBankDetail('Raiffeisen Bank Serbia', 'bankName')}
                  className={`p-1 rounded transition-colors ${
                    copiedBankDetail === 'bankName'
                      ? 'text-green-500'
                      : theme === 'Light'
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {copiedBankDetail === 'bankName' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Account Name */}
            <div className={`p-3 rounded-xl ${theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'}`}>
              <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                Account Name
              </p>
              <div className="flex items-center justify-between">
                <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  CoinNovac d.o.o.
                </p>
                <button
                  onClick={() => handleCopyBankDetail('CoinNovac d.o.o.', 'accountName')}
                  className={`p-1 rounded transition-colors ${
                    copiedBankDetail === 'accountName'
                      ? 'text-green-500'
                      : theme === 'Light'
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {copiedBankDetail === 'accountName' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div className={`p-3 rounded-xl ${theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'}`}>
              <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                Account Number
              </p>
              <div className="flex items-center justify-between">
                <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  265-1050310000956-94
                </p>
                <button
                  onClick={() => handleCopyBankDetail('265-1050310000956-94', 'accountNumber')}
                  className={`p-1 rounded transition-colors ${
                    copiedBankDetail === 'accountNumber'
                      ? 'text-green-500'
                      : theme === 'Light'
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {copiedBankDetail === 'accountNumber' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* IBAN */}
            <div className={`p-3 rounded-xl ${theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'}`}>
              <p className={`text-xs mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                IBAN
              </p>
              <div className="flex items-center justify-between">
                <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                  RS35265105031000095694
                </p>
                <button
                  onClick={() => handleCopyBankDetail('RS35265105031000095694', 'iban')}
                  className={`p-1 rounded transition-colors ${
                    copiedBankDetail === 'iban'
                      ? 'text-green-500'
                      : theme === 'Light'
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {copiedBankDetail === 'iban' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className={`p-3 rounded-xl mb-6 ${theme === 'Light' ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
            <p className={`text-sm ${theme === 'Light' ? 'text-blue-700' : 'text-blue-400'}`}>
              After transferring, your MKOIN will be credited within 1-2 business days.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-12 bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-xl disabled:opacity-50"
          >
            Confirm Transfer
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
