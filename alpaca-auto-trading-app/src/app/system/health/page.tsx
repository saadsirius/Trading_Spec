"use client";
import { useSystemHealth } from "@/lib/analytics/useSystemHealth";
import ToastProvider from "@/lib/ui/ToastProvider";

export default function SystemHealthPage() {
  const h = useSystemHealth();
  return (
    <div className="p-6 space-y-4">
      <ToastProvider />
      <h1 className="text-2xl font-semibold">Santé Système</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card label="WebSocket connecté" value={String(h.wsConnected)} />
        <Card label="Latence WS (ms)" value={h.wsLatencyMs ?? "n/a"} />
        <Card label="Latence REST (ms)" value={h.restLatencyMs ?? "n/a"} />
        <Card label="Erreurs provider (1m)" value={h.providerErrors1m} />
        <Card label="Queue Lag (ms)" value={h.queueLagMs ?? "n/a"} />
        <Card label="Timestamp" value={new Date(h.ts).toLocaleString()} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl">{String(value)}</div>
    </div>
  );
}
