import React from 'react';
import { AppProvider } from './context/AppContext';
import { AssessmentLayout } from './components/AssessmentLayout';
import { Home } from './views/Home';
import { AssessmentDashboard } from './views/AssessmentDashboard';
import { ReportViewer } from './views/ReportViewer';
import { AdminPanel } from './views/AdminPanel';
import { MaturityStageSettings } from './views/admin/MaturityStageSettings';
import { DepthLevelSettings } from './views/admin/DepthLevelSettings';
import { useAppState } from './context/AppContext';

function AppContent() {
  const { state } = useAppState();

  if (state.uiState.currentView === 'admin') {
    switch (state.uiState.adminView) {
      case 'maturityStage':
        return <MaturityStageSettings />;
      case 'depthLevel':
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
  };

  return views[state.uiState.currentView];
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