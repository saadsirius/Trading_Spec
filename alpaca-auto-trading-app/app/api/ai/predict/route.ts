import { NextRequest, NextResponse } from 'next/server';
import { PredictSchema } from '@/lib/validations/trading';
import { decideOrder } from '@/lib/strategy/executor';
import { backtest } from '@/lib/strategy/backtest';
import { getAlpacaService } from '@/lib/alpaca/client';
import { Bar } from '@/lib/indicators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PredictSchema.parse(body);

    // Get historical bars
    const userId = 'demo-user';
    const isLiveMode = false;
    const alpacaService = getAlpacaService(userId, isLiveMode);
    
    const bars = await alpacaService.getBars(
      validatedData.symbol,
      validatedData.timeframe || '1Day',
      validatedData.lookback || 200
    );

    // Convert to our Bar format
    const formattedBars: Bar[] = bars.map(bar => ({
      time: new Date(bar.t).getTime(),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v
    }));

    // Calculate daily volatility
    const returns = [];
    for (let i = 1; i < formattedBars.length; i++) {
      returns.push(Math.log(formattedBars[i].close / formattedBars[i-1].close));
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const dailyVol = Math.sqrt(variance);

    // Get trading decision
    const decision = decideOrder(validatedData.symbol, formattedBars, dailyVol, {
      equity: 1000, // Starting equity
      sleeveShare: 0.35, // Trend sleeve
      targetAnnVol: 0.10,
      maxTradeRiskPct: 0.005,
      winRate: 0.52,
      payoff: 1.1
    });

    // Run backtest if requested
    let backtestResults = null;
    if (validatedData.lookback && validatedData.lookback >= 100) {
      backtestResults = backtest(validatedData.symbol, formattedBars, {
        equity: 1000,
        sleeveShare: 0.35,
        targetAnnVol: 0.10,
        maxTradeRiskPct: 0.005
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol: validatedData.symbol,
        decision,
        dailyVol,
        backtest: backtestResults,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('AI prediction error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid prediction request', 
          details: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate prediction' 
      },
      { status: 500 }
    );
  }
}
