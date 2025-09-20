/**
 * File: src/components/optimized/OptimizedNavbar.tsx
 * Description: Optimized navbar with memoization and performance improvements.
 */
'use client';

import React, { memo, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface OptimizedNavbarProps {
  items: NavItem[];
  className?: string;
  onItemClick?: (item: NavItem) => void;
}

const NavItem = memo(({ item, onClick }: { item: NavItem; onClick: (item: NavItem) => void }) => {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Link
        href={item.href}
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    </motion.div>
  );
});

NavItem.displayName = 'NavItem';

const MobileMenu = memo(({ items, onItemClick, isOpen }: {
  items: NavItem[];
  onItemClick: (item: NavItem) => void;
  isOpen: boolean;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-full left-0 right-0 bg-gray-900 border-t border-gray-700"
        >
          <div className="p-4 space-y-2">
            {items.map((item) => (
              <NavItem key={item.href} item={item} onClick={onItemClick} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

MobileMenu.displayName = 'MobileMenu';

export default function OptimizedNavbar({ items, className = '', onItemClick }: OptimizedNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleItemClick = useCallback((item: NavItem) => {
    onItemClick?.(item);
    setIsMobileMenuOpen(false);
  }, [onItemClick]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const memoizedItems = useMemo(() => items, [items]);

  return (
    <nav className={`bg-gray-900 border-b border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Link href="/" className="text-xl font-bold text-white">
              Trading App
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {memoizedItems.map((item) => (
              <NavItem key={item.href} item={item} onClick={handleItemClick} />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          items={memoizedItems}
          onItemClick={handleItemClick}
          isOpen={isMobileMenuOpen}
        />
      </div>
    </nav>
  );
}

// Export for testing
export { OptimizedNavbar };