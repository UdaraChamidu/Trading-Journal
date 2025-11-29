import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center p-8 bg-slate-800 rounded-lg border border-red-500 max-w-md mx-4">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-4">
              The page encountered an error and couldn't load properly.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reload Page
            </button>
            <details className="mt-4 text-left">
              <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
                Error Details
              </summary>
              <pre className="text-xs text-red-300 mt-2 p-2 bg-slate-900 rounded overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
