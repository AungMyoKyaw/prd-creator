import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  message = 'Loading...',
  size = 'md',
  variant = 'spinner',
  className
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerSizes = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-indigo-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-gradient-to-r from-indigo-500 to-purple-500',
              sizes[size]
            )}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          >
            <Sparkles className={cn('text-white', sizes[size])} />
          </motion.div>
        );

      default:
        return (
          <Loader2
            className={cn('animate-spin text-indigo-400', sizes[size])}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center glass rounded-lg border border-slate-700 animate-fade-in',
        containerSizes[size],
        className
      )}
    >
      <div className="mb-4">{renderLoader()}</div>

      <motion.p
        className={cn(
          'font-medium text-slate-300 text-center',
          textSizes[size]
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>

      {size !== 'sm' && (
        <motion.p
          className="text-xs text-slate-500 text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          The AI is thinking. This may take a moment.
        </motion.p>
      )}
    </div>
  );
};

export default Loader;
