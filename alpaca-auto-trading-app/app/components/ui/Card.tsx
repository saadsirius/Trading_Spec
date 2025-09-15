'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: React.ReactNode;
}

export const Card = ({
  hover = false,
  className,
  children,
  onClick,
  ...props
}: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm p-6',
        hover && 'cursor-pointer transition-shadow duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
