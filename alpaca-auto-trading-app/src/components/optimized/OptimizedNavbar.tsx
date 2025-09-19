import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';
import { useUIStore } from '@/state/uiStore';

// Memoized navigation item component
const NavItem = memo(({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) => (
  <motion.a
    href={href}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.a>
));

NavItem.displayName = 'NavItem';

// Memoized logo component
const Logo = memo(() => (
  <motion.div
    className="flex items-center"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <img
      src="/logo.webp"
      alt="Alpaca Trading"
      width={32}
      height={32}
      loading="eager"
      className="rounded-lg"
    />
    <span className="ml-2 text-xl font-bold text-white">Alpaca Trading</span>
  </motion.div>
));

Logo.displayName = 'Logo';

// Debounced scroll handler
const debouncedScrollHandler = debounce((callback: () => void) => {
  callback();
}, 100);

// Main optimized navbar component
const OptimizedNavbar = memo(() => {
  const { isNavbarVisible, isNavbarSticky, toggleNavbar, setNavbarSticky } = useUIStore();

  // Memoized navigation items
  const navItems = useMemo(() => [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/search', label: 'Search' },
    { href: '/screener', label: 'Screener' },
    { href: '/alerts', label: 'Alerts' },
  ], []);

  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    debouncedScrollHandler(() => {
      const scrollY = window.scrollY;
      setNavbarSticky(scrollY > 100);
    });
  }, [setNavbarSticky]);

  // Memoized toggle handler
  const handleToggle = useCallback(() => {
    toggleNavbar();
  }, [toggleNavbar]);

  // Memoized navbar classes
  const navbarClasses = useMemo(() => {
    const baseClasses = "fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800";
    const stickyClasses = isNavbarSticky ? "shadow-lg" : "";
    const visibleClasses = isNavbarVisible ? "translate-y-0" : "-translate-y-full";
    
    return `${baseClasses} ${stickyClasses} ${visibleClasses}`;
  }, [isNavbarVisible, isNavbarSticky]);

  return (
    <motion.nav
      className={navbarClasses}
      initial={{ y: -100 }}
      animate={{ y: isNavbarVisible ? 0 : -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  isActive={false} // You can implement active state logic here
                >
                  {item.label}
                </NavItem>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={handleToggle}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        className="md:hidden"
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isNavbarVisible ? 1 : 0, 
          height: isNavbarVisible ? "auto" : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              isActive={false}
            >
              {item.label}
            </NavItem>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
});

OptimizedNavbar.displayName = 'OptimizedNavbar';

export default OptimizedNavbar;
