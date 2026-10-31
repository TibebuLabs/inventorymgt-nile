import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simple error boundary — shows a readable message instead of blank screen
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-8">
          <div className="bg-red-950 border border-red-500 rounded-2xl p-8 max-w-xl w-full">
            <h1 className="text-red-400 font-bold text-xl mb-2">
              Application Error
            </h1>
            <p className="text-red-300 text-sm mb-4">
              Something went wrong. Check the browser console for details.
            </p>
            <pre className="bg-black/40 text-red-300 text-xs p-4 rounded-lg overflow-auto">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
