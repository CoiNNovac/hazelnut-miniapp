import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  userAddress: string;
}

interface SellMKOINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  bankDetails: BankDetails;
  onBankDetailsChange: (details: BankDetails) => void;
  saveBankDetails: boolean;
  onSaveBankDetailsChange: (save: boolean) => void;
  savedBankDetails?: BankDetails | null;
}

export function SellMKOINModal({
  isOpen,
  onClose,
  onSubmit,
  amount,
  onAmountChange,
  bankDetails,
  onBankDetailsChange,
  saveBankDetails,
  onSaveBankDetailsChange,
  savedBankDetails,
}: SellMKOINModalProps) {
  const { theme } = useTheme();

  const handleUseSavedDetails = () => {
    if (savedBankDetails) {
      onBankDetailsChange(savedBankDetails);
    }
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
              Sell MKOIN
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
              Amount (MKOIN)
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
              You will receive: €{amount || '0'}
            </p>
          </div>

          {/* Saved Bank Details */}
          {savedBankDetails && (
            <div className="mb-4">
              <button
                onClick={handleUseSavedDetails}
                className={`w-full p-3 rounded-xl text-left ${
                  theme === 'Light'
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                }`}
              >
                <p className="text-sm font-medium">Use saved bank details</p>
                <p className="text-xs mt-1">{savedBankDetails.accountName} - {savedBankDetails.accountNumber}</p>
              </button>
            </div>
          )}

          {/* Bank Details Form */}
          <div className="mb-6 space-y-4">
            <p className={`text-sm font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              Your Bank Details
            </p>

            {/* Bank Name */}
            <div>
              <label className={`text-xs block mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                Bank Name
              </label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => onBankDetailsChange({ ...bankDetails, bankName: e.target.value })}
                placeholder="Enter bank name"
                className={`w-full px-4 py-3 rounded-xl ${
                  theme === 'Light'
                    ? 'bg-gray-50 text-gray-900 border border-gray-200'
                    : 'bg-white/5 text-white border border-white/10'
                }`}
              />
            </div>

            {/* Account Name */}
            <div>
              <label className={`text-xs block mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                Account Name
              </label>
              <input
                type="text"
                value={bankDetails.accountName}
                onChange={(e) => onBankDetailsChange({ ...bankDetails, accountName: e.target.value })}
                placeholder="Enter account name"
                className={`w-full px-4 py-3 rounded-xl ${
                  theme === 'Light'
                    ? 'bg-gray-50 text-gray-900 border border-gray-200'
                    : 'bg-white/5 text-white border border-white/10'
                }`}
              />
            </div>

            {/* Account Number */}
            <div>
              <label className={`text-xs block mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                Account Number
              </label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => onBankDetailsChange({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="Enter account number"
                className={`w-full px-4 py-3 rounded-xl ${
                  theme === 'Light'
                    ? 'bg-gray-50 text-gray-900 border border-gray-200'
                    : 'bg-white/5 text-white border border-white/10'
                }`}
              />
            </div>

            {/* User Address */}
            <div>
              <label className={`text-xs block mb-1 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                Your Address
              </label>
              <input
                type="text"
                value={bankDetails.userAddress}
                onChange={(e) => onBankDetailsChange({ ...bankDetails, userAddress: e.target.value })}
                placeholder="Enter your address"
                className={`w-full px-4 py-3 rounded-xl ${
                  theme === 'Light'
                    ? 'bg-gray-50 text-gray-900 border border-gray-200'
                    : 'bg-white/5 text-white border border-white/10'
                }`}
              />
            </div>

            {/* Save Bank Details Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveBankDetails}
                onChange={(e) => onSaveBankDetailsChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className={`text-sm ${theme === 'Light' ? 'text-gray-700' : 'text-white/80'}`}>
                Save bank details for future transactions
              </span>
            </label>
          </div>

          {/* Info */}
          <div className={`p-3 rounded-xl mb-6 ${theme === 'Light' ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
            <p className={`text-sm ${theme === 'Light' ? 'text-blue-700' : 'text-blue-400'}`}>
              Funds will be transferred to your account within 1-2 business days.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              !bankDetails.bankName ||
              !bankDetails.accountName ||
              !bankDetails.accountNumber ||
              !bankDetails.userAddress
            }
            className="w-full h-12 bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-xl disabled:opacity-50"
          >
            Confirm Sale
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
