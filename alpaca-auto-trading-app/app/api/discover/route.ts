import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'trending';

    // Mock discover items
    const mockItems = [
      {
        id: '1',
        type: 'stock' as const,
        title: 'AAPL - Strong Q4 Earnings Beat',
        description: 'Apple reported better-than-expected earnings with strong iPhone sales and services growth.',
        symbol: 'AAPL',
        price: 175.50,
        change: 2.30,
        changePercent: 1.33,
        sentiment: 0.8,
        tags: ['earnings', 'tech', 'growth'],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'crypto' as const,
        title: 'Bitcoin ETF Approval Expected',
        description: 'Multiple Bitcoin ETF applications are under review by the SEC with potential approval this quarter.',
        symbol: 'BTC',
        price: 43250.00,
        change: 1250.00,
        changePercent: 2.98,
        sentiment: 0.6,
        tags: ['crypto', 'etf', 'bitcoin'],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'news' as const,
        title: 'Fed Signals Potential Rate Cut',
        description: 'Federal Reserve officials hint at possible interest rate reduction in the coming months.',
        sentiment: 0.4,
        tags: ['fed', 'rates', 'macro'],
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'alert' as const,
        title: 'TSLA Breakout Alert',
        description: 'Tesla stock breaks above key resistance level with strong volume confirmation.',
        symbol: 'TSLA',
        price: 245.80,
        change: 8.90,
        changePercent: 3.76,
        sentiment: 0.7,
        tags: ['breakout', 'momentum', 'ev'],
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        type: 'etf' as const,
        title: 'SPY - Market Rally Continues',
        description: 'S&P 500 ETF shows strong momentum with institutional buying pressure.',
        symbol: 'SPY',
        price: 445.20,
        change: 1.80,
        changePercent: 0.41,
        sentiment: 0.5,
        tags: ['sp500', 'etf', 'index'],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        type: 'stock' as const,
        title: 'NVDA - AI Chip Demand Surge',
        description: 'NVIDIA reports increased demand for AI chips from data center customers.',
        symbol: 'NVDA',
        price: 485.30,
        change: -5.20,
        changePercent: -1.06,
        sentiment: 0.3,
        tags: ['ai', 'chips', 'data-center'],
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filter items
    let filteredItems = mockItems;
    if (filter !== 'all') {
      filteredItems = mockItems.filter(item => item.type === filter);
    }

    // Sort items
    switch (sort) {
      case 'recent':
        filteredItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'sentiment':
        filteredItems.sort((a, b) => (b.sentiment || 0) - (a.sentiment || 0));
        break;
      case 'trending':
      default:
        // Sort by a combination of sentiment and recency
        filteredItems.sort((a, b) => {
          const aScore = (a.sentiment || 0) * 0.7 + (1 - (Date.now() - new Date(a.timestamp).getTime()) / (24 * 60 * 60 * 1000)) * 0.3;
          const bScore = (b.sentiment || 0) * 0.7 + (1 - (Date.now() - new Date(b.timestamp).getTime()) / (24 * 60 * 60 * 1000)) * 0.3;
          return bScore - aScore;
        });
        break;
    }

    console.log('Discover items fetched successfully', { 
      filter, 
      sort, 
      count: filteredItems.length 
    });
    
    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error('Error fetching discover items', error);
    return NextResponse.json(
      { error: 'Failed to fetch discover items' },
      { status: 500 }
    );
  }
}