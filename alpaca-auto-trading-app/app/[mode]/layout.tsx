"use client";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Sidebar from "@/components/nav/Sidebar";
import Navbar from "@/components/nav/Navbar";
import MobileDrawer from "@/components/nav/MobileDrawer";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import RouteMemory from "@/components/nav/RouteMemory";

interface ModeLayoutProps {
  children: React.ReactNode;
  params: {
    mode: string;
  };
}

export default function ModeLayout({ children, params }: ModeLayoutProps) {
  const [open, setOpen] = useState(false);
  
  // Handle case where params might be undefined during static generation
  if (!params) {
    return <div>Loading...</div>;
  }
  
  const { mode } = params;
  
  // Validate mode parameter
  if (mode !== 'paper' && mode !== 'live') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <RouteMemory />
      
      {/* Live Trading Banner */}
      {mode === 'live' && (
        <div className="bg-gradient-to-r from-danger-500/20 to-accent/20 border-b border-danger-500/30">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-danger-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-danger-400">
                ⚠️ LIVE TRADING MODE - REAL MONEY AT RISK
              </span>
              <div className="w-2 h-2 bg-danger-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
      
      <Navbar onOpenMobile={() => setOpen(true)} />
      <div className="mx-auto max-w-7xl px-2 md:px-4">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-3 md:p-6">
            <Breadcrumbs />
            <div className="mt-4">{children}</div>
          </main>
        </div>
      </div>
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
