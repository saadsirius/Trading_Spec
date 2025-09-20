import { ReactNode } from "react";

export type AppMode = "paper" | "live";

export type NavItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  path: string;               // relative to the mode root, e.g., "/overview"
  kbd?: string;               // keyboard hint
  feature?: string;           // feature-flag key
  children?: NavItem[];       // sub-menu
};

export const NAV_SECTIONS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Trade",
    items: [
      { key: "overview", label: "Overview", path: "/overview", kbd: "G O" },
      { key: "trading",  label: "Trading",  path: "/trading",  kbd: "G T" },
      { key: "portfolio",label: "Portfolio",path: "/portfolio",kbd: "G P" },
      { key: "journal",  label: "Journal",  path: "/journal",  kbd: "G J" },
    ],
  },
  {
    heading: "Analysis",
    items: [
      { key: "screener", label: "Screener", path: "/discover", feature: "screener" },
      { key: "backtest", label: "Backtest", path: "/backtest", feature: "backtest" },
      { key: "aiSignals", label: "AI Signals", path: "/ai-signals", feature: "aiSignals" },
    ],
  },
  {
    heading: "System",
    items: [
      { key: "settings", label: "Settings", path: "/settings" },
    ],
  },
];

export const TOPBAR_ACTIONS = [
  { key: "search", aria: "Open search (⌘K)", kbd: "⌘K" },
  { key: "alerts", aria: "Open notifications" },
];
