export interface CMOProfile {
  id: string;
  name: string;
  organization: string;
  assessmentDate: string;
}

export interface Assessment {
  id: string;
  profileId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  name: string;
  score: number;
  maxScore: number;
  skills: Skill[];
}

export interface Skill {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  impact: string;
  timeframe: string;
}

export interface APIError {
  code: string;
  message: string;
}

export type APIResponse<T> = {
  data?: T;
  error?: APIError;
};

export interface AppState {
  currentProfile: CMOProfile | null;
  currentAssessment: string | null;
  assessmentList: Assessment[];
  uiState: {
    currentView: 'home' | 'dashboard' | 'report' | 'admin';
    adminView: 'maturityStage' | 'depthLevel' | null;
    loading: boolean;
    loadingMessage?: string;
    error: Error | null;
  };
}

export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

export interface GapDataPoint {
  name: string;
  current: number;
  required: number;
  gap: number;
}

export interface GrowthOpportunity {
  area: string;
  description: string;
  actions: string[];
}

export interface AssessmentReport {
  id: string;
  candidateName: string;
  overallScore: number;
  radarData: RadarDataPoint[];
  gapData: GapDataPoint[];
  strengths: string[];
  weaknesses: string[];
  developmentAreas: string[];
  growthOpportunities: GrowthOpportunity[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}