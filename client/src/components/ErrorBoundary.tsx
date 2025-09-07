'use client'
import React, { ReactNode, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface ErrorHandlerProps {
  children: ReactNode;
}

class ErrorHandler extends React.Component<ErrorHandlerProps> {
  state = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can log the error to an error reporting service
  }

  componentDidMount() {
    const handleError = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error?.status === 406) {
        console.error('406 Error: Server cannot provide acceptable response');
        toast.error('Data format error. Please refresh and try again.');
      } else if (error?.status === 404) {
        console.error('404 Error: Resource not found');
        // Don't show toast for image 404s as they're less critical
      }
    };

    window.addEventListener('unhandledrejection', handleError);
    this._handleError = handleError;
  }

  componentWillUnmount() {
    if (this._handleError) {
      window.removeEventListener('unhandledrejection', this._handleError);
    }
  }

  private _handleError?: (event: PromiseRejectionEvent) => void;

  render() {
    if (this.state?.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorHandler;
