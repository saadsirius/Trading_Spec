"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav.config";
import { activeMatch, currentMode, withMode } from "./route-helpers";
import { NAV_ICONS } from "./nav-icons";
import { X } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const mode = currentMode(pathname) ?? "paper";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
        aria-hidden="true" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 bg-ink border-r border-white/10 p-3 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-white/70 font-medium">
            {mode.toUpperCase()} MODE
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/60 text-white/60 hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="overflow-y-auto">
          {NAV_SECTIONS.map(sec => (
            <div key={sec.heading} className="mt-4">
              <div className="px-2 text-xs uppercase tracking-wide text-white/50 font-medium">
                {sec.heading}
              </div>
              <ul className="mt-2 space-y-1">
                {sec.items.map(item => {
                  const href = withMode(mode, item.path);
                  const isActive = activeMatch(pathname, href);
                  return (
                    <li key={item.key}>
                      <Link 
                        href={href} 
                        onClick={onClose}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60
                          ${isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span>{NAV_ICONS[item.key as keyof typeof NAV_ICONS]}</span>
                        <span>{item.label}</span>
                        {item.kbd && (
                          <kbd className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded ml-auto">
                            {item.kbd}
                          </kbd>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
