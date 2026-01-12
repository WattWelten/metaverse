import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Wrapper component that provides error boundary functionality
 * Use this to wrap critical components that might fail
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
}: ErrorBoundaryWrapperProps): JSX.Element {
  return (
    <ErrorBoundary
      fallback={fallback}
      onRetry={() => {
        // Retry by reloading the component
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
