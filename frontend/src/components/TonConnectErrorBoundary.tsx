import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TonConnectErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TON Connect Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1B41] text-white p-6">
          <div className="max-w-md w-full bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4 text-[#F47621]">
              Wallet Connection Error
            </h2>
            <p className="text-white/80 mb-6">
              {this.state.error?.message || 'An unexpected error occurred while connecting to your wallet.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#F47621] hover:bg-[#F47621]/90 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
