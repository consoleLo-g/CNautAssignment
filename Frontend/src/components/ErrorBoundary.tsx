// src/components/ErrorBoundary.tsx
import React from 'react';

class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20 }}>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
