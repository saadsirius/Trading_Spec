"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeMatch, currentMode, withMode } from "./route-helpers";
import { NAV_ICONS } from "./nav-icons";

interface SidebarLinksProps {
  item: {
    key: string;
    label: string;
    path: string;
    kbd?: string;
  };
}

export function SidebarLinks({ item }: SidebarLinksProps) {
  const pathname = usePathname();
  const mode = currentMode(pathname) ?? "paper";
  const href = withMode(mode, item.path);
  const isActive = activeMatch(pathname, href);
  const icon = NAV_ICONS[item.key as keyof typeof NAV_ICONS];

  return (
    <Link
      href={href}
      className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60
        ${isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"}`}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="opacity-90">{icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.kbd && (
        <kbd className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
          {item.kbd}
        </kbd>
      )}
    </Link>
  );
}
