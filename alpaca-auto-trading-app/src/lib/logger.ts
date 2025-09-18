import pino from 'pino';

export const log = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'production' 
    ? undefined 
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
});

// Helper pour logger les erreurs avec contexte
export const logError = (error: unknown, context?: Record<string, any>) => {
  if (error instanceof Error) {
    log.error({ error: error.message, stack: error.stack, ...context });
  } else {
    log.error({ error: String(error), ...context });
  }
};

// Helper pour logger les métriques
export const logMetric = (metric: string, value: number, tags?: Record<string, string>) => {
  log.info({ metric, value, tags, type: 'metric' });
};
