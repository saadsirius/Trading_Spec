/**
 * File: src/components/StickyNavbar.tsx
 * Description: Sticky navigation bar with blur effect.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface StickyNavbarProps {
  children: React.ReactNode;
  className?: string;
}

export default function StickyNavbar({ children, className = '' }: StickyNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 100], [0, -100]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });

    return unsubscribe;
  }, [scrollY]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-transparent'
      } ${className}`}
      style={{
        y,
        opacity,
        backdropFilter: `blur(${isScrolled ? 12 : 0}px)`,
      }}
      animate={{
        y: isScrolled ? 0 : 0,
        opacity: isScrolled ? 0.95 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.nav>
  );
}