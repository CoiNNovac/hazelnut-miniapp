import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ScrollIndicatorProps {
  children: ReactNode;
  className?: string;
  showIndicator?: boolean;
  style?: React.CSSProperties;
  isModal?: boolean;
}

export function ScrollIndicator({ children, className = '', showIndicator = true, style, isModal = false }: ScrollIndicatorProps) {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current || !showIndicator) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isScrollable = scrollHeight > clientHeight;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

      setShowScrollHint(isScrollable && !isAtBottom);
    };

    // Initial check with a delay to ensure content is rendered
    const timer = setTimeout(checkScroll, 100);

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      clearTimeout(timer);
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [showIndicator, children]);

  return (
    <div className="relative h-full">
      <div ref={scrollRef} className={`h-full overflow-y-auto ${className}`} style={style}>
        {children}
      </div>

      {/* Bottom Blur and Chevron Indicator */}
      <AnimatePresence>
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={isModal ? "absolute bottom-0 left-0 right-0 pointer-events-none z-30" : "fixed bottom-20 left-0 right-0 pointer-events-none z-30"}
          >
            <div className={isModal ? "" : "max-w-[430px] mx-auto"}>
              {/* Gradient Blur */}
              <div 
                className={`h-32 ${
                  theme === 'Light'
                    ? isModal 
                      ? 'bg-gradient-to-t from-white via-white/80 to-transparent'
                      : 'bg-gradient-to-t from-gray-100 via-gray-50/80 to-transparent'
                    : isModal
                      ? 'bg-gradient-to-t from-[#1A1B41] via-[#1A1B41]/80 to-transparent'
                      : 'bg-gradient-to-t from-[#0f1028] via-[#0f1028]/80 to-transparent'
                }`}
              />
              
              {/* Chevron Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className={`p-2 rounded-full backdrop-blur-md ${
                    theme === 'Light'
                      ? 'bg-white/60 border border-gray-300'
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <ChevronDown 
                    size={20} 
                    className={theme === 'Light' ? 'text-gray-700' : 'text-white/80'} 
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}