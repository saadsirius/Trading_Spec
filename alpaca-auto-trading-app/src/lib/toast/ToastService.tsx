'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  createdAt: number;
  ttlMs?: number;
}

interface ToastState {
  toasts: Toast[];
  add: (t: Omit<Toast, 'id' | 'createdAt'>) => string;
  remove: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (t) => {
    const id = crypto.randomUUID();
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id, createdAt: Date.now(), ttlMs: 4000, ...t },
      ],
    }));
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

function addTyped(type: ToastType) {
  return (message: string, title?: string) =>
    useToastStore.getState().add({ type, message, title });
}

export const Toasts = {
  info: addTyped('info'),
  success: addTyped('success'),
  warning: addTyped('warning'),
  error: addTyped('error'),
  remove: (id: string) => useToastStore.getState().remove(id),
  clear: () => useToastStore.getState().clear(),
};

export function ToastViewport() {
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => remove(t.id), t.ttlMs ?? 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[240px] rounded-md px-4 py-3 shadow text-white border ${
            t.type === 'success'
              ? 'bg-green-600 border-green-500'
              : t.type === 'error'
              ? 'bg-red-600 border-red-500'
              : t.type === 'warning'
              ? 'bg-yellow-600 border-yellow-500'
              : 'bg-blue-600 border-blue-500'
          }`}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          <div className="text-sm">{t.message}</div>
        </div>
      ))}
    </div>
  );
}
