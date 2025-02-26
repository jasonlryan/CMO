import { AppProvider } from "./context/AppContext";
import { AssessmentLayout } from "./components/AssessmentLayout";
import { Home } from "./views/Home";
import { AssessmentDashboard } from "./views/AssessmentDashboard";
import { ReportViewer } from "./views/ReportViewer";
import { AdminPanel } from "./views/AdminPanel";
import { MaturityStageSettings } from "./views/admin/MaturityStageSettings";
import { DepthLevelSettings } from "./views/admin/DepthLevelSettings";
import { useAppState } from "./context/AppContext";
import Privacy from "./views/Privacy";
import Terms from "./views/Terms";
import Contact from "./views/Contact";
import { useState, useEffect } from "react";

function AppContent() {
  const { state } = useAppState();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Check for URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for URL changes
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Handle direct URL routes first
  if (currentPath === "/privacy") {
    return <Privacy />;
  }

  if (currentPath === "/terms") {
    return <Terms />;
  }

  if (currentPath === "/contact") {
    return <Contact />;
  }

  // Handle application state-based routing
  if (state.uiState.currentView === "admin") {
    switch (state.uiState.adminView) {
      case "maturityStage":
        return <MaturityStageSettings />;
      case "depthLevel":
        return <DepthLevelSettings />;
      default:
        return <AdminPanel />;
    }
  }

  const views = {
    home: <Home />,
    dashboard: <AssessmentDashboard />,
    report: <ReportViewer />,
    admin: <AdminPanel />,
    privacy: <Privacy />,
    terms: <Terms />,
    contact: <Contact />,
  };

  return views[state.uiState.currentView] || views.home;
}

function App() {
  return (
    <AppProvider>
      <AssessmentLayout>
        <AppContent />
      </AssessmentLayout>
    </AppProvider>
  );
}

export default App;
