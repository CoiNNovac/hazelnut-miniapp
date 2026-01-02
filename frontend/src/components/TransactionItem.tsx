import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const isSent = transaction.type === 'sent';

  return (
    <div className="flex items-center gap-4 p-4 bg-dark-card rounded-2xl">
      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isSent ? 'bg-blue-accent/20' : 'bg-success/20'
        )}
      >
        <svg
          className={cn('w-5 h-5', isSent ? 'text-blue-accent' : 'text-success')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSent ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l5 5m0 0l5-5m-5 5V6" />
          )}
        </svg>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-white capitalize">{transaction.type}</span>
          <span className={cn('font-bold', isSent ? 'text-white' : 'text-success')}>
            {isSent ? '-' : '+'}{transaction.amount} {transaction.currency}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted truncate">
            {isSent ? `To ${transaction.to}` : `From ${transaction.from}`}
          </span>
          <span className="text-white/60">€{transaction.eurValue.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-white/40">{transaction.timestamp}</span>
          <span
            className={cn(
              'px-2 py-1 rounded-full',
              transaction.status === 'completed'
                ? 'bg-success/20 text-success'
                : transaction.status === 'pending'
                ? 'bg-primary/20 text-primary'
                : 'bg-error/20 text-error'
            )}
          >
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
