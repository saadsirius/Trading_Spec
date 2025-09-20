'use client';

export function EquityChart({ title }: { title: string }) {
  return (
    <div className="glass p-6">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="h-64 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}
