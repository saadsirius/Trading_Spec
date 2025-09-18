import { Queue, Worker, JobsOptions } from 'bullmq';
import { redis as connection } from '@/lib/cache/redis';
import { log } from '@/mw/log';

export const qAI = new Queue('ai-tasks', { connection });
export const qBacktest = new Queue('bt-tasks', { connection });

export async function enqueueAI(
  name: string, 
  payload: any, 
  opts: JobsOptions = { 
    attempts: 3, 
    backoff: { type: 'exponential', delay: 500 } 
  }
) {
  return qAI.add(name, payload, opts);
}

export async function enqueueBT(
  name: string, 
  payload: any, 
  opts: JobsOptions = { 
    attempts: 2, 
    backoff: { type: 'fixed', delay: 800 } 
  }
) {
  return qBacktest.add(name, payload, opts);
}

// Workers (Node runtime uniquement) — si mode serverless, lance côté process dédié
if (process.env.NODE_ENV !== 'production') {
  new Worker('ai-tasks', async job => {
    log.info({ jobId: job.id, name: job.name }, 'AI job start');
    // … appeller tes services IA (résumé, suggestions) — ici simple echo
    return { ok: true, input: job.data };
  }, { connection });
  
  new Worker('bt-tasks', async job => {
    log.info({ jobId: job.id, name: job.name }, 'Backtest job start');
    // … exécuter mini backtest (bar-by-bar) via tes services Alpaca
    return { ok: true, stats: { cagr: 0.12, sharpe: 1.2 } };
  }, { connection });
}
