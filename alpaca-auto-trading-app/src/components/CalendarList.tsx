'use client';
import type { CalendarEvent } from '@/src/types/market';

export default function CalendarList({ items }: { items: CalendarEvent[] }) {
  return (
    <div className="space-y-3">
      {items.map(ev=> (
        <div key={ev.id} className="p-3 rounded-md border border-neutral-800">
          <div className="text-sm opacity-70">{new Date(ev.date).toLocaleString()} · {ev.kind.toUpperCase()}</div>
          <div className="font-semibold">{ev.title}{ev.symbol?` (${ev.symbol})`:''}</div>
          <div className="text-sm opacity-80">Actual: {ev.actual??'-'} · Forecast: {ev.forecast??'-'} · Prev: {ev.previous??'-'}</div>
          {ev.country && <div className="text-xs opacity-60">{ev.country} · {ev.importance}</div>}
        </div>
      ))}
    </div>
  );
}
