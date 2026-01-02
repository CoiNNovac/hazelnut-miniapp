import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CountdownTimerProps {
  endTime: number;
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <span className={`font-mono text-sm ${
      theme === 'Light' ? 'text-gray-900' : 'text-white/90'
    }`}>
      {formatNumber(timeLeft.days)}D : {formatNumber(timeLeft.hours)}H : {formatNumber(timeLeft.minutes)}M : {formatNumber(timeLeft.seconds)}S
    </span>
  );
}