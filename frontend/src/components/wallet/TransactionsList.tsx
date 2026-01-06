import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, ShoppingCart, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export interface Transaction {
  id: number;
  type: 'send' | 'receive' | 'buy';
  token: string;
  amount: number;
  eurValue: number;
  date: string;
  status: 'completed' | 'pending';
  category: 'bank' | 'onchain';
}

interface TransactionsListProps {
  transactions: Transaction[];
  showAll: boolean;
  onTransactionClick: (transaction: Transaction) => void;
  onViewAllClick: () => void;
}

export function TransactionsList({
  transactions,
  showAll,
  onTransactionClick,
  onViewAllClick,
}: TransactionsListProps) {
  const { theme } = useTheme();

  const displayTransactions = showAll ? transactions : transactions.slice(0, 3);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight size={20} className="text-red-500" />;
      case 'receive':
        return <ArrowDownLeft size={20} className="text-green-500" />;
      case 'buy':
        return <ShoppingCart size={20} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="p-4 space-y-3">
      {displayTransactions.map((transaction, index) => (
        <motion.button
          key={transaction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onTransactionClick(transaction)}
          className={`w-full rounded-2xl p-4 flex items-center justify-between ${
            theme === 'Light' ? 'bg-gray-50' : 'bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'Light' ? 'bg-gray-200' : 'bg-white/10'
              }`}
            >
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="text-left">
              <p className={`font-medium ${theme === 'Light' ? 'text-gray-900' : 'text-white'}`}>
                {transaction.type === 'send' ? 'Sent' : transaction.type === 'receive' ? 'Received' : 'Bought'}{' '}
                {transaction.token}
              </p>
              <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                {formatDate(transaction.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p
                className={`font-medium ${
                  transaction.type === 'receive'
                    ? 'text-green-500'
                    : transaction.type === 'send'
                    ? 'text-red-500'
                    : theme === 'Light'
                    ? 'text-gray-900'
                    : 'text-white'
                }`}
              >
                {transaction.type === 'receive' ? '+' : transaction.type === 'send' ? '-' : ''}
                {transaction.amount} {transaction.token}
              </p>
              <p className={`text-sm ${theme === 'Light' ? 'text-gray-600' : 'text-white/60'}`}>
                €{transaction.eurValue.toFixed(2)}
              </p>
            </div>
            <div className={theme === 'Light' ? 'text-gray-400' : 'text-white/40'}>
              <ChevronRight size={20} />
            </div>
          </div>
        </motion.button>
      ))}

      {!showAll && transactions.length > 3 && (
        <button
          onClick={onViewAllClick}
          className={`w-full py-3 rounded-xl ${
            theme === 'Light'
              ? 'text-gray-700 hover:bg-gray-50'
              : 'text-white/80 hover:bg-white/5'
          }`}
        >
          View All Transactions
        </button>
      )}
    </div>
  );
}
