"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

/**
 * Error boundary specifically designed to catch and retry ChunkLoadErrors.
 * These errors often occur during deployments or on restrictive networks (proxies).
 */
export class ChunkErrorErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    // Only catch ChunkLoadErrors specifically
    if (
      error.name === "ChunkLoadError" ||
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Loading CSS chunk")
    ) {
      return { hasError: true, error };
    }
    // Let other errors propagate to the default error boundary if any
    throw error;
  }

  componentDidCatch(error: any, errorInfo: any) {
    if (
      error.name === "ChunkLoadError" ||
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Loading CSS chunk")
    ) {
      const retryKey = "app-chunk-retry-count";
      const lastRetryStr = sessionStorage.getItem(retryKey);
      const retryCount = lastRetryStr ? parseInt(lastRetryStr, 10) : 0;

      if (retryCount < 3) {
        console.warn(`ChunkLoadError detected. Retry attempt ${retryCount + 1} of 3...`);
        sessionStorage.setItem(retryKey, (retryCount + 1).toString());

        // Brief delay before reload to avoid thrashing
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error("ChunkLoadError: Maximum retry attempts reached.", error);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 m-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Network issue detected
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
            We're having trouble loading parts of the application. This could be due to a restrictive network or a recent update.
          </p>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => {
                sessionStorage.removeItem("app-chunk-retry-count");
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors shadow-md"
            >
              Reload Application
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
