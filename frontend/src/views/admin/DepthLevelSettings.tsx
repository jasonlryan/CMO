import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '../../context/AppContext';

const COMPANY_STAGES = ['Early-Stage', 'Growth', 'Scale-Up', 'Enterprise'] as const;
const SKILL_CATEGORIES = ['hardSkills', 'softSkills', 'leadershipSkills', 'commercialAcumen'] as const;

const DEFAULT_DEPTH_LEVELS = {
  "Early-Stage": {
    "hardSkills": {
      "marketing_strategy": 4,
      "digital_marketing": 4,
      "data_analytics": 4,
      "brand_development": 4,
      "marketing_operations": 4,
      "budget_management": 4
    },
    "softSkills": {
      "communication": 3,
      "strategic_thinking": 3,
      "stakeholder_management": 4,
      "team_development": 4
    },
    "leadershipSkills": {
      "vision_setting": 3,
      "team_development": 4,
      "change_management": 3,
      "strategic_influence": 3,
      "organizational_design": 3
    },
    "commercialAcumen": {
      "financial_modeling": 4,
      "market_sizing": 4,
      "revenue_optimization": 4,
      "resource_allocation": 4,
      "budget_management": 4
    }
  },
  // ... other stages with their respective depth levels
};

export function DepthLevelSettings() {
  const { dispatch } = useAppState();
  const [depthLevels, setDepthLevels] = useState(DEFAULT_DEPTH_LEVELS);
  const [selectedStage, setSelectedStage] = useState<keyof typeof DEFAULT_DEPTH_LEVELS>('Early-Stage');
  const [selectedCategory, setSelectedCategory] = useState<typeof SKILL_CATEGORIES[number]>('hardSkills');

  const handleDepthChange = (skill: string, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1 || numValue > 4) return;

    setDepthLevels(prev => ({
      ...prev,
      [selectedStage]: {
        ...prev[selectedStage],
        [selectedCategory]: {
          ...prev[selectedStage][selectedCategory],
          [skill]: numValue
        }
      }
    }));
  };

  const handleSave = () => {
    // TODO: Implement save to backend
    console.log('Saving depth levels:', depthLevels);
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
        <h2 className="text-2xl font-bold text-gray-900">Depth Level Settings</h2>
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

        <div className="flex space-x-4 mb-6">
          {SKILL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.split(/(?=[A-Z])/).join(' ')}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {Object.entries(depthLevels[selectedStage][selectedCategory]).map(([skill, level]) => (
            <div key={skill} className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium text-gray-700">
                {skill.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}:
              </label>
              <input
                type="number"
                value={level}
                onChange={(e) => handleDepthChange(skill, e.target.value)}
                min="1"
                max="4"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex-1 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(depth => (
                  <div
                    key={depth}
                    className={`h-2 rounded-full ${
                      depth <= level ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">Level {level}</span>
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