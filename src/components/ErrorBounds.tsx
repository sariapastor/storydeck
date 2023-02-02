import React, { Component, ReactNode } from "react";

interface ErrorDisplayProps {
  feature?: string;
  msg?: string;
}

const errorDisplay: React.FC<ErrorDisplayProps> = ({feature, msg}) => {
  return (
    <>
      <h1>☠️ Error ☠️</h1>
      <h2>{`Encountered error on ${feature ? feature : ''} render`}</h2>
      {msg && <h2>{` - with message: ${msg}`}</h2>}
    </>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg?: string;
}

interface ErrorBoundaryProps {
  name?: string;
  fallback?: React.FC<ErrorDisplayProps>;
  children?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }

  render() {
    if (this.state.hasError) {
      return ( this.props.fallback 
          ? this.props.fallback({feature: this.props.name, msg: this.state.errorMsg})
          : errorDisplay({feature: this.props.name, msg: this.state.errorMsg})
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary(WrappedFC: React.FC) {
  return class ErrorBoundedComponent extends React.Component {
    constructor(props: ErrorBoundaryProps) {
      super(props);
    }

    render() {
      return (
        <ErrorBoundary {...this.props}>
          <WrappedFC />
        </ErrorBoundary>
      );
    }
  };
}
