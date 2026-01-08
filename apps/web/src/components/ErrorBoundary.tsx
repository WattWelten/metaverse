import { AppleButton } from '@metaverse/ui';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'Ein unerwarteter Fehler ist aufgetreten';
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
      const isLoadError = errorMessage.includes('load') || errorMessage.includes('Failed to load');

      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 30000,
            padding: '24px',
            fontFamily: 'var(--font-system)',
            animation: 'fadeIn 200ms var(--ease-out)',
          }}
        >
          <div
            className="glass"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '32px',
              borderRadius: '20px',
              background: 'var(--glass-background)',
              backdropFilter: 'var(--glass-backdrop-blur)',
              WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
              border: '1px solid var(--glass-border)',
              textAlign: 'center',
              color: 'var(--color-label)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {isNetworkError ? '🌐' : isLoadError ? '📦' : '⚠️'}
            </div>
            <h2 className="text-title2" style={{ margin: '0 0 8px', color: 'var(--color-label)' }}>
              {isNetworkError
                ? 'Verbindungsfehler'
                : isLoadError
                  ? 'Ladefehler'
                  : 'Ein Fehler ist aufgetreten'}
            </h2>
            <p
              className="text-body"
              style={{ margin: '0 0 24px', color: 'var(--color-label-secondary)' }}
            >
              {isNetworkError
                ? 'Die Verbindung zum Server konnte nicht hergestellt werden. Bitte überprüfe deine Internetverbindung.'
                : isLoadError
                  ? 'Eine Ressource konnte nicht geladen werden. Bitte versuche es erneut.'
                  : errorMessage}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details
                style={{
                  marginBottom: '24px',
                  padding: '16px',
                  background: 'var(--color-fill-primary)',
                  borderRadius: '8px',
                  textAlign: 'left',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <summary
                  className="text-footnote"
                  style={{
                    cursor: 'pointer',
                    marginBottom: '8px',
                    color: 'var(--color-label-secondary)',
                    fontWeight: 600,
                  }}
                >
                  Technische Details (Development)
                </summary>
                <pre
                  style={{
                    overflow: 'auto',
                    fontSize: '11px',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--color-label-secondary)',
                    fontFamily: 'var(--font-mono)',
                    margin: 0,
                    maxHeight: '200px',
                  }}
                >
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <AppleButton variant="secondary" onClick={this.handleReload} style={{ flex: 1 }}>
                Seite neu laden
              </AppleButton>
              {this.props.onRetry && (
                <AppleButton onClick={this.handleReset} style={{ flex: 1 }}>
                  Erneut versuchen
                </AppleButton>
              )}
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
