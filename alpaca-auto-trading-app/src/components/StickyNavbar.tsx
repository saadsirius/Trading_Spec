'use client';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface StickyNavbarProps {
  children: React.ReactNode;
}

export default function StickyNavbar({ children }: StickyNavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();
  
  const navbarY = useTransform(scrollY, [0, 100], [0, -100]);
  const navbarOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);
  const navbarBlur = useTransform(scrollY, [0, 100], [0, 20]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY;
    const current = latest;
    
    if (current < previous) {
      // Scrolling up
      setIsVisible(true);
    } else if (current > previous && current > 100) {
      // Scrolling down
      setIsVisible(false);
    }
    
    setLastScrollY(current);
  });

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800"
      style={{
        y: navbarY,
        opacity: navbarOpacity,
        backdropFilter: `blur(${navbarBlur}px)`
      }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.nav>
  );
}
