import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderSchema, GetOrdersSchema } from '@/lib/validations/trading';
import { getAlpacaService } from '@/lib/alpaca/client';
import { performRiskChecks } from '@/lib/utils/risk-checks';
import { decideOrder } from '@/lib/strategy/executor';
import { Bar } from '@/lib/indicators';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is an automated trading decision
    if (body.autoTrade && body.symbol && body.timeframe) {
      return handleAutoTrade(request, body);
    }
    
    const validatedData = CreateOrderSchema.parse(body);

    // Perform risk checks
    const riskCheckResult = await performRiskChecks(validatedData);
    if (!riskCheckResult.passed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Risk check failed', 
          details: riskCheckResult.errors 
        },
        { status: 400 }
      );
    }

    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';
    const isLiveMode = false; // Default to paper trading

    const alpacaService = getAlpacaService(userId, isLiveMode);
    const order = await alpacaService.createOrder(validatedData);

    // Log to trade journal
    await prisma.tradeJournal.create({
      data: {
        userId,
        symbol: validatedData.symbol,
        side: validatedData.side,
        quantity: validatedData.qty || 0,
        price: validatedData.limit_price || 0,
        orderType: validatedData.type,
        status: 'pending',
        alpacaOrderId: order.id,
        notes: `Order created via API`,
      },
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid order data', 
          details: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}

async function handleAutoTrade(request: NextRequest, body: any) {
  try {
    const userId = 'demo-user';
    const isLiveMode = false;
    const alpacaService = getAlpacaService(userId, isLiveMode);

    // Get historical bars
    const bars = await alpacaService.getBars(
      body.symbol,
      body.timeframe || '1Day',
      body.lookback || 200
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

    // Get trading decision from executor
    const decision = decideOrder(body.symbol, formattedBars, dailyVol, {
      equity: 1000,
      sleeveShare: 0.35,
      targetAnnVol: 0.10,
      maxTradeRiskPct: 0.005,
      winRate: 0.52,
      payoff: 1.1
    });

    if (decision.action === 'hold') {
      return NextResponse.json({
        success: true,
        data: { decision, message: 'No trading signal generated' },
      });
    }

    // Execute the order if confidence is high enough
    if (decision.confidence >= 0.6 && decision.order) {
      const orderData = {
        ...decision.order,
        side: decision.order.side as 'buy' | 'sell',
        type: decision.order.type as 'market' | 'limit' | 'stop' | 'stop_limit'
      };
      const order = await alpacaService.createOrder(orderData);

      // Log to trade journal
      await prisma.tradeJournal.create({
        data: {
          userId,
          symbol: decision.order.symbol,
          side: decision.order.side,
          quantity: decision.order.qty,
          price: 0, // Market order
          orderType: decision.order.type,
          status: 'pending',
          alpacaOrderId: order.id,
          notes: `Auto-trade: ${decision.reason} (${Math.round(decision.confidence * 100)}% confidence)`,
        },
      });

      return NextResponse.json({
        success: true,
        data: { 
          decision, 
          order,
          message: `Auto-trade executed: ${decision.action} ${decision.order.qty} shares` 
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { 
        decision, 
        message: `Signal generated but confidence too low (${Math.round(decision.confidence * 100)}%)` 
      },
    });

  } catch (error) {
    console.error('Auto-trade error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Auto-trade failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validatedParams = GetOrdersSchema.parse({
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
    });

    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';
    const isLiveMode = false; // Default to paper trading

    const alpacaService = getAlpacaService(userId, isLiveMode);
    const orders = await alpacaService.getOrders(validatedParams);

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders' 
      },
      { status: 500 }
    );
  }
}
