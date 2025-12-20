import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
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
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            backgroundColor: '#1a1a1a',
            color: '#fff',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            ⚠️ Ein Fehler ist aufgetreten
          </h1>
          <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {this.state.error?.message || 'Unbekannter Fehler'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '4px',
                maxWidth: '800px',
                width: '100%',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Stack Trace (Development)
              </summary>
              <pre
                style={{
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {this.state.error?.stack}
                {'\n\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4a9eff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

