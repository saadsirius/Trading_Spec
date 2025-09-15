import { notFound } from "next/navigation";

interface JournalModePageProps {
  params: {
    mode: string;
  };
}

export default function JournalModePage({ params }: JournalModePageProps) {
  // Handle case where params might be undefined during static generation
  if (!params) {
    return <div>Loading...</div>;
  }
  
  const { mode } = params;
  
  // Validate mode parameter
  if (mode !== 'paper' && mode !== 'live') {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h1 className="text-2xl font-bold text-white mb-4">
          {mode === 'live' ? 'Live' : 'Paper'} Trade Journal
        </h1>
        <p className="text-white/80">
          {mode === 'live' 
            ? 'Track your live trading performance and analyze real money trades.'
            : 'Track your paper trading performance and learn from your decisions.'
          }
        </p>
      </div>
      
      <div className="glass p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
        <div className="text-white/60">
          Your {mode} trade history will appear here once you start trading.
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
