import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="glass-card error-boundary-fallback animate-fade-in">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">This component failed to load. Try refreshing the page.</p>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>

          <style>{`
            .error-boundary-fallback {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              text-align: center;
              min-height: 200px;
              width: 100%;
            }
            .error-icon {
              font-size: 2rem;
              margin-bottom: 1rem;
            }
            .error-title {
              font-size: 1.125rem;
              font-weight: 800;
              margin-bottom: 0.5rem;
              color: var(--text-primary);
            }
            .error-message {
              font-size: 0.875rem;
              color: var(--text-muted);
              margin-bottom: 1.5rem;
              max-width: 280px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
