// ─────────────────────────────────────────────────────────────────────────────
// File: components/navigation/Navigation.tsx
// Description: Responsive, accessible navigation bar for a paper-trading app.
// - Debounced search (no thrash on keystrokes)
// - Keyboard & a11y for dropdown
// - Mobile drawer menu
// - Scoped styles via CSS module (plus optional Tailwind utilities)
// - SSR safe (no window usage outside effects)
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navigation.module.css';
import { Button } from '../ui/Button';
import { Search as SearchIcon, Settings, Home, ArrowLeft, Bell, Menu, X } from 'lucide-react';

type SearchItem = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

interface NavigationProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showSettings?: boolean;
  showHome?: boolean;
  // Optional: provide a search function to replace mock data
  // Must return quickly (debounce already applied here)
  onSearch?: (query: string) => Promise<SearchItem[]>;
}

export function Navigation({
  title = 'Trading Dashboard',
  showBack = false, 
  showSearch = true, 
  showSettings = true,
  showHome = true,
  onSearch,
}: NavigationProps) {
  const router = useRouter();

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Mock fallback (kept sync/fast for dev)
  const mockSearch = async (query: string): Promise<SearchItem[]> => {
    const data: SearchItem[] = [
      { symbol: 'AAPL',  name: 'Apple Inc.',         price: 150.25, change:  2.35, changePercent:  1.58 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.',      price: 2750.00, change: -25.50, changePercent: -0.92 },
      { symbol: 'TSLA',  name: 'Tesla Inc.',         price: 245.80, change:   8.20, changePercent:  3.45 },
      { symbol: 'MSFT',  name: 'Microsoft Corp.',    price: 380.15, change:   5.25, changePercent:  1.40 },
      { symbol: 'AMZN',  name: 'Amazon.com Inc.',    price: 3200.75, change: -15.25, changePercent: -0.47 },
      { symbol: 'NVDA',  name: 'NVIDIA Corp.',       price: 905.60, change:  14.10, changePercent:  1.58 },
      { symbol: 'META',  name: 'Meta Platforms Inc.',price: 498.50, change:  -3.25, changePercent: -0.65 },
    ];
    const q = query.toLowerCase();
    return data.filter(d =>
      d.symbol.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
    );
  };

  // Debounced search effect
  useEffect(() => {
    if (!showSearch) return;
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!searchQuery || searchQuery.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      setHighlightIndex(-1);
      return;
    }

    setIsSearching(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const fn = onSearch ?? mockSearch;
        const rows = await fn(searchQuery.trim());
        setResults(rows);
        setShowResults(rows.length > 0);
        setHighlightIndex(rows.length ? 0 : -1);
      } catch (err) {
        console.error('[Navigation] search error:', err);
        setResults([]);
        setShowResults(false);
        setHighlightIndex(-1);
      } finally {
        setIsSearching(false);
      }
    }, 250); // 250ms feels snappy

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [searchQuery, onSearch, showSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showResults) return;

    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        listRef.current &&
        !listRef.current.contains(t) &&
        inputRef.current &&
        !inputRef.current.contains(t)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showResults]);

  const handleBack = () => router.back();

  const handleAssetSelect = (item: SearchItem) => {
    setSearchQuery('');
    setShowResults(false);
    setHighlightIndex(-1);
    // Example nav; replace with your detail route if needed
    router.push(`/symbol/${item.symbol}`);
  };

  // Keyboard support for listbox
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || !results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((h) => (h + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < results.length) {
        handleAssetSelect(results[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const paperBadge = useMemo(
    () => (
      <div className={styles.modeBadge} aria-label="Paper trading mode">
        <span className={styles.dot} />
        <span className={styles.modeText}>Paper Trading</span>
      </div>
    ),
    []
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden
        >
          <nav
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Menu</h2>
              <button
                className={styles.iconBtn}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className={styles.icon} />
                </button>
              </div>
            <ul className={styles.drawerLinks}>
              <li>
                <Link href="/" className={styles.drawerLink}>
                  <Home className={styles.icon} />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/trading" className={styles.drawerLink}>
                  <span className={styles.emoji}>📈</span>
                  <span>Trading</span>
                </Link>
              </li>
              <li>
                <Link href="/settings" className={styles.drawerLink}>
                  <Settings className={styles.icon} />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
              </nav>
        </div>
      )}

      {/* Header */}
      <header className={styles.header} data-testid="navigation-header">
        <div className={styles.container}>
          <div className={styles.left}>
            {/* Mobile Menu Button */}
              <button 
              className={`${styles.iconBtn} ${styles.onlyMobile}`}
                onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              >
              <Menu className={styles.icon} />
              </button>

            {/* Back */}
              {showBack && (
                <button 
                className={styles.iconBtn}
                  onClick={handleBack}
                aria-label="Go back"
                >
                <ArrowLeft className={styles.icon} />
                </button>
              )}

              {/* Title */}
            <h1 className={styles.title} aria-live="polite">
              {title}
            </h1>

            {/* Mode Badge */}
            {paperBadge}
            </div>

          {/* Center: Search */}
            {showSearch && (
            <div className={styles.searchWrap}>
              <div className={styles.searchBox} role="combobox" aria-expanded={showResults} aria-owns="nav-search-listbox">
                <SearchIcon className={styles.searchIcon} aria-hidden />
                  <input
                  ref={inputRef}
                  className={styles.searchInput}
                    type="text"
                  placeholder="Search assets (AAPL, NVDA, TSLA…) "
                    value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  onFocus={() => results.length && setShowResults(true)}
                  aria-autocomplete="list"
                  aria-controls="nav-search-listbox"
                  aria-activedescendant={
                    highlightIndex >= 0 ? `nav-item-${highlightIndex}` : undefined
                  }
                />
                {isSearching && <span className={styles.spinner} aria-hidden />}
                </div>

              {/* Results Dropdown */}
              {showResults && results.length > 0 && (
                <div
                  ref={listRef}
                  className={styles.dropdown}
                  id="nav-search-listbox"
                  role="listbox"
                >
                  {results.map((r, idx) => {
                    const positive = r.change >= 0;
                    return (
                      <button
                        key={`${r.symbol}-${idx}`}
                        id={`nav-item-${idx}`}
                        role="option"
                        aria-selected={highlightIndex === idx}
                        className={`${styles.resultItem} ${
                          highlightIndex === idx ? styles.resultItemActive : ''
                        }`}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onClick={() => handleAssetSelect(r)}
                      >
                        <div className={styles.resultLeft}>
                          <div className={styles.resultSymbol}>{r.symbol}</div>
                          <div className={styles.resultName}>{r.name}</div>
                          </div>
                        <div className={styles.resultRight}>
                          <div className={styles.resultPrice}>${r.price.toFixed(2)}</div>
                          <div className={`${styles.resultChange} ${positive ? styles.up : styles.down}`}>
                            {positive ? '+' : ''}
                            {r.change.toFixed(2)} ({positive ? '+' : ''}
                            {r.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  </div>
                )}
              </div>
            )}

          {/* Right: Actions */}
          <div className={styles.right}>
            <div className={styles.desktopLinks}>
                {showHome && (
                  <Link href="/">
                    <Button variant="primary" size="sm">
                    <Home className={styles.iconSm} />
                      Home
                    </Button>
                  </Link>
                )}
                <Link href="/trading">
                <Button variant="secondary" size="sm">📈 Trading</Button>
                </Link>
              </div>

              {/* Notifications */}
            <div className={styles.notifWrap}>
              <button className={styles.iconBtn} aria-label="Open notifications">
                <Bell className={styles.icon} />
                <span className={styles.badge} aria-label="3 unread notifications">3</span>
                </button>
              </div>

              {/* Settings */}
              {showSettings && (
                <Link href="/settings">
                  <Button variant="secondary" size="sm">
                  <Settings className={styles.iconSm} />
                    Settings
                  </Button>
                </Link>
              )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Navigation;