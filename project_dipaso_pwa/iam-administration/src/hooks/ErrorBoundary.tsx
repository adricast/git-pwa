import * as React from 'react';

interface ErrorBoundaryProps {
  fallback: React.ReactNode; // Qué mostrar si hay error
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Cambia el estado para renderizar el fallback UI
    console.log(error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error);
    console.error("Stack trace:", info.componentStack);
    // Aquí podrías enviar el error a un servicio de logging
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback; // UI alternativo
    }
    return this.props.children;
  }
}
