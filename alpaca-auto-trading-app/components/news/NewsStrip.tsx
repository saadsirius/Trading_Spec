'use client';

export default function NewsStrip() {
  const news = [
    {
      title: 'Fed Signals Potential Rate Cut',
      source: 'Reuters',
      time: '2h ago',
      impact: 'high',
      sentiment: 'positive'
    },
    {
      title: 'Apple Reports Strong Q4 Earnings',
      source: 'Bloomberg',
      time: '4h ago',
      impact: 'medium',
      sentiment: 'positive'
    },
    {
      title: 'Oil Prices Surge on Supply Concerns',
      source: 'WSJ',
      time: '6h ago',
      impact: 'medium',
      sentiment: 'neutral'
    }
  ];

  return (
    <div className="glass p-4 rounded-xl">
      <h3 className="font-semibold text-lg mb-3">Market News</h3>
      <div className="space-y-3">
        {news.map((item, index) => (
          <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  item.impact === 'high' ? 'bg-red-600' : 
                  item.impact === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                }`}>
                  {item.impact}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  item.sentiment === 'positive' ? 'bg-green-600' : 
                  item.sentiment === 'negative' ? 'bg-red-600' : 'bg-gray-600'
                }`}>
                  {item.sentiment}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
