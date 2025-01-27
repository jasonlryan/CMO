export interface CMOProfile {
  id: string;
  name: string;
  current_role: string;
  years_experience: number;
  industry: string;
  organization_type: 'B2B' | 'B2C' | 'Hybrid';
  skills: {
    hardSkills: Record<string, number>;
    softSkills: Record<string, number>;
  };
  skill_depth_levels: {
    strategic_understanding: Record<string, number>;
    managerial_oversight: Record<string, number>;
    conversational_proficiency: Record<string, number>;
    executional_expertise: Record<string, number>;
  };
  key_strengths: string[];
  growth_areas: string[];
  maturity_stage: {
    best_fit: string;
    alignment_reasons: string[];
  };
}

export interface AssessmentResult {
  id: string;
  profile_id: string;
  overall_score: number;
  category_scores: {
    hardSkills: number;
    softSkills: number;
  };
  recommendations: string[];
}

export type MaturityStage = {
  id: string;
  stage: 'Early-Stage' | 'Growth' | 'Scale-Up' | 'Enterprise';
  description: string;
  skill_weightings: {
    hardSkills: number;
    softSkills: number;
    leadershipSkills: number;
    commercialAcumen: number;
  };
};

export interface ProcessedTranscript {
  keyPoints: string[];
  experience: {
    years: number;
    roles: string[];
  };
  skills: {
    hardSkills: Record<string, number>;
    softSkills: Record<string, number>;
  };
  skill_depth_levels: {
    strategic_understanding: Record<string, number>;
    managerial_oversight: Record<string, number>;
    conversational_proficiency: Record<string, number>;
    executional_expertise: Record<string, number>;
  };
  industry?: string;
  organization_type?: 'B2B' | 'B2C' | 'Hybrid';
  key_strengths?: string[];
  maturity_stage?: {
    best_fit: string;
    alignment_reasons: string[];
  };
} 