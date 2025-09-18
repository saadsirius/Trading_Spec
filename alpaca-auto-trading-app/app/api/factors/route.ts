import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/db';

// Mock factor calculation function
function calculateFactors(symbol: string) {
  // In a real implementation, this would fetch fundamental data
  // and calculate actual factor scores
  const baseScore = 50;
  const variation = 30;
  
  return {
    symbol,
    momentum: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variation)),
    value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variation)),
    quality: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variation)),
    risk: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variation)),
    growth: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variation)),
    asOf: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const minMomentum = searchParams.get('minMomentum');
    const minValue = searchParams.get('minValue');
    const minQuality = searchParams.get('minQuality');
    const maxRisk = searchParams.get('maxRisk');
    const minGrowth = searchParams.get('minGrowth');

    // Default symbols to analyze
    const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC'];
    const symbolsToAnalyze = symbol ? [symbol] : defaultSymbols;

    const factors = [];

    for (const sym of symbolsToAnalyze) {
      // Check if we have recent data in database
      const existing = await prisma.factorSnapshot.findFirst({
        where: {
          symbol: sym,
          asOf: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { asOf: 'desc' }
      });

      let factorData;
      if (existing) {
        factorData = {
          symbol: existing.symbol,
          momentum: existing.momentum,
          value: existing.value,
          quality: existing.quality,
          risk: existing.risk,
          growth: existing.growth,
          asOf: existing.asOf.toISOString()
        };
      } else {
        // Calculate new factors
        factorData = calculateFactors(sym);
        
        // Save to database
        await prisma.factorSnapshot.create({
          data: {
            symbol: factorData.symbol,
            momentum: factorData.momentum,
            value: factorData.value,
            quality: factorData.quality,
            risk: factorData.risk,
            growth: factorData.growth
          }
        });
      }

      // Apply filters
      let include = true;
      if (minMomentum && factorData.momentum < parseFloat(minMomentum)) include = false;
      if (minValue && factorData.value < parseFloat(minValue)) include = false;
      if (minQuality && factorData.quality < parseFloat(minQuality)) include = false;
      if (maxRisk && factorData.risk > parseFloat(maxRisk)) include = false;
      if (minGrowth && factorData.growth < parseFloat(minGrowth)) include = false;

      if (include) {
        factors.push(factorData);
      }
    }

    console.log('Factors fetched successfully', { 
      count: factors.length, 
      filters: { symbol, minMomentum, minValue, minQuality, maxRisk, minGrowth } 
    });
    return NextResponse.json(factors);
  } catch (error) {
    console.error('Error fetching factors', error);
    return NextResponse.json(
      { error: 'Failed to fetch factors' },
      { status: 500 }
    );
  }
}
