import React from 'react';
import ReactDOM from 'react-dom/client';

import { initSentry } from './sentry.js';
import { App } from './App';
import './index.css';
import './styles/design-system.css';
import './styles/apple.css';

// Initialize Sentry early
initSentry();

// Test hooks for E2E tests (only in development/test environment)
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__test = {
    lastAvatarUpdate: undefined as unknown,
    emit(event: string, payload: unknown) {
      document.dispatchEvent(new CustomEvent(event, { detail: payload }));
    },
    on(event: string, callback: (payload: unknown) => void) {
      document.addEventListener(event, ((e: CustomEvent) => {
        callback(e.detail);
      }) as EventListener);
    },
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
