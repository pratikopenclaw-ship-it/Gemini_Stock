'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw, Terminal } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono">
          <div className="glass-card max-w-2xl w-full p-8 border-red-500/30 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="font-orbitron text-xl font-black tracking-tighter text-white">
                  TERMINAL <span className="text-red-500">CRITICAL FAILURE</span>
                </h1>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  System Exception Detected • Error Code: 0x80042101
                </p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-6 border border-white/5 mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Terminal className="w-4 h-4 text-red-500/60" />
                <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Stack Trace Output</span>
              </div>
              <div className="text-xs text-red-400/80 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                {this.state.error?.message || 'Unknown system interruption occurred during data processing.'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 bg-red-500 text-black font-bold rounded-lg text-xs font-orbitron hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>REBOOT TERMINAL</span>
              </button>
              <p className="text-[10px] text-white/20 uppercase tracking-widest text-center sm:text-left">
                If the failure persists, please contact the Quant Systems Administrator.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
