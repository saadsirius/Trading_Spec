import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentType = searchParams.get('type') || 'all';
    
    // Mock agent data - in real implementation, fetch from database
    const agents = {
      technical: [
        {
          id: 'tech-1',
          name: 'RSI Momentum Agent',
          type: 'technical',
          status: 'active',
          performance: { accuracy: 0.78, profit: 0.15, trades: 45 },
          lastUpdate: new Date().toISOString(),
          config: { rsi_period: 14, oversold: 30, overbought: 70 }
        },
        {
          id: 'tech-2',
          name: 'MACD Cross Agent',
          type: 'technical',
          status: 'active',
          performance: { accuracy: 0.72, profit: 0.12, trades: 38 },
          lastUpdate: new Date().toISOString(),
          config: { fast: 12, slow: 26, signal: 9 }
        }
      ],
      sentiment: [
        {
          id: 'sent-1',
          name: 'News Sentiment Agent',
          type: 'sentiment',
          status: 'active',
          performance: { accuracy: 0.65, profit: 0.08, trades: 22 },
          lastUpdate: new Date().toISOString(),
          config: { threshold: 0.6, lookback: 7 }
        }
      ],
      macro: [
        {
          id: 'macro-1',
          name: 'Economic Calendar Agent',
          type: 'macro',
          status: 'active',
          performance: { accuracy: 0.70, profit: 0.10, trades: 15 },
          lastUpdate: new Date().toISOString(),
          config: { impact_threshold: 'high', sectors: ['tech', 'finance'] }
        }
      ]
    };

    const result = agentType === 'all' 
      ? Object.values(agents).flat()
      : agents[agentType as keyof typeof agents] || [];

    log.info({ agentType, count: result.length }, 'AI agents requested');

    return Response.json({
      agents: result,
      total: result.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch AI agents');
    return Response.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, config } = body;

    // Validate required fields
    if (!name || !type || !config) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new agent
    const newAgent = {
      id: `agent-${Date.now()}`,
      name,
      type,
      status: 'inactive',
      performance: { accuracy: 0, profit: 0, trades: 0 },
      lastUpdate: new Date().toISOString(),
      config
    };

    log.info({ agentId: newAgent.id, type }, 'New AI agent created');

    return Response.json({
      agent: newAgent,
      message: 'Agent created successfully'
    }, { status: 201 });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to create AI agent');
    return Response.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
