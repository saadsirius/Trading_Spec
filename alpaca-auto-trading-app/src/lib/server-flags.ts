/**
 * File: src/lib/server-flags.ts
 * Description: Server-side feature flags.
 */
export interface ServerFlags {
  enableAI: boolean;
  enableBacktesting: boolean;
  enableAlerts: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableWebVitals: boolean;
  enablePrefetch: boolean;
  enableHoudini: boolean;
}

export const serverFlags: ServerFlags = {
  enableAI: process.env.ENABLE_AI === 'true',
  enableBacktesting: process.env.ENABLE_BACKTESTING === 'true',
  enableAlerts: process.env.ENABLE_ALERTS === 'true',
  enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  enableWebVitals: process.env.ENABLE_WEB_VITALS === 'true',
  enablePrefetch: process.env.ENABLE_PREFETCH === 'true',
  enableHoudini: process.env.ENABLE_HOUDINI === 'true',
};

export function getServerFlags(): ServerFlags {
  return { ...serverFlags };
}