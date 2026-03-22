'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="glass-card p-8 max-w-md w-full border-red-500/50">
            <h2 className="font-orbitron text-xl font-bold text-red-500 mb-4 tracking-wider">
              SYSTEM CRITICAL ERROR
            </h2>
            <div className="bg-black/40 p-4 rounded-lg border border-red-500/20 mb-6">
              <p className="font-mono text-xs text-red-400/80 break-words">
                {this.state.error?.message || 'Unknown system failure detected.'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-lg font-orbitron text-xs font-bold text-white transition-all"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
