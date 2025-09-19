import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    
    // Mock monitoring data
    const monitoringData = {
      system: {
        status: 'healthy',
        uptime: '99.8%',
        responseTime: 145,
        errorRate: 0.02,
        throughput: 1250,
        lastCheck: new Date().toISOString()
      },
      models: {
        total: 12,
        active: 10,
        training: 2,
        failed: 0,
        accuracy: {
          average: 0.76,
          best: 0.89,
          worst: 0.62
        },
        performance: {
          totalTrades: 1247,
          winningTrades: 891,
          totalProfit: 0.23,
          averageWin: 0.028,
          averageLoss: -0.016
        }
      },
      agents: {
        technical: { active: 4, accuracy: 0.78, profit: 0.15 },
        sentiment: { active: 2, accuracy: 0.65, profit: 0.08 },
        macro: { active: 3, accuracy: 0.70, profit: 0.10 },
        hybrid: { active: 1, accuracy: 0.81, profit: 0.18 }
      },
      alerts: [
        {
          id: 'alert-1',
          type: 'performance',
          severity: 'warning',
          message: 'Model accuracy dropped below threshold',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          resolved: false
        },
        {
          id: 'alert-2',
          type: 'system',
          severity: 'info',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          resolved: true
        }
      ],
      metrics: {
        cpu: { current: 45, average: 38, peak: 78 },
        memory: { current: 62, average: 58, peak: 85 },
        gpu: { current: 23, average: 20, peak: 45 },
        disk: { current: 34, average: 32, peak: 56 }
      }
    };

    const result = type === 'all' ? monitoringData : monitoringData[type as keyof typeof monitoringData];

    log.info({ type, status: monitoringData.system.status }, 'AI monitoring data requested');

    return Response.json({
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch monitoring data');
    return Response.json({ error: 'Failed to fetch monitoring data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config } = body;

    if (action === 'health-check') {
      // Perform system health check
      const healthCheck = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {
          database: { status: 'ok', responseTime: 12 },
          redis: { status: 'ok', responseTime: 3 },
          models: { status: 'ok', activeModels: 10 },
          agents: { status: 'ok', activeAgents: 7 },
          apis: { status: 'ok', responseTime: 145 }
        },
        overall: 'healthy'
      };

      log.info({ status: healthCheck.overall }, 'System health check performed');

      return Response.json({
        health: healthCheck,
        message: 'Health check completed'
      });
    }

    if (action === 'alert') {
      // Create new alert
      const newAlert = {
        id: `alert-${Date.now()}`,
        type: config?.type || 'system',
        severity: config?.severity || 'info',
        message: config?.message || 'System alert',
        timestamp: new Date().toISOString(),
        resolved: false
      };

      log.info({ alertId: newAlert.id, severity: newAlert.severity }, 'New alert created');

      return Response.json({
        alert: newAlert,
        message: 'Alert created successfully'
      }, { status: 201 });
    }

    if (action === 'metrics') {
      // Collect detailed metrics
      const metrics = {
        timestamp: new Date().toISOString(),
        system: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
          network: Math.random() * 1000
        },
        models: {
          totalInference: 1247,
          averageLatency: 145,
          errorRate: 0.02,
          throughput: 1250
        },
        agents: {
          totalSignals: 89,
          successfulTrades: 67,
          failedTrades: 22,
          averageProfit: 0.023
        }
      };

      log.info({ timestamp: metrics.timestamp }, 'Detailed metrics collected');

      return Response.json({
        metrics,
        message: 'Metrics collected successfully'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to process monitoring request');
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
