import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AISignalGenerator, defaultSignalConfig } from '@/lib/ai/signals';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const symbol = searchParams.get('symbol');
    const timeframe = searchParams.get('timeframe') || '1D';
    const limit = parseInt(searchParams.get('limit') || '20');
    const active = searchParams.get('active') !== 'false';

    // Build where clause
    const where: any = {
      isActive: active,
    };

    if (userId) {
      where.userId = userId;
    }

    if (symbol) {
      // Find instrument by symbol
      const instrument = await prisma.instrument.findUnique({
        where: { symbol },
        select: { id: true },
      });

      if (!instrument) {
        return NextResponse.json(
          { error: 'Instrument not found' },
          { status: 404 }
        );
      }

      where.instrumentId = instrument.id;
    }

    // Fetch AI signals
    const signals = await prisma.aISignal.findMany({
      where,
      include: {
        instrument: {
          select: {
            symbol: true,
            name: true,
            type: true,
            price: true,
            changePercent: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Transform data for frontend
    const transformedSignals = signals.map(signal => ({
      id: signal.id,
      symbol: signal.instrument.symbol,
      name: signal.instrument.name,
      type: signal.instrument.type,
      currentPrice: signal.instrument.price,
      priceChange: signal.instrument.changePercent,
      signalType: signal.signalType,
      strength: signal.strength,
      confidence: signal.confidence,
      timeframe: signal.timeframe,
      reasoning: signal.reasoning,
      riskLevel: signal.riskLevel,
      expectedDuration: signal.expectedDuration,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      isActive: signal.isActive,
      triggeredAt: signal.triggeredAt,
      closedAt: signal.closedAt,
      actualReturn: signal.actualReturn,
      actualReturnPercent: signal.actualReturnPercent,
      createdAt: signal.createdAt,
      updatedAt: signal.updatedAt,
    }));

    return NextResponse.json({
      signals: transformedSignals,
      total: transformedSignals.length,
    });

  } catch (error) {
    console.error('Error fetching AI signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI signals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      symbol, 
      timeframe = '1D',
      config = {},
      generateForAll = false 
    } = body;

    if (!symbol && !generateForAll) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Initialize AI signal generator with custom config
    const signalConfig = { ...defaultSignalConfig, ...config };
    const generator = new AISignalGenerator(signalConfig);

    let instruments = [];

    if (generateForAll) {
      // Generate signals for all active instruments
      instruments = await prisma.instrument.findMany({
        where: {
          isActive: true,
          isTradeable: true,
        },
        select: {
          id: true,
          symbol: true,
          name: true,
        },
      });
    } else {
      // Generate signal for specific instrument
      const instrument = await prisma.instrument.findUnique({
        where: { symbol },
        select: {
          id: true,
          symbol: true,
          name: true,
        },
      });

      if (!instrument) {
        return NextResponse.json(
          { error: 'Instrument not found' },
          { status: 404 }
        );
      }

      instruments = [instrument];
    }

    const results = [];

    for (const instrument of instruments) {
      try {
        // Fetch price data for the instrument
        const priceData = await prisma.priceBar.findMany({
          where: {
            instrumentId: instrument.id,
            timeframe,
          },
          orderBy: {
            timestamp: 'asc',
          },
          take: 200, // Last 200 bars
        });

        if (priceData.length < 50) {
          console.log(`Insufficient data for ${instrument.symbol}`);
          continue;
        }

        // Transform price data to expected format
        const marketData = priceData.map(bar => ({
          timestamp: bar.timestamp.getTime(),
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
        }));

        // Generate signals
        const signals = generator.generateSignals(marketData, instrument.symbol);

        // Save signals to database
        for (const signal of signals) {
          // Check if signal already exists
          const existingSignal = await prisma.aISignal.findFirst({
            where: {
              instrumentId: instrument.id,
              signalType: signal.signalType,
              createdAt: {
                gte: new Date(signal.timestamp - 24 * 60 * 60 * 1000), // Within last 24 hours
              },
            },
          });

          if (existingSignal) {
            continue; // Skip if similar signal already exists
          }

          const savedSignal = await prisma.aISignal.create({
            data: {
              userId: userId || null,
              instrumentId: instrument.id,
              signalType: signal.signalType,
              strength: signal.strength,
              confidence: signal.confidence,
              timeframe: signal.timeframe,
              reasoning: signal.reasoning,
              riskLevel: signal.riskLevel,
              expectedDuration: signal.expectedDuration,
              stopLoss: signal.stopLoss,
              takeProfit: signal.takeProfit,
              isActive: true,
            },
          });

          results.push({
            instrument: instrument.symbol,
            signal: {
              id: savedSignal.id,
              type: savedSignal.signalType,
              strength: savedSignal.strength,
              confidence: savedSignal.confidence,
              riskLevel: savedSignal.riskLevel,
            },
          });
        }
      } catch (error) {
        console.error(`Error generating signals for ${instrument.symbol}:`, error);
        results.push({
          instrument: instrument.symbol,
          error: 'Failed to generate signals',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalGenerated: results.filter(r => !r.error).length,
      totalErrors: results.filter(r => r.error).length,
    });

  } catch (error) {
    console.error('Error generating AI signals:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI signals' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { signalId, updates } = body;

    if (!signalId) {
      return NextResponse.json(
        { error: 'Signal ID is required' },
        { status: 400 }
      );
    }

    // Update signal
    const updatedSignal = await prisma.aISignal.update({
      where: { id: signalId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        instrument: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      signal: {
        id: updatedSignal.id,
        symbol: updatedSignal.instrument.symbol,
        name: updatedSignal.instrument.name,
        signalType: updatedSignal.signalType,
        strength: updatedSignal.strength,
        confidence: updatedSignal.confidence,
        isActive: updatedSignal.isActive,
        triggeredAt: updatedSignal.triggeredAt,
        closedAt: updatedSignal.closedAt,
        actualReturn: updatedSignal.actualReturn,
        actualReturnPercent: updatedSignal.actualReturnPercent,
        updatedAt: updatedSignal.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error updating AI signal:', error);
    return NextResponse.json(
      { error: 'Failed to update AI signal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signalId = searchParams.get('signalId');

    if (!signalId) {
      return NextResponse.json(
        { error: 'Signal ID is required' },
        { status: 400 }
      );
    }

    // Delete signal
    await prisma.aISignal.delete({
      where: { id: signalId },
    });

    return NextResponse.json({
      success: true,
      message: 'Signal deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting AI signal:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI signal' },
      { status: 500 }
    );
  }
}
