import mkoinIcon from 'figma:asset/31167c7da5a27725a6c5d940dd5e6a0e5a54b1d9.png';

interface MKOINLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MKOINLogo({ size = 'md', className = '' }: MKOINLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`relative ${className}`}>
      <img 
        src={mkoinIcon} 
        alt="MKOIN" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}
