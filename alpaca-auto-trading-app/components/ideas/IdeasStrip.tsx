'use client';

export default function IdeasStrip() {
  const ideas = [
    { 
      title: 'Tech Rally Continues', 
      description: 'Strong earnings from major tech companies driving market momentum',
      sentiment: 'bullish',
      confidence: 85
    },
    { 
      title: 'Energy Sector Rotation', 
      description: 'Institutional money flowing into energy stocks on oil price recovery',
      sentiment: 'bullish',
      confidence: 72
    },
    { 
      title: 'Defensive Positioning', 
      description: 'Market volatility suggests defensive sector rotation may be starting',
      sentiment: 'neutral',
      confidence: 68
    }
  ];

  return (
    <div className="glass p-4 rounded-xl">
      <h3 className="font-semibold text-lg mb-3">AI Trading Ideas</h3>
      <div className="space-y-3">
        {ideas.map((idea, index) => (
          <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{idea.title}</h4>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                idea.sentiment === 'bullish' ? 'bg-green-600' : 
                idea.sentiment === 'bearish' ? 'bg-red-600' : 'bg-yellow-600'
              }`}>
                {idea.sentiment}
              </div>
            </div>
            <p className="text-sm text-white/70 mb-2">{idea.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Confidence: {idea.confidence}%</span>
              <div className="w-16 h-1 bg-white/20 rounded">
                <div 
                  className="h-full bg-blue-500 rounded" 
                  style={{ width: `${idea.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
