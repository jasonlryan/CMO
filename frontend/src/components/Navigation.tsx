import React from 'react';
import { useAppState } from '../context/AppContext';
import { Home, LayoutDashboard, Settings } from 'lucide-react';

export function Navigation() {
  const { state, dispatch } = useAppState();

  const navItems = [
    { view: 'home' as const, label: 'Home', icon: Home },
    { view: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { view: 'admin' as const, label: 'Admin', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Assessment Viewer</h1>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map(({ view, label, icon: Icon }) => (
                <button
                  key={view}
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: view })}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    state.uiState.currentView === view
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}