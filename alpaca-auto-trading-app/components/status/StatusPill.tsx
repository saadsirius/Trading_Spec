'use client';

interface StatusPillProps {
  label: string;
  status: 'healthy' | 'degraded' | 'error';
}

export default function StatusPill({ label, status }: StatusPillProps) {
  const statusColors = {
    healthy: 'bg-green-600',
    degraded: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {label}: {status}
    </div>
  );
}
