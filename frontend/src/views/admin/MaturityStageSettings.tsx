import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '../../context/AppContext';

const COMPANY_STAGES = ['Early-Stage', 'Growth', 'Scale-Up', 'Enterprise'] as const;
const SKILL_CATEGORIES = [
  'hardSkills',
  'softSkills',
  'leadershipSkills',
  'commercialAcumen',
  'technical_capability',
  'leadership_capability',
  'investor_readiness',
  'tech_readiness',
] as const;

const DEFAULT_WEIGHTS = {
  "Early-Stage": {
    "hardSkills": 0.4,
    "softSkills": 0.2,
    "leadershipSkills": 0.2,
    "commercialAcumen": 0.2,
    "technical_capability": 0.7,
    "leadership_capability": 0.6,
    "investor_readiness": 0.5,
    "tech_readiness": 0.6
  },
  "Growth": {
    "hardSkills": 0.3,
    "softSkills": 0.3,
    "leadershipSkills": 0.2,
    "commercialAcumen": 0.2,
    "technical_capability": 0.8,
    "leadership_capability": 0.7,
    "investor_readiness": 0.6,
    "tech_readiness": 0.7
  },
  "Scale-Up": {
    "hardSkills": 0.2,
    "softSkills": 0.3,
    "leadershipSkills": 0.3,
    "commercialAcumen": 0.2,
    "technical_capability": 0.9,
    "leadership_capability": 0.8,
    "investor_readiness": 0.7,
    "tech_readiness": 0.8
  },
  "Enterprise": {
    "hardSkills": 0.2,
    "softSkills": 0.2,
    "leadershipSkills": 0.3,
    "commercialAcumen": 0.3,
    "technical_capability": 0.9,
    "leadership_capability": 0.9,
    "investor_readiness": 0.8,
    "tech_readiness": 0.9
  }
};

export function MaturityStageSettings() {
  const { dispatch } = useAppState();
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [selectedStage, setSelectedStage] = useState<keyof typeof DEFAULT_WEIGHTS>('Early-Stage');

  const handleWeightChange = (category: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 1) return;

    setWeights(prev => ({
      ...prev,
      [selectedStage]: {
        ...prev[selectedStage],
        [category]: numValue
      }
    }));
  };

  const handleSave = () => {
    // TODO: Implement save to backend
    console.log('Saving weights:', weights);
  };

  const handleBack = () => {
    dispatch({ type: 'SET_ADMIN_VIEW', payload: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Maturity Stage Skills Settings</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-4 mb-6">
          {COMPANY_STAGES.map(stage => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 rounded-lg ${
                selectedStage === stage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {SKILL_CATEGORIES.map(category => (
            <div key={category} className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium text-gray-700">
                {category.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}:
              </label>
              <input
                type="number"
                value={weights[selectedStage][category]}
                onChange={(e) => handleWeightChange(category, e.target.value)}
                step="0.1"
                min="0"
                max="1"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${weights[selectedStage][category] * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {(weights[selectedStage][category] * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}