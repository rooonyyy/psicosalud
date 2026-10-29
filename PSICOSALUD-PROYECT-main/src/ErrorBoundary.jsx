import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 bg-[#ffebee] text-[#c62828] font-mono min-h-screen">
          <h2>Algo salió mal en la aplicación (Crash)</h2>
          <details className="whitespace-pre-wrap">
            <summary>Ver detalles del error</summary>
            <br />
            <strong>Mensaje:</strong> {this.state.error && this.state.error.toString()}
            <br />
            <br />
            <strong>Stack trace:</strong>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
