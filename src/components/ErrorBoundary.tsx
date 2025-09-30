'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
          <div className="glass max-w-lg w-full p-8 rounded-2xl text-center space-y-4 animate-fade-in">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="text-slate-300">
              We encountered an unexpected error. Please refresh the page to try
              again.
            </p>
            {this.state.error && (
              <details className="text-left mt-4">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
                  Error details
                </summary>
                <pre className="mt-2 p-4 bg-slate-900/50 rounded-lg text-xs text-red-300 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
