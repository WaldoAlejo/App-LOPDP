import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global Error Boundary to catch React render errors
 * Prevents the entire app from crashing to a blank screen
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development; in production this would go to a monitoring service
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Algo salió mal
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Ocurrió un error inesperado en la aplicación. Por favor intenta recargar la página.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 rounded-lg bg-gray-100 p-3 text-left">
                <p className="text-xs font-mono text-red-700">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={this.handleGoHome}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ir al inicio
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-lg bg-servi-green px-4 py-2 text-sm font-medium text-white hover:bg-servi-green-dark"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
