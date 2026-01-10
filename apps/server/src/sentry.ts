import * as Sentry from '@sentry/node';

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log('[Sentry] DSN nicht gesetzt, Sentry deaktiviert');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1, // 10% für Performance-Monitoring
    beforeSend(event) {
      // Nur Errors senden, keine Warnings
      if (event.level === 'warning') {
        return null;
      }
      return event;
    },
  });

  console.log('[Sentry] Initialisiert');
}
