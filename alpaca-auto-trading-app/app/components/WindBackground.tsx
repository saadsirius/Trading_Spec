'use client';

import { motion } from 'framer-motion';

interface WindBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const WindBackground = ({ children, className = '' }: WindBackgroundProps) => {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Animated blobs for glass effect */}
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-20%] h-[50vh] w-[50vw] rounded-full bg-secondary/20 blur-3xl motion-safe:animate-shift" />
      <div aria-hidden className="pointer-events-none absolute -top-20 left-[-10%] h-[45vh] w-[45vw] rounded-full bg-primary/20 blur-3xl motion-safe:animate-float" />
      <div aria-hidden className="pointer-events-none absolute bottom-[-10%] right-[-15%] h-[40vh] w-[40vw] rounded-full bg-accent/15 blur-3xl motion-safe:animate-shift" />
      
      {/* Wind Particles */}
      <div className="wind-particle"></div>
      <div className="wind-particle"></div>
      <div className="wind-particle"></div>
      <div className="wind-particle"></div>
      <div className="wind-particle"></div>
      <div className="wind-particle"></div>
      
      {/* Floating Particles */}
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      
      {/* Wind Streaks */}
      <div className="wind-streak"></div>
      <div className="wind-streak"></div>
      <div className="wind-streak"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
