import { motion, AnimatePresence } from 'motion/react';
import { Gift } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimRewardModal({ isOpen, onClose }: ClaimRewardModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`w-full max-w-sm rounded-3xl p-8 text-center ${
            theme === 'Light' ? 'bg-white' : 'bg-[#1A1B41]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15, stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F47621] to-[#d66a1e] flex items-center justify-center"
          >
            <Gift size={40} className="text-white" />
          </motion.div>

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
            Reward Claimed!
          </h2>

          {/* Message */}
          <p className={`text-sm mb-6 ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
            25 TON has been added to your wallet. Start trading now!
          </p>

          {/* Amount Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-2xl mb-6 ${
              theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
            }`}
          >
            <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
              Claimed Amount
            </p>
            <p className={`text-3xl font-bold ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
              25 TON
            </p>
          </motion.div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full h-12 bg-gradient-to-r from-[#F47621] to-[#d66a1e] text-white rounded-xl"
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
