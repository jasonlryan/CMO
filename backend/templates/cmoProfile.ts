import type { CMOProfile } from '../types';

export const CMO_PROFILE_TEMPLATE = {
  name: "Anonymous",
  current_role: "",
  years_experience: 0,
  industry: "",
  organization_type: "B2B" as "B2B" | "B2C" | "Hybrid",
  skills: {
    hardSkills: {
      marketing_strategy: 0,
      digital_marketing: 0,
      data_analytics: 0,
      strategic_planning: 0
    },
    softSkills: {
      leadership: 0,
      stakeholder_management: 0,
      communication: 0,
      team_building: 0
    }
  },
  skill_depth_levels: {
    strategic_understanding: {
      business_acumen: 0,
      market_analysis: 0,
      growth_strategy: 0,
      resource_planning: 0
    },
    managerial_oversight: {
      team_development: 0,
      performance_management: 0,
      budget_control: 0,
      process_optimization: 0
    },
    conversational_proficiency: {
      stakeholder_communication: 0,
      sales_alignment: 0,
      board_presentations: 0,
      team_collaboration: 0
    },
    executional_expertise: {
      marketing_automation: 0,
      analytics_implementation: 0,
      team_structure: 0,
      process_development: 0
    }
  },
  key_strengths: [] as string[],
  growth_areas: [] as string[],
  maturity_stage: {
    best_fit: "",
    alignment_reasons: [] as string[]
  }
};

export const ANALYSIS_PROMPT = `Analyze this CMO interview transcript. Extract detailed information and rate skills from 0.0-1.0.

Return ONLY the JSON matching this exact structure with no markdown formatting:
${JSON.stringify(CMO_PROFILE_TEMPLATE, null, 2)}`; 