'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Toasts } from '@/lib/toast/ToastService';
import { useUI } from '@/state/uiStore';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function AnimatedNavLink({ href, children, className = '' }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  
  return (
    <Link href={href} className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${className}`}>
      <motion.span
        className="relative z-10"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.span>
      
      {/* Animated underline */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            layoutId="navbar-underline"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>
      
      {/* Hover background pill */}
      <motion.div
        className="absolute inset-0 bg-gray-800/50 rounded-lg"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </Link>
  );
}

export default function AnimatedNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setPaletteOpen } = useUI();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sym, setSym] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const { scrollY } = useScroll();
  const navbarOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const navbarBlur = useTransform(scrollY, [0, 100], [0, 10]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const off = onKey(document, combos.slash, () => inputRef.current?.focus());
    return () => off();
  }, []);

  function go() {
    const s = (sym || '').trim().toUpperCase();
    if (!s) return;
    Toasts.show(`Ouverture ${s}`, 'Chargement du graphe…', 1500);
    router.push(`/symbol/${encodeURIComponent(s)}`);
    setSym('');
  }

  // Keyboard shortcuts
  useEffect(() => {
    let chord = '';
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') { 
        chord = 'g'; 
        setTimeout(() => chord='', 700); 
        return; 
      }
      if (chord === 'g') {
        e.preventDefault();
        const k = e.key.toLowerCase();
        if (k === 'h') router.push('/');
        if (k === 'r') router.push('/search');
        if (k === 'a') router.push('/search-animated');
        if (k === 's') router.push('/screener');
        if (k === 'c') router.push('/symbol');
        if (k === 'p') router.push('/portfolio');
        if (k === 'd') router.push('/advisor/dashboard');
        if (k === 'l') router.push('/alerts/personal');
        if (k === 'i') router.push('/history');
        if (k === 'n') router.push('/animations-demo');
        if (k === 'm') router.push('/lab/middleware');
        if (k === 'f') router.push('/lab/performance');
        if (k === 'y') router.push('/lab/ai-systems');
        if (k === 'o') router.push('/lab/roi-overview');
        chord = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const navItems = [
    { href: '/', label: 'Accueil', shortcut: 'H' },
    { href: '/search', label: 'Recherche', shortcut: 'R' },
    { href: '/search-animated', label: 'Recherche Animée', shortcut: 'A' },
    { href: '/screener', label: 'Screener', shortcut: 'S' },
    { href: '/symbol', label: 'Charts', shortcut: 'C' },
    { href: '/portfolio', label: 'Portfolio', shortcut: 'P' },
    { href: '/advisor/dashboard', label: 'Mon Conseiller', shortcut: 'D' },
    { href: '/alerts/personal', label: 'Mes Alertes', shortcut: 'L' },
    { href: '/history', label: 'Historique', shortcut: 'I' },
    { href: '/animations-demo', label: 'Animations', shortcut: 'N' },
    { href: '/lab/middleware', label: 'Middleware', shortcut: 'M' },
    { href: '/lab/performance', label: 'Performance', shortcut: 'F' },
    { href: '/lab/ai-systems', label: 'AI Systems', shortcut: 'Y' },
    { href: '/lab/roi-overview', label: 'ROI Overview', shortcut: 'O' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800' 
          : 'bg-gray-900/90 backdrop-blur-sm'
      }`}
      style={{ 
        opacity: navbarOpacity,
        backdropFilter: `blur(${navbarBlur}px)`
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/" className="text-xl font-bold text-white">
              Alpaca IQ
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <AnimatedNavLink key={item.href} href={item.href}>
                {item.label}
              </AnimatedNavLink>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher (/)"
                value={sym}
                onChange={(e) => setSym(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && go()}
                className="w-32 px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <motion.button
                onClick={go}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>
            </motion.div>

            {/* Alerts Button */}
            <motion.button
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5L9 15H4l5-5V4l-5 5H9l-4.5 4.5z" />
              </svg>
              <motion.span
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                3
              </motion.span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={() => setPaletteOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </motion.button>

            {/* Settings */}
            <motion.button
              className="p-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: showMobileMenu ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </motion.svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="lg:hidden border-t border-gray-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
