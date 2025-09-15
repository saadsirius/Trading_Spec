import {
  LayoutDashboard, LineChart, BookOpen, Wallet, Settings, Bell, Search
} from "lucide-react";

export const NAV_ICONS = {
  overview: <LayoutDashboard className="w-4 h-4" />,
  trading: <LineChart className="w-4 h-4" />,
  portfolio: <Wallet className="w-4 h-4" />,
  journal: <BookOpen className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  screener: <Search className="w-4 h-4" />,
  backtest: <LineChart className="w-4 h-4" />,
  aiSignals: <Bell className="w-4 h-4" />,
  search: <Search className="w-4 h-4" />,
  alerts: <Bell className="w-4 h-4" />,
} as const;
