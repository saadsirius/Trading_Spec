import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId') || 'hybrid-1';
    
    // Mock hybrid model data
    const hybridModels = {
      'hybrid-1': {
        id: 'hybrid-1',
        name: 'Neural-Rule Hybrid Model',
        type: 'neural-rules',
        status: 'active',
        components: {
          neural: {
            type: 'LSTM',
            layers: 3,
            neurons: [128, 64, 32],
            accuracy: 0.78,
            confidence: 0.82
          },
          rules: {
            type: 'expert-system',
            rules: 15,
            accuracy: 0.72,
            confidence: 0.75
          },
          ensemble: {
            method: 'weighted-average',
            neuralWeight: 0.6,
            rulesWeight: 0.4,
            accuracy: 0.81,
            confidence: 0.85
          }
        },
        performance: {
          overallAccuracy: 0.81,
          profit: 0.18,
          sharpe: 1.54,
          maxDrawdown: -0.07,
          winRate: 0.73,
          trades: 67
        },
        lastUpdate: new Date().toISOString(),
        config: {
          neuralLearningRate: 0.001,
          rulesThreshold: 0.7,
          ensembleMethod: 'weighted',
          rebalanceFrequency: 'daily'
        }
      },
      'hybrid-2': {
        id: 'hybrid-2',
        name: 'Transformer-Statistical Hybrid',
        type: 'transformer-stats',
        status: 'training',
        components: {
          transformer: {
            type: 'BERT',
            layers: 6,
            attentionHeads: 8,
            accuracy: 0.76,
            confidence: 0.79
          },
          statistical: {
            type: 'arima-garch',
            accuracy: 0.69,
            confidence: 0.71
          },
          ensemble: {
            method: 'stacking',
            accuracy: 0.79,
            confidence: 0.83
          }
        },
        performance: {
          overallAccuracy: 0.79,
          profit: 0.15,
          sharpe: 1.42,
          maxDrawdown: -0.08,
          winRate: 0.70,
          trades: 52
        },
        lastUpdate: new Date().toISOString(),
        config: {
          transformerLayers: 6,
          statisticalWindow: 30,
          ensembleMethod: 'stacking',
          validationSplit: 0.2
        }
      }
    };

    const result = hybridModels[modelId as keyof typeof hybridModels] || Object.values(hybridModels);

    log.info({ modelId, count: Array.isArray(result) ? result.length : 1 }, 'Hybrid models requested');

    return Response.json({
      models: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch hybrid models');
    return Response.json({ error: 'Failed to fetch hybrid models' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config } = body;

    if (action === 'create') {
      // Create new hybrid model
      const newModel = {
        id: `hybrid-${Date.now()}`,
        name: config?.name || 'New Hybrid Model',
        type: config?.type || 'neural-rules',
        status: 'training',
        components: {
          neural: {
            type: config?.neuralType || 'LSTM',
            accuracy: 0,
            confidence: 0
          },
          rules: {
            type: config?.rulesType || 'expert-system',
            accuracy: 0,
            confidence: 0
          },
          ensemble: {
            method: config?.ensembleMethod || 'weighted-average',
            accuracy: 0,
            confidence: 0
          }
        },
        performance: {
          overallAccuracy: 0,
          profit: 0,
          sharpe: 0,
          maxDrawdown: 0,
          winRate: 0,
          trades: 0
        },
        lastUpdate: new Date().toISOString(),
        config: config || {}
      };

      log.info({ modelId: newModel.id, type: newModel.type }, 'New hybrid model created');

      return Response.json({
        model: newModel,
        message: 'Hybrid model created successfully'
      }, { status: 201 });
    }

    if (action === 'retrain') {
      // Retrain existing model
      const retrainResult = {
        modelId: config?.modelId,
        status: 'retraining',
        estimatedTime: '5-10 minutes',
        dataSize: config?.dataSize || '1M samples',
        method: config?.method || 'incremental'
      };

      log.info({ modelId: retrainResult.modelId }, 'Hybrid model retraining started');

      return Response.json({
        retrain: retrainResult,
        message: 'Model retraining started'
      }, { status: 201 });
    }

    if (action === 'ensemble') {
      // Update ensemble weights
      const ensembleResult = {
        modelId: config?.modelId,
        newWeights: config?.weights || { neural: 0.6, rules: 0.4 },
        status: 'updating',
        estimatedTime: '1-2 minutes'
      };

      log.info({ modelId: ensembleResult.modelId, weights: ensembleResult.newWeights }, 'Ensemble weights updated');

      return Response.json({
        ensemble: ensembleResult,
        message: 'Ensemble weights updated'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to process hybrid model request');
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
