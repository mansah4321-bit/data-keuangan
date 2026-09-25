import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetData = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0714] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1b0629] border border-purple-500/30 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Terjadi Kendala Memuat Aplikasi</h2>
              <p className="text-xs text-purple-200/80">
                Aplikasi mengalami kesalahan saat merender data. Jangan khawatir, data Anda tetap aman.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-purple-950/70 border border-purple-800/50 rounded-xl text-left text-xs font-mono text-purple-200 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-purple-900/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                onClick={this.handleResetData}
                className="py-2.5 px-4 bg-purple-900/50 hover:bg-rose-900/50 text-purple-200 hover:text-white border border-purple-700/50 rounded-xl font-medium text-xs transition"
              >
                Reset Memori Lokal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
