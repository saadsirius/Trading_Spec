"use client";
import { motion } from "framer-motion";
import React from "react";

type Props = {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function GlassButton({ 
  variant = "primary", 
  size = "md",
  children, 
  className = "",
  onClick
}: Props) {
  const grad =
    variant === "primary"
      ? "from-primary/70 via-secondary/60 to-accent/60"
      : "from-secondary/60 via-support/60 to-primary/60";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`btn-glass relative overflow-hidden ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {/* gradient border halo */}
      <span className={`pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${grad} opacity-30`} />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
