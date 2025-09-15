"use client";
import { motion } from "framer-motion";
import GlassButton from "./components/GlassButton";

export default function Landing() {
  return (
    <main className="relative overflow-hidden">
      {/* Top animated blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-20%] h-[50vh] w-[50vw] rounded-full bg-secondary/30 blur-3xl motion-safe:animate-shift" />
      <div aria-hidden className="pointer-events-none absolute -top-20 left-[-10%] h-[45vh] w-[45vw] rounded-full bg-primary/30 blur-3xl motion-safe:animate-float" />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20 text-center">
        <motion.h1
          className="mx-auto max-w-3xl text-5xl md:text-6xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}
        >
          Trade smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-accent">breathe calmer</span>.
        </motion.h1>
        <motion.p
          className="mx-auto mt-5 max-w-2xl text-lg text-white/80"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .6 }}
        >
          A soothing, brain-boosting cockpit for your Alpaca strategies — liquid-glass clarity, zero clutter.
        </motion.p>

        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .6 }}
        >
          <GlassButton onClick={()=>window.location.assign("/dashboard")}>Explore Dashboard</GlassButton>
          <GlassButton variant="secondary" onClick={()=>window.location.assign("/my-dashboard")}>My Dashboard</GlassButton>
        </motion.div>

        {/* Feature cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Calm UI", "Motion-safe micro-animations reduce cognitive load."],
            ["Liquid Glass", "Frosted surfaces keep focus on what matters."],
            ["Wave Charts", "Gentle, living canvas for your market flow."]
          ].map(([title,desc])=>(
            <motion.div key={title} whileHover={{ y:-4 }} className="glass p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/75">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom waves (SVG) */}
      <WaveFooter />
    </main>
  );
}

function WaveFooter() {
  return (
    <div className="relative">
      <svg className="absolute bottom-0 left-0 right-0 h-40 w-full" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="waveGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35"/>
            <stop offset="50%" stopColor="#6E56CF" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.35"/>
          </linearGradient>
        </defs>
        <path id="wavePath" d="M0,64L80,80C160,96,320,128,480,138.7C640,149,800,139,960,117.3C1120,96,1280,64,1360,48L1440,32V160H0Z" fill="url(#waveGrad)"></path>
        <path d="M0,96L120,106.7C240,117,480,139,720,138.7C960,139,1200,117,1320,106.7L1440,96V160H0Z" fill="url(#waveGrad)" opacity=".5"></path>
      </svg>
      <div className="h-40" />
    </div>
  );
}
