import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'SPY';
    const timeframe = searchParams.get('timeframe') || '1Y';
    
    // Mock ROI evaluation data
    const roiEvaluation = {
      symbol,
      timeframe,
      timestamp: new Date().toISOString(),
      metrics: {
        sharpe: 1.67,
        sortino: 2.34,
        calmar: 1.89,
        var95: -0.045,
        var99: -0.078,
        maxDrawdown: -0.089,
        cagr: 0.156,
        volatility: 0.187,
        beta: 0.98,
        alpha: 0.023,
        informationRatio: 0.45,
        treynorRatio: 0.159
      },
      sensitivity: {
        market: 0.98,
        interest: -0.23,
        volatility: 0.45,
        liquidity: 0.12,
        sector: 0.67
      },
      causal: {
        earnings: 0.34,
        news: 0.28,
        technical: 0.41,
        macro: 0.19,
        sentiment: 0.22
      },
      performance: {
        totalReturn: 0.156,
        annualizedReturn: 0.156,
        excessReturn: 0.023,
        trackingError: 0.045,
        informationRatio: 0.45,
        jensenAlpha: 0.023
      },
      risk: {
        systematic: 0.187,
        unsystematic: 0.089,
        total: 0.203,
        downside: 0.123,
        upside: 0.156
      }
    };

    log.info({ symbol, timeframe }, 'ROI evaluation requested');

    return Response.json({
      evaluation: roiEvaluation,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to evaluate ROI');
    return Response.json({ error: 'Failed to evaluate ROI' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbols, timeframe, metrics, benchmark } = body;

    // Validate required fields
    if (!symbols || !Array.isArray(symbols)) {
      return Response.json({ error: 'Symbols array is required' }, { status: 400 });
    }

    // Perform batch ROI evaluation
    const evaluations = symbols.map((symbol: string) => ({
      symbol,
      timeframe: timeframe || '1Y',
      metrics: {
        sharpe: Math.random() * 2 + 0.5,
        sortino: Math.random() * 3 + 0.8,
        calmar: Math.random() * 2.5 + 0.5,
        var95: -(Math.random() * 0.1 + 0.02),
        var99: -(Math.random() * 0.15 + 0.05),
        maxDrawdown: -(Math.random() * 0.2 + 0.05),
        cagr: Math.random() * 0.3 + 0.05,
        volatility: Math.random() * 0.3 + 0.1,
        beta: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.1 - 0.05,
        informationRatio: Math.random() * 1.5 - 0.5,
        treynorRatio: Math.random() * 0.3 + 0.05
      },
      ranking: Math.floor(Math.random() * 100) + 1,
      grade: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'][Math.floor(Math.random() * 8)]
    }));

    // Sort by Sharpe ratio
    evaluations.sort((a, b) => b.metrics.sharpe - a.metrics.sharpe);

    log.info({ symbolCount: symbols.length, timeframe }, 'Batch ROI evaluation completed');

    return Response.json({
      evaluations,
      summary: {
        total: evaluations.length,
        averageSharpe: evaluations.reduce((sum, e) => sum + e.metrics.sharpe, 0) / evaluations.length,
        averageCAGR: evaluations.reduce((sum, e) => sum + e.metrics.cagr, 0) / evaluations.length,
        bestPerformer: evaluations[0],
        worstPerformer: evaluations[evaluations.length - 1]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to perform batch ROI evaluation');
    return Response.json({ error: 'Failed to evaluate ROI' }, { status: 500 });
  }
}
