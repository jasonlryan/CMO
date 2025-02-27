import React from "react";
import { Navigation } from "./Navigation";
import { ErrorBoundary } from "./ErrorBoundary";
import { useAppState } from "../context/AppContext";
import { Loader2, AlertCircle, XCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export function AssessmentLayout({ children }: Props) {
  const { state, dispatch } = useAppState();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          {state.uiState.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">
                  {state.uiState.error.message}
                </p>
              </div>
              <button
                onClick={() => dispatch({ type: "SET_ERROR", payload: null })}
                className="text-red-500 hover:text-red-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          )}
          {state.uiState.loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">
                {state.uiState.loadingMessage || "Loading..."}
              </p>
            </div>
          ) : (
            children
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
