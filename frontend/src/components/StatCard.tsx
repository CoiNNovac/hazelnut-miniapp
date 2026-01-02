import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'success';
}

export default function StatCard({ title, value, subtitle, className, variant = 'default' }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-dark-card rounded-2xl p-6',
        variant === 'primary' && 'bg-primary/10 border border-primary/20',
        variant === 'success' && 'bg-success/10 border border-success/20',
        className
      )}
    >
      <h3 className="text-sm text-text-muted mb-2">{title}</h3>
      <p
        className={cn(
          'text-2xl font-bold mb-1',
          variant === 'primary' ? 'text-primary' : variant === 'success' ? 'text-success' : 'text-white'
        )}
      >
        {value}
      </p>
      {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
    </div>
  );
}
