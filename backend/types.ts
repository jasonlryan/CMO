// Skill-related interfaces
export interface HardSkills {
  marketing_strategy: number;
  digital_marketing: number;
  data_analytics: number;
  strategic_planning: number;
}

export interface SoftSkills {
  leadership: number;
  stakeholder_management: number;
  communication: number;
  team_building: number;
}

export interface LeadershipSkills {
  vision_setting: number;
  team_development: number;
  change_management: number;
  strategic_influence: number;
  organizational_design: number;
}

export interface CommercialAcumen {
  financial_modeling: number;
  market_sizing: number;
  revenue_optimization: number;
  resource_allocation: number;
  budget_management: number;
}

export interface CMOSkills {
  hardSkills: HardSkills;
  softSkills: SoftSkills;
  leadershipSkills: LeadershipSkills;
  commercialAcumen: CommercialAcumen;
}

// Capability interfaces
export interface CapabilityDetail {
  score: number;
  gap: number;
  recommendation: string;
}

export interface CapabilityAnalysis {
  technical_capability: CapabilityDetail;
  leadership_capability: CapabilityDetail;
  investor_readiness: CapabilityDetail;
  tech_readiness: CapabilityDetail;
}

// Evidence and Analysis interfaces
export interface EvidenceAnalysis {
  strengths: Record<string, string[]>;
  development_areas: Record<string, string[]>;
}

export interface AssessmentNotes {
  red_flags: string[];
  follow_up: string[];
  leadership_style: string;
}

export interface QualitativeInsights {
  leadership_style: {
    emphases: string[];
    values: string[];
    focus: string[];
  };
  stakeholder_management: {
    cfo_relationship: string;
    sales_alignment: string;
    stakeholder_education: string;
  };
}

// Depth Level interfaces
export interface SkillDepthLevel {
  business_acumen: number;
  market_analysis: number;
  growth_strategy: number;
  resource_planning: number;
}

// Main Profile interface
export interface CMOProfile {
  id: string;
  name: string;
  current_role: string;
  years_experience: number;
  industry: string;
  organization_type: 'B2B' | 'B2C' | 'Hybrid';
  skills: CMOSkills;
  skill_depth_levels: {
    strategic_understanding: SkillDepthLevel;
    managerial_oversight: SkillDepthLevel;
    conversational_proficiency: SkillDepthLevel;
    executional_expertise: SkillDepthLevel;
  };
  key_strengths: string[];
  growth_areas: string[];
  maturity_stage: {
    best_fit: string;
    alignment_reasons: string[];
  };
  capability_analysis: CapabilityAnalysis;
  evidence_analysis: EvidenceAnalysis;
  assessment_notes: AssessmentNotes;
  qualitative_insights: QualitativeInsights;
}

export interface InvestorCapabilities {
  storytelling: number;
  metrics_mastery: number;
  market_knowledge: number;
  fundraising_experience: number;
}

export interface TechReadiness {
  ai_understanding: number;
  data_driven_decisions: number;
  martech_implementation: number;
  automation_strategy: number;
}

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

export interface SkillAnalysis {
  skill: string;
  score: number;
  target: number;
  gap: number;
  assessment: string;
} 