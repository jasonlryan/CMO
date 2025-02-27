import React from 'react';
import { Sliders, Layers } from 'lucide-react';
import { useAppState } from '../context/AppContext';

export function AdminPanel() {
  const { dispatch } = useAppState();

  const handleNavigate = (view: 'maturityStage' | 'depthLevel') => {
    dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => handleNavigate('maturityStage')}
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Sliders className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Maturity Stage Skills
              </h3>
              <p className="text-gray-600">
                Configure skill weightings and requirements for different company stages
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleNavigate('depthLevel')}
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Depth Level Settings
              </h3>
              <p className="text-gray-600">
                Manage required depth levels for skills across different stages
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}