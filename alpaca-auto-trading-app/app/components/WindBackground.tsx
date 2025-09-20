'use client';

/**
 * File: components/fx/WindBackground.tsx
 * Purpose: High-quality animated "wind + glass blobs" background with:
 *  - One self-contained block (component + CSS via styled-jsx)
 *  - Perf: GPU transforms, low paint, motion-safe, reduced-motion fallback
 *  - Customizable density, speed, and visual variants via props/data-attrs
 *  - A11y: purely decorative, aria-hidden; content stays in a high z-index layer
 */

import React from 'react';
import { motion } from 'framer-motion';

type Variant = 'subtle' | 'medium' | 'vivid';

interface WindBackgroundProps {
  children: React.ReactNode;
  className?: string;
  /** overall visual intensity */
  variant?: Variant;
  /** particle count (wind + float combined baseline); default 12 */
  density?: number;
  /** animation speed multiplier (1 = default) */
  speed?: number;
  /** show wind streaks */
  showStreaks?: boolean;
  /** show floating dust particles */
  showParticles?: boolean;
  /** show large glassy color blobs */
  showBlobs?: boolean;
}

export const WindBackground: React.FC<WindBackgroundProps> = ({
  children,
  className = '',
  variant = 'medium',
  density = 12,
  speed = 1,
  showStreaks = true,
  showParticles = true,
  showBlobs = true,
}) => {
  // Clamp + sanitize
  const d = Math.max(0, Math.min(density, 40));
  const s = Math.max(0.25, Math.min(speed, 3));

  // We render a small, controllable number of elements and let CSS do the variety via nth-child.
  const windCount = showParticles ? Math.ceil(d * 0.5) : 0;
  const floatCount = showParticles ? Math.ceil(d * 0.5) : 0;
  const streakCount = showStreaks ? Math.max(3, Math.min(8, Math.ceil(d * 0.2))) : 0;

  return (
    <div
      className={`min-h-screen relative overflow-clip ${className}`}
      data-variant={variant}
      style={
        {
          // speed passed to CSS as a variable (affects keyframe durations)
          ['--wb-speed' as any]: String(s),
        } as React.CSSProperties
      }
      aria-label="decorative background container"
    >
      {/* ── Decorative layers (hidden from a11y) ───────────────────────────── */}
      <div aria-hidden className="wb-layer wb-blobs pointer-events-none">
        {showBlobs && (
          <>
            <div className="wb-blob wb-blob-a" />
            <div className="wb-blob wb-blob-b" />
            <div className="wb-blob wb-blob-c" />
          </>
        )}
      </div>

      <div aria-hidden className="wb-layer wb-wind pointer-events-none">
        {Array.from({ length: windCount }).map((_, i) => (
          <div key={`wind-${i}`} className="wb-wind-particle" />
        ))}
      </div>

      <div aria-hidden className="wb-layer wb-float pointer-events-none">
        {Array.from({ length: floatCount }).map((_, i) => (
          <div key={`float-${i}`} className="wb-floating" />
        ))}
      </div>

      {showStreaks && (
        <div aria-hidden className="wb-layer wb-streaks pointer-events-none">
          {Array.from({ length: streakCount }).map((_, i) => (
            <div key={`streak-${i}`} className="wb-streak" />
          ))}
        </div>
      )}

      {/* ── Foreground content ─────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
      >
        {children}
      </motion.div>

      {/* ── Scoped styles (styled-jsx) ─────────────────────────────────────── */}
      <style jsx global>{`
        /* Root palette hooks — map to your Tailwind theme via CSS variables if available */
        :root {
          --wb-primary: var(--tw-color-primary, #60a5fa);
          --wb-secondary: var(--tw-color-secondary, #a78bfa);
          --wb-accent: var(--tw-color-accent, #22d3ee);
          --wb-support: var(--tw-color-support, #34d399);
        }

        /* Each container can tweak intensity via data-variant */
        [data-variant='subtle'] {
          --wb-blob-opacity: 0.15;
          --wb-streak-opacity: 0.15;
          --wb-dust-opacity: 0.15;
          --wb-blur: 48px;
        }
        [data-variant='medium'] {
          --wb-blob-opacity: 0.22;
          --wb-streak-opacity: 0.22;
          --wb-dust-opacity: 0.22;
          --wb-blur: 64px;
        }
        [data-variant='vivid'] {
          --wb-blob-opacity: 0.3;
          --wb-streak-opacity: 0.3;
          --wb-dust-opacity: 0.28;
          --wb-blur: 80px;
        }

        .wb-layer {
          position: absolute;
          inset: 0;
        }

        /* ── Glassy blobs (large colored gradients) ─────────────────────── */
        .wb-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(var(--wb-blur));
          opacity: var(--wb-blob-opacity);
          will-change: transform, opacity;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          pointer-events: none;
        }
        .wb-blob-a {
          top: -20vh;
          right: -15vw;
          width: 55vw;
          height: 55vh;
          background: radial-gradient(60% 60% at 50% 50%, var(--wb-secondary) 0%, transparent 70%);
          animation-name: wb-shift-a;
          animation-duration: calc(36s / var(--wb-speed, 1));
        }
        .wb-blob-b {
          top: -10vh;
          left: -10vw;
          width: 48vw;
          height: 48vh;
          background: radial-gradient(60% 60% at 50% 50%, var(--wb-primary) 0%, transparent 70%);
          animation-name: wb-float-b;
          animation-duration: calc(42s / var(--wb-speed, 1));
        }
        .wb-blob-c {
          bottom: -10vh;
          right: -8vw;
          width: 44vw;
          height: 44vh;
          background: radial-gradient(60% 60% at 50% 50%, var(--wb-accent) 0%, transparent 70%);
          animation-name: wb-shift-c;
          animation-duration: calc(50s / var(--wb-speed, 1));
        }

        @keyframes wb-shift-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-2vw, 2vh, 0) scale(1.05); }
        }
        @keyframes wb-float-b {
          0%, 100% { transform: translate3d(0, 0, 0) }
          50% { transform: translate3d(2vw, -1.5vh, 0) }
        }
        @keyframes wb-shift-c {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-1vw, 1vh, 0) scale(0.98); }
        }

        /* ── Wind particles (small drifting dots) ───────────────────────── */
        .wb-wind-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, var(--wb-dust-opacity));
          filter: blur(1px);
          top: 0;
          left: 0;
          transform: translate3d(-10vw, 0, 0);
          animation-name: wb-wind-drift;
          animation-duration: calc(18s / var(--wb-speed, 1));
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          will-change: transform, opacity;
        }
        /* Stagger + distribute via nth-child */
        .wb-wind-particle:nth-child(odd)   { animation-duration: calc(16s / var(--wb-speed, 1)); opacity: 0.6; }
        .wb-wind-particle:nth-child(3n+1) { animation-duration: calc(22s / var(--wb-speed, 1)); opacity: 0.35; }
        .wb-wind-particle:nth-child(4n+2) { animation-duration: calc(26s / var(--wb-speed, 1)); opacity: 0.25; }
        .wb-wind-particle::before {
          content: '';
          position: absolute;
          inset: -20px 0 0 -60px;
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
          transform: translateZ(0);
        }
        @keyframes wb-wind-drift {
          0%   { transform: translate3d(-10vw, 10vh, 0); }
          100% { transform: translate3d(110vw, -10vh, 0); }
        }

        /* ── Floating dust (soft up-down) ───────────────────────────────── */
        .wb-floating {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(255,255,255, var(--wb-dust-opacity));
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(1.5px);
          will-change: transform, opacity;
          animation: wb-float-y calc(12s / var(--wb-speed, 1)) ease-in-out infinite alternate;
        }
        .wb-floating:nth-child(odd)   { animation-duration: calc(10s / var(--wb-speed, 1)); opacity: 0.4; }
        .wb-floating:nth-child(3n+1)  { animation-duration: calc(14s / var(--wb-speed, 1)); opacity: 0.25; }
        .wb-floating:nth-child(4n+2)  { animation-duration: calc(16s / var(--wb-speed, 1)); opacity: 0.2; }
        @keyframes wb-float-y {
          0%   { transform: translate(-60%, -48%) }
          100% { transform: translate(-40%, -52%) }
        }

        /* ── Wind streaks (fast lines crossing) ─────────────────────────── */
        .wb-streak {
          position: absolute;
          top: 0;
          left: -20vw;
          width: 22vw;
          height: 2px;
          border-radius: 9999px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255, var(--wb-streak-opacity)));
          filter: blur(0.5px);
          transform: translate3d(0, 0, 0);
          will-change: transform, opacity;
          animation: wb-streak-move calc(6s / var(--wb-speed, 1)) linear infinite;
        }
        .wb-streak:nth-child(odd)  { top: 25%; }
        .wb-streak:nth-child(2)    { top: 55%; animation-duration: calc(7.5s / var(--wb-speed, 1)); }
        .wb-streak:nth-child(3)    { top: 80%; animation-duration: calc(5.5s / var(--wb-speed, 1)); }
        @keyframes wb-streak-move {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translate3d(130vw, 0, 0); opacity: 0; }
        }

        /* Distribute positions without JS random:
           we offset particles by viewport-based transforms via nth-child */
        .wb-wind .wb-wind-particle:nth-child(1)  { top: 15vh; }
        .wb-wind .wb-wind-particle:nth-child(2)  { top: 35vh; }
        .wb-wind .wb-wind-particle:nth-child(3)  { top: 60vh; }
        .wb-wind .wb-wind-particle:nth-child(4)  { top: 22vh; }
        .wb-wind .wb-wind-particle:nth-child(5)  { top: 48vh; }
        .wb-wind .wb-wind-particle:nth-child(6)  { top: 70vh; }
        .wb-wind .wb-wind-particle:nth-child(7)  { top: 10vh; }
        .wb-wind .wb-wind-particle:nth-child(8)  { top: 30vh; }
        .wb-wind .wb-wind-particle:nth-child(9)  { top: 50vh; }
        .wb-wind .wb-wind-particle:nth-child(10) { top: 75vh; }

        .wb-float .wb-floating:nth-child(1)  { left: 20%; top: 30%; }
        .wb-float .wb-floating:nth-child(2)  { left: 70%; top: 40%; }
        .wb-float .wb-floating:nth-child(3)  { left: 35%; top: 65%; }
        .wb-float .wb-floating:nth-child(4)  { left: 80%; top: 75%; }
        .wb-float .wb-floating:nth-child(5)  { left: 15%; top: 55%; }
        .wb-float .wb-floating:nth-child(6)  { left: 60%; top: 25%; }

        /* Respect user motion prefs */
        @media (prefers-reduced-motion: reduce) {
          .wb-blob,
          .wb-wind-particle,
          .wb-floating,
          .wb-streak {
            animation: none !important;
            transform: none !important;
            opacity: 0.15 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WindBackground;