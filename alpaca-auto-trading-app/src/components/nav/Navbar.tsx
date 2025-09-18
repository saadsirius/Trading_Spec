"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOPBAR_ACTIONS } from "./nav.config";
import { NAV_ICONS } from "./nav-icons";
import ModeSwitcher from "./ModeSwitcher";

export default function Navbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-3 md:px-4">
        <button 
          onClick={onOpenMobile} 
          className="md:hidden rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/60" 
          aria-label="Open navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        
        <Link href="/" className="hidden md:inline-flex items-center gap-2 font-semibold text-white hover:text-white/80 transition-colors">
          <span className="h-3 w-3 rounded-full bg-secondary" />
          <span>Alpaca Trader</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ModeSwitcher />
          {TOPBAR_ACTIONS.map(a => (
            <button 
              key={a.key} 
              className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/60 text-white/80 hover:text-white transition-colors" 
              aria-label={a.aria} 
              title={a.kbd ?? ""}
            >
              {NAV_ICONS[a.key as keyof typeof NAV_ICONS]}
            </button>
          ))}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  return (
    <div className="relative">
      <button 
        className="rounded-full bg-white/10 p-1.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-colors" 
        aria-haspopup="menu" 
        aria-expanded="false"
        aria-label="User menu"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-xs font-semibold text-white">
          U
        </div>
      </button>
      {/* Dropdown menu would go here */}
    </div>
  );
}
