import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id;
    
    // Mock agent details - in real implementation, fetch from database
    const agent = {
      id: agentId,
      name: 'RSI Momentum Agent',
      type: 'technical',
      status: 'active',
      performance: {
        accuracy: 0.78,
        profit: 0.15,
        trades: 45,
        winRate: 0.68,
        avgWin: 0.025,
        avgLoss: -0.015,
        sharpeRatio: 1.45,
        maxDrawdown: -0.08
      },
      lastUpdate: new Date().toISOString(),
      config: { rsi_period: 14, oversold: 30, overbought: 70 },
      history: [
        { date: '2024-01-15', action: 'buy', symbol: 'AAPL', price: 150.25, result: 'win' },
        { date: '2024-01-16', action: 'sell', symbol: 'AAPL', price: 152.80, result: 'win' },
        { date: '2024-01-17', action: 'buy', symbol: 'MSFT', price: 380.50, result: 'loss' }
      ],
      metrics: {
        totalTrades: 45,
        winningTrades: 31,
        losingTrades: 14,
        totalProfit: 0.15,
        bestTrade: 0.045,
        worstTrade: -0.032
      }
    };

    log.info({ agentId }, 'Agent details requested');

    return Response.json({ agent });
  } catch (error: any) {
    log.error({ error: error.message, agentId: params.id }, 'Failed to fetch agent details');
    return Response.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id;
    const body = await req.json();
    const { status, config } = body;

    // Update agent
    const updatedAgent = {
      id: agentId,
      status: status || 'active',
      config: config || {},
      lastUpdate: new Date().toISOString()
    };

    log.info({ agentId, status }, 'Agent updated');

    return Response.json({
      agent: updatedAgent,
      message: 'Agent updated successfully'
    });
  } catch (error: any) {
    log.error({ error: error.message, agentId: params.id }, 'Failed to update agent');
    return Response.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id;

    log.info({ agentId }, 'Agent deleted');

    return Response.json({
      message: 'Agent deleted successfully'
    });
  } catch (error: any) {
    log.error({ error: error.message, agentId: params.id }, 'Failed to delete agent');
    return Response.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
