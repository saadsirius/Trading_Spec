"use client";
import { useEffect, useState } from "react";
import type { HealthSnapshot } from "@/core/domain";
import { bus } from "@/lib/event-bus";

/** Écoute le bus et calcule un snapshot simple pour la page /system/health */
export function useSystemHealth() {
  const [health, setHealth] = useState<HealthSnapshot>({
    ts: Date.now(),
    wsConnected: false,
    wsLatencyMs: null,
    restLatencyMs: null,
    providerErrors1m: 0,
    queueLagMs: null,
  });

  useEffect(() => {
    const off = bus.on((e) => {
      if (e.type === "HEALTH") setHealth(e.health);
    });
    return () => off();
  }, []);

  return health;
}
