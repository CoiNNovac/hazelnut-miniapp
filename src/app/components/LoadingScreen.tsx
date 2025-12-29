import { motion } from 'motion/react';
import { useEffect } from 'react';
import logo from 'figma:asset/07d53540cb4d65ebf202579f8142b08e6b848c38.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* Logo with spinning circle animation */}
      <div className="relative">
        {/* Spinning loading circle */}
        <motion.div
          className="absolute inset-0 w-64 h-64 -m-16"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#F47621"
              strokeWidth="3"
              strokeDasharray="70 200"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="relative z-10"
        >
          <img
            src={logo}
            alt="Logo"
            className="w-32 h-32"
          />
        </motion.div>
      </div>
    </div>
  );
}