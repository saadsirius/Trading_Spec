import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');
    
    // Mock meta-learning data
    const metaModels = [
      {
        id: 'meta-1',
        name: 'MAML-Lite Trading Model',
        type: 'few-shot',
        status: 'training',
        performance: {
          baseAccuracy: 0.65,
          adaptedAccuracy: 0.78,
          adaptationTime: 2.3,
          memoryUsage: 0.45
        },
        lastUpdate: new Date().toISOString(),
        config: {
          innerSteps: 5,
          learningRate: 0.01,
          metaLearningRate: 0.001,
          adaptationThreshold: 0.7
        },
        tasks: [
          { symbol: 'AAPL', adaptationScore: 0.82, confidence: 0.89 },
          { symbol: 'MSFT', adaptationScore: 0.75, confidence: 0.76 },
          { symbol: 'GOOGL', adaptationScore: 0.79, confidence: 0.83 }
        ]
      },
      {
        id: 'meta-2',
        name: 'Reptile Market Regime Model',
        type: 'regime-detection',
        status: 'active',
        performance: {
          baseAccuracy: 0.72,
          adaptedAccuracy: 0.85,
          adaptationTime: 1.8,
          memoryUsage: 0.38
        },
        lastUpdate: new Date().toISOString(),
        config: {
          innerSteps: 3,
          learningRate: 0.005,
          metaLearningRate: 0.0005,
          regimeThreshold: 0.6
        },
        tasks: [
          { regime: 'bull', adaptationScore: 0.88, confidence: 0.92 },
          { regime: 'bear', adaptationScore: 0.81, confidence: 0.85 },
          { regime: 'sideways', adaptationScore: 0.76, confidence: 0.79 }
        ]
      }
    ];

    const result = modelId 
      ? metaModels.find(m => m.id === modelId)
      : metaModels;

    log.info({ modelId, count: Array.isArray(result) ? result.length : 1 }, 'Meta-learning models requested');

    return Response.json({
      models: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch meta-learning models');
    return Response.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, config, trainingData } = body;

    // Validate required fields
    if (!name || !type || !config) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start meta-learning training
    const newModel = {
      id: `meta-${Date.now()}`,
      name,
      type,
      status: 'training',
      performance: {
        baseAccuracy: 0,
        adaptedAccuracy: 0,
        adaptationTime: 0,
        memoryUsage: 0
      },
      lastUpdate: new Date().toISOString(),
      config,
      trainingProgress: {
        epoch: 0,
        totalEpochs: 100,
        currentLoss: 0,
        bestAccuracy: 0
      }
    };

    log.info({ modelId: newModel.id, type }, 'Meta-learning model training started');

    return Response.json({
      model: newModel,
      message: 'Meta-learning training started'
    }, { status: 201 });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to start meta-learning training');
    return Response.json({ error: 'Failed to start training' }, { status: 500 });
  }
}
