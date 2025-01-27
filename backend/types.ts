// Define skill structures first
export type LeadershipSkills = {
  vision_setting: number;
  team_development: number;
  change_management: number;
  strategic_influence: number;
  organizational_design: number;
};

export type CommercialSkills = {
  financial_modeling: number;
  market_sizing: number;
  revenue_optimization: number;
  resource_allocation: number;
  budget_management: number;
};

export type InvestorCapabilities = {
  storytelling: number;
  metrics_mastery: number;
  market_knowledge: number;
  fundraising_experience: number;
};

export type TechReadiness = {
  ai_understanding: number;
  data_driven_decisions: number;
  martech_implementation: number;
  automation_strategy: number;
};

export type SkillDepthLevel = {
  strategic_understanding: number;
  managerial_oversight: number;
  conversational_proficiency: number;
  executional_expertise: number;
};

export type CMOSkills = {
  hardSkills: Record<string, number>;
  softSkills: Record<string, number>;
  leadershipSkills: LeadershipSkills;
  commercialAcumen: CommercialSkills;
};

// Now update the main interfaces
export interface CMOProfile {
  id: string;
  name: string;
  current_role: string;
  years_experience: number;
  industry: string;
  organization_type: 'B2B' | 'B2C' | 'Hybrid';
  skills: CMOSkills;
  investor_capabilities: InvestorCapabilities;
  tech_readiness: TechReadiness;
  skill_depth_levels: Record<keyof CMOSkills, SkillDepthLevel>;
  key_strengths: string[];
  growth_areas: string[];
  maturity_stage: {
    best_fit: string;
    alignment_reasons: string[];
  };
  evidence: Evidence;
  assessment_notes: AssessmentNotes;
}

export interface AssessmentResult {
  id: string;
  profile_id: string;
  overall_score: number;
  category_scores: {
    hardSkills: number;
    softSkills: number;
    leadershipSkills: number;
    commercialAcumen: number;
    investor_capabilities: number;
    tech_readiness: number;
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
  skills: CMOSkills;
  investor_capabilities: InvestorCapabilities;
  tech_readiness: TechReadiness;
  skill_depth_levels: Record<keyof CMOSkills, SkillDepthLevel>;
  industry?: string;
  organization_type?: 'B2B' | 'B2C' | 'Hybrid';
  key_strengths?: string[];
  maturity_stage?: {
    best_fit: string;
    alignment_reasons: string[];
  };
  evidence: Evidence;
  assessment_notes: AssessmentNotes;
}

// Add new types
export interface Evidence {
  strengths: Record<string, string[]>;
  development_areas: Record<string, string[]>;
}

export interface AssessmentNotes {
  red_flags: string[];
  follow_up: string[];
  leadership_style: string;
}

export interface SkillAnalysis {
  skill: string;
  score: number;
  target: number;
  gap: number;
  assessment: string;
}

export interface CapabilityAnalysis {
  capability: string;
  score: number;
  target: number;
  gap: number;
  assessment: string;
}

export interface EvidenceAnalysis {
  strengths: {
    strength: string;
    examples: string[];
  }[];
  developmentAreas: {
    area: string;
    contexts: string[];
  }[];
} 