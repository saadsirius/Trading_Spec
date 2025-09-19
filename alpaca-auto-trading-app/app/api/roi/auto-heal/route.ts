import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    
    // Mock auto-heal data
    const autoHealData = {
      status: 'active',
      lastCheck: new Date().toISOString(),
      incidents: [
        {
          id: 'incident-1',
          type: 'performance-degradation',
          severity: 'medium',
          symbol: 'AAPL',
          detectedAt: new Date(Date.now() - 1800000).toISOString(),
          resolvedAt: new Date(Date.now() - 900000).toISOString(),
          duration: 15, // minutes
          action: 'rebalance-portfolio',
          success: true,
          details: {
            issue: 'Sharpe ratio dropped below threshold',
            solution: 'Reduced position size and increased diversification',
            improvement: 'Sharpe ratio improved from 1.42 to 1.58'
          }
        },
        {
          id: 'incident-2',
          type: 'risk-exceeded',
          severity: 'high',
          symbol: 'TSLA',
          detectedAt: new Date(Date.now() - 3600000).toISOString(),
          resolvedAt: new Date(Date.now() - 1800000).toISOString(),
          duration: 30,
          action: 'reduce-exposure',
          success: true,
          details: {
            issue: 'VaR 95% exceeded risk limit',
            solution: 'Reduced position size by 25% and added stop-loss',
            improvement: 'VaR reduced from -0.067 to -0.042'
          }
        },
        {
          id: 'incident-3',
          type: 'model-drift',
          severity: 'low',
          symbol: 'NVDA',
          detectedAt: new Date(Date.now() - 7200000).toISOString(),
          resolvedAt: null,
          duration: null,
          action: 'retrain-model',
          success: false,
          details: {
            issue: 'Model accuracy declining over time',
            solution: 'Retraining model with recent data',
            improvement: 'Training in progress...'
          }
        }
      ],
      statistics: {
        totalIncidents: 3,
        resolvedIncidents: 2,
        activeIncidents: 1,
        averageResolutionTime: 22.5, // minutes
        successRate: 0.67,
        preventedLosses: 0.023 // 2.3%
      },
      rules: [
        {
          id: 'rule-1',
          name: 'Sharpe Ratio Monitor',
          condition: 'sharpe < 1.5',
          action: 'rebalance',
          enabled: true,
          lastTriggered: new Date(Date.now() - 900000).toISOString()
        },
        {
          id: 'rule-2',
          name: 'VaR Risk Monitor',
          condition: 'var95 < -0.05',
          action: 'reduce-exposure',
          enabled: true,
          lastTriggered: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'rule-3',
          name: 'Drawdown Monitor',
          condition: 'maxDrawdown < -0.1',
          action: 'stop-trading',
          enabled: true,
          lastTriggered: null
        }
      ]
    };

    const filteredIncidents = status === 'all' 
      ? autoHealData.incidents
      : autoHealData.incidents.filter(incident => 
          status === 'active' ? !incident.resolvedAt : incident.resolvedAt
        );

    log.info({ status, incidentCount: filteredIncidents.length }, 'Auto-heal data requested');

    return Response.json({
      autoHeal: {
        ...autoHealData,
        incidents: filteredIncidents
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch auto-heal data');
    return Response.json({ error: 'Failed to fetch auto-heal data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config } = body;

    if (action === 'trigger') {
      // Manually trigger auto-heal
      const triggerResult = {
        incidentId: `incident-${Date.now()}`,
        type: config?.type || 'manual',
        status: 'processing',
        estimatedTime: '2-5 minutes',
        actions: config?.actions || ['analyze', 'diagnose', 'remediate'],
        timestamp: new Date().toISOString()
      };

      log.info({ incidentId: triggerResult.incidentId, type: triggerResult.type }, 'Auto-heal triggered');

      return Response.json({
        trigger: triggerResult,
        message: 'Auto-heal process started'
      }, { status: 201 });
    }

    if (action === 'rule') {
      // Create/update auto-heal rule
      const newRule = {
        id: `rule-${Date.now()}`,
        name: config?.name || 'Custom Rule',
        condition: config?.condition || 'metric < threshold',
        action: config?.action || 'alert',
        enabled: config?.enabled !== false,
        created: new Date().toISOString(),
        lastTriggered: null
      };

      log.info({ ruleId: newRule.id, name: newRule.name }, 'Auto-heal rule created');

      return Response.json({
        rule: newRule,
        message: 'Auto-heal rule created successfully'
      }, { status: 201 });
    }

    if (action === 'resolve') {
      // Manually resolve incident
      const resolution = {
        incidentId: config?.incidentId,
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'manual',
        action: config?.action || 'manual-intervention',
        success: config?.success !== false
      };

      log.info({ incidentId: resolution.incidentId }, 'Incident manually resolved');

      return Response.json({
        resolution,
        message: 'Incident resolved successfully'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to process auto-heal request');
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
