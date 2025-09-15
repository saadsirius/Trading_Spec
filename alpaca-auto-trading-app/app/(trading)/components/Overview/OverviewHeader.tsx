"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Wifi, WifiOff, Search } from 'lucide-react';
import { SearchBar } from './SearchBar';

interface OverviewHeaderProps {
  mode: 'paper' | 'live';
  asOf: string;
  isConnected: boolean;
  lastUpdate?: string;
}

export function OverviewHeader({ mode, asOf, isConnected, lastUpdate }: OverviewHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">Overview</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                mode === 'live' 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-secondary/20 text-secondary'
              }`}>
                {mode.toUpperCase()} TRADING
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-white/60">
              <Clock className="w-4 h-4" />
              <span>{formatDate(currentTime)} {formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-6">
            <SearchBar />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-support" />
                  <span className="text-sm text-support">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-danger-400" />
                  <span className="text-sm text-danger-400">Offline</span>
                </>
              )}
            </div>

            {/* Last Update */}
            {lastUpdate && (
              <div className="hidden lg:block text-xs text-white/40">
                Updated {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            )}

            {/* Data As Of */}
            <div className="text-xs text-white/40">
              As of {new Date(asOf).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
