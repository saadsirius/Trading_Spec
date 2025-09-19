import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'active';
    
    // Mock ROI alerts data
    const alerts = [
      {
        id: 'roi-alert-1',
        type: 'performance',
        severity: 'warning',
        symbol: 'AAPL',
        message: 'Sharpe ratio dropped below 1.5 threshold',
        currentValue: 1.42,
        threshold: 1.5,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'active',
        resolved: false
      },
      {
        id: 'roi-alert-2',
        type: 'risk',
        severity: 'critical',
        symbol: 'TSLA',
        message: 'VaR 95% exceeded -0.05 threshold',
        currentValue: -0.067,
        threshold: -0.05,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'active',
        resolved: false
      },
      {
        id: 'roi-alert-3',
        type: 'drawdown',
        severity: 'warning',
        symbol: 'NVDA',
        message: 'Maximum drawdown approaching limit',
        currentValue: -0.082,
        threshold: -0.1,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'active',
        resolved: false
      },
      {
        id: 'roi-alert-4',
        type: 'performance',
        severity: 'info',
        symbol: 'MSFT',
        message: 'CAGR exceeded 15% target',
        currentValue: 0.167,
        threshold: 0.15,
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        status: 'resolved',
        resolved: true
      }
    ];

    const filteredAlerts = alerts.filter(alert => {
      if (type !== 'all' && alert.type !== type) return false;
      if (status !== 'all' && alert.status !== status) return false;
      return true;
    });

    log.info({ type, status, count: filteredAlerts.length }, 'ROI alerts requested');

    return Response.json({
      alerts: filteredAlerts,
      summary: {
        total: filteredAlerts.length,
        active: filteredAlerts.filter(a => a.status === 'active').length,
        resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
        critical: filteredAlerts.filter(a => a.severity === 'critical').length,
        warning: filteredAlerts.filter(a => a.severity === 'warning').length,
        info: filteredAlerts.filter(a => a.severity === 'info').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch ROI alerts');
    return Response.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, alertId, config } = body;

    if (action === 'create') {
      // Create new ROI alert
      const newAlert = {
        id: `roi-alert-${Date.now()}`,
        type: config?.type || 'performance',
        severity: config?.severity || 'warning',
        symbol: config?.symbol || 'SPY',
        message: config?.message || 'ROI threshold alert',
        currentValue: config?.currentValue || 0,
        threshold: config?.threshold || 0,
        timestamp: new Date().toISOString(),
        status: 'active',
        resolved: false
      };

      log.info({ alertId: newAlert.id, type: newAlert.type }, 'New ROI alert created');

      return Response.json({
        alert: newAlert,
        message: 'ROI alert created successfully'
      }, { status: 201 });
    }

    if (action === 'resolve') {
      // Resolve existing alert
      const resolvedAlert = {
        id: alertId,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'system'
      };

      log.info({ alertId }, 'ROI alert resolved');

      return Response.json({
        alert: resolvedAlert,
        message: 'Alert resolved successfully'
      });
    }

    if (action === 'update') {
      // Update alert configuration
      const updatedAlert = {
        id: alertId,
        threshold: config?.threshold,
        severity: config?.severity,
        updatedAt: new Date().toISOString()
      };

      log.info({ alertId, threshold: config?.threshold }, 'ROI alert updated');

      return Response.json({
        alert: updatedAlert,
        message: 'Alert updated successfully'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to process ROI alert request');
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}