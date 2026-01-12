/**
 * Centralized error reporting utility
 * Supports multiple backends (Sentry, console, custom)
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  roomId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Report an error to the error reporting service
 */
export function reportError(
  error: Error | string,
  severity: ErrorSeverity = 'medium',
  context?: ErrorContext
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Console logging (always)
  const logLevel = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
  console[logLevel]('[ErrorReporting]', errorMessage, {
    severity,
    context,
    stack: errorStack,
  });

  // Sentry integration (if available)
  if (typeof window !== 'undefined') {
    const sentry = (
      window as Window & {
        Sentry?: { captureException: (error: Error, context?: unknown) => void };
      }
    ).Sentry;
    if (sentry && error instanceof Error) {
      sentry.captureException(error, {
        level: severity,
        tags: context,
        extra: context?.metadata,
      });
    }
  }

  // Custom error reporting (if available)
  if (
    typeof window !== 'undefined' &&
    (window as Window & { reportError?: (error: Error) => void }).reportError
  ) {
    const errorObj = error instanceof Error ? error : new Error(error);
    (window as Window & { reportError: (error: Error) => void }).reportError(errorObj);
  }

  // Store in window.__errors for E2E tests
  if (
    typeof window !== 'undefined' &&
    (window as Window & { __TEST_MODE__?: boolean }).__TEST_MODE__
  ) {
    if (!window.__errors) {
      window.__errors = [];
    }
    window.__errors.push({
      message: errorMessage,
      stack: errorStack,
      severity,
      context,
      timestamp: Date.now(),
    });
  }
}

/**
 * Report a warning (non-critical error)
 */
export function reportWarning(message: string, context?: ErrorContext): void {
  reportError(message, 'low', context);
}

/**
 * Report a critical error (requires immediate attention)
 */
export function reportCritical(error: Error | string, context?: ErrorContext): void {
  reportError(error, 'critical', context);
}
