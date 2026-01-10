import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.log('[Sentry] DSN nicht gesetzt, Sentry deaktiviert');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'development',
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
