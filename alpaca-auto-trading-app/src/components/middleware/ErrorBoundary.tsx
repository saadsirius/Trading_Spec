'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="ds-card p-4">
          <div className="text-rose-400 font-semibold mb-2">
            Something went wrong
          </div>
          <div className="text-sm text-gray-400 mb-3">
            An error occurred while rendering this component.
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-400 hover:text-gray-300 mb-2">
                Error Details (Development)
              </summary>
              <div className="bg-gray-800 p-2 rounded font-mono text-rose-400">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <button
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            className="mt-3 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
