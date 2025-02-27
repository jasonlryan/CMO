import React, { createContext, useContext, useReducer } from "react";
import type { AppState } from "../types";

type Action =
  | { type: "SET_PROFILE"; payload: AppState["currentProfile"] }
  | { type: "SET_ASSESSMENTS"; payload: AppState["assessmentList"] }
  | { type: "SET_CURRENT_ASSESSMENT"; payload: AppState["currentAssessment"] }
  | { type: "SET_VIEW"; payload: AppState["uiState"]["currentView"] }
  | { type: "SET_ADMIN_VIEW"; payload: AppState["uiState"]["adminView"] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOADING_MESSAGE"; payload: string | undefined }
  | { type: "SET_ERROR"; payload: Error | null };

const initialState: AppState = {
  currentProfile: null,
  currentAssessment: null,
  assessmentList: [],
  uiState: {
    currentView: "home",
    adminView: null,
    loading: false,
    error: null,
  },
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, currentProfile: action.payload };
    case "SET_ASSESSMENTS":
      return { ...state, assessmentList: action.payload };
    case "SET_CURRENT_ASSESSMENT":
      return { ...state, currentAssessment: action.payload };
    case "SET_VIEW":
      return {
        ...state,
        uiState: { ...state.uiState, currentView: action.payload },
      };
    case "SET_ADMIN_VIEW":
      return {
        ...state,
        uiState: { ...state.uiState, adminView: action.payload },
      };
    case "SET_LOADING":
      return {
        ...state,
        uiState: { ...state.uiState, loading: action.payload },
      };
    case "SET_LOADING_MESSAGE":
      return {
        ...state,
        uiState: { ...state.uiState, loadingMessage: action.payload },
      };
    case "SET_ERROR":
      return { ...state, uiState: { ...state.uiState, error: action.payload } };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
}
