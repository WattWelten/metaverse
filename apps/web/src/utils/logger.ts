/**
 * Centralized logging utility
 * In production, logs are filtered based on log level
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL: LogLevel =
  (import.meta.env.VITE_LOG_LEVEL as LogLevel) || (import.meta.env.DEV ? 'debug' : 'warn');

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[LOG_LEVEL];
}

export const logger = {
  debug: (...args: unknown[]): void => {
    if (shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  },
  log: (...args: unknown[]): void => {
    if (shouldLog('info')) {
      console.log('[INFO]', ...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (shouldLog('info')) {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  },
};
