import { notFound } from "next/navigation";

interface SettingsModePageProps {
  params: {
    mode: string;
  };
}

export default function SettingsModePage({ params }: SettingsModePageProps) {
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
          {mode === 'live' ? 'Live' : 'Paper'} Trading Settings
        </h1>
        <p className="text-white/80">
          {mode === 'live' 
            ? 'Configure your live trading environment and risk management settings.'
            : 'Configure your paper trading environment and preferences.'
          }
        </p>
      </div>
      
      {mode === 'paper' ? (
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Starting Capital
              </label>
              <input
                type="number"
                defaultValue="10000"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Default Order Size
              </label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/60"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="glass p-6 border-l-4 border-danger-500/50">
            <h2 className="text-lg font-semibold text-white mb-4">⚠️ Risk Management</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Max Position Size (% of Portfolio)
                </label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Daily Loss Limit (%)
                </label>
                <input
                  type="number"
                  defaultValue="2"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/60"
                />
              </div>
            </div>
          </div>
          
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Emergency Controls</h2>
            <button className="btn-glass bg-danger-500/20 text-danger-400 hover:bg-danger-500/30 px-4 py-2">
              🛑 Emergency Stop All Trading
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
