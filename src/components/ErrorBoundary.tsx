import React, { Component, ReactNode } from "react";

interface ErrorBoundaryState {
    hasError: boolean;
    errorMsg?: string;
}

interface ErrorDisplayProps {
    feature: string;
    msg?: string;
}

interface ErrorBoundaryProps {
    feature: string;
    fallback?: React.FC<ErrorDisplayProps>;
    children?: ReactNode;
}

const errorDisplay: React.FC<ErrorDisplayProps> = ({feature, msg}) => {
    return (
        <>
            <h1>☠️ Error ☠️</h1>
            <h2>{`Encountered error in ${feature}`}</h2>
            {msg && <h2>{` - with message: ${msg}`}</h2>}
        </>
    );
};

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
            ? this.props.fallback({feature: this.props.feature, msg: this.state.errorMsg})
            : errorDisplay({feature: this.props.feature, msg: this.state.errorMsg})
        );
      }
  
      return this.props.children;
    }
}
