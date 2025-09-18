'use client';
import { useEffect, useState } from 'react';
import { Toasts } from '@/lib/toast/ToastService';

type T = { id:string; title:string; desc?:string };
export default function ToastRail() {
  const [toasts, setToasts] = useState<T[]>([]);
  useEffect(() => {
    const unsub = Toasts.subscribe((t, kind) => {
      setToasts(prev => {
        if (kind === 'dismiss') return prev.filter(x => x.id !== t.id);
        const others = prev.filter(x => x.id !== t.id);
        return [t as T, ...others].slice(0, 6);
      });
    });
    return () => unsub();
  }, []);
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 space-y-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto rounded bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm max-w-[360px]">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{t.title}</div>
            <button className="text-xs text-gray-500" onClick={() => (Toasts as any).dismiss(t.id)}>×</button>
          </div>
          {t.desc && <div className="text-gray-600 dark:text-gray-300">{t.desc}</div>}
        </div>
      ))}
    </div>
  );
}
