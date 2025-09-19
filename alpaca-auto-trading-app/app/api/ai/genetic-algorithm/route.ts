import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const generation = searchParams.get('generation') || 'latest';
    
    // Mock genetic algorithm data
    const gaResults = {
      currentGeneration: 45,
      bestFitness: 0.89,
      averageFitness: 0.72,
      population: [
        {
          id: 'genome-1',
          fitness: 0.89,
          genes: {
            rsi_period: 14,
            macd_fast: 12,
            macd_slow: 26,
            stop_loss: 0.02,
            take_profit: 0.04,
            position_size: 0.1
          },
          performance: {
            profit: 0.23,
            sharpe: 1.67,
            maxDrawdown: -0.06,
            winRate: 0.74
          }
        },
        {
          id: 'genome-2',
          fitness: 0.85,
          genes: {
            rsi_period: 21,
            macd_fast: 8,
            macd_slow: 21,
            stop_loss: 0.015,
            take_profit: 0.035,
            position_size: 0.08
          },
          performance: {
            profit: 0.19,
            sharpe: 1.52,
            maxDrawdown: -0.08,
            winRate: 0.71
          }
        },
        {
          id: 'genome-3',
          fitness: 0.82,
          genes: {
            rsi_period: 9,
            macd_fast: 5,
            macd_slow: 35,
            stop_loss: 0.025,
            take_profit: 0.05,
            position_size: 0.12
          },
          performance: {
            profit: 0.21,
            sharpe: 1.43,
            maxDrawdown: -0.09,
            winRate: 0.68
          }
        }
      ],
      evolution: {
        mutationRate: 0.1,
        crossoverRate: 0.8,
        selectionPressure: 2.0,
        elitism: 0.2
      },
      statistics: {
        totalGenerations: 45,
        convergenceRate: 0.95,
        diversity: 0.34,
        stagnationCount: 3
      }
    };

    log.info({ generation, currentGen: gaResults.currentGeneration }, 'Genetic algorithm results requested');

    return Response.json({
      results: gaResults,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch genetic algorithm results');
    return Response.json({ error: 'Failed to fetch GA results' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config } = body;

    if (action === 'evolve') {
      // Start new evolution cycle
      const evolutionResult = {
        generation: 46,
        status: 'evolving',
        estimatedTime: '2-3 minutes',
        populationSize: config?.populationSize || 50,
        objectives: config?.objectives || ['profit', 'sharpe', 'drawdown'],
        constraints: config?.constraints || {
          maxDrawdown: 0.1,
          minWinRate: 0.6,
          maxPositionSize: 0.2
        }
      };

      log.info({ generation: evolutionResult.generation }, 'Genetic algorithm evolution started');

      return Response.json({
        evolution: evolutionResult,
        message: 'Evolution cycle started'
      }, { status: 201 });
    }

    if (action === 'optimize') {
      // Optimize specific parameters
      const optimizationResult = {
        target: config?.target || 'profit',
        method: 'NSGA-II',
        status: 'optimizing',
        parameters: config?.parameters || ['rsi_period', 'macd_fast', 'stop_loss'],
        estimatedTime: '1-2 minutes'
      };

      log.info({ target: optimizationResult.target }, 'Genetic algorithm optimization started');

      return Response.json({
        optimization: optimizationResult,
        message: 'Optimization started'
      }, { status: 201 });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to start genetic algorithm operation');
    return Response.json({ error: 'Failed to start GA operation' }, { status: 500 });
  }
}
