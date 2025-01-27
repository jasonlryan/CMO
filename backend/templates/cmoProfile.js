// This should ONLY have the template structure, no prompts

const CMO_PROFILE_TEMPLATE = {
  name: "Anonymous",
  current_role: "",
  years_experience: 0,
  industry: "",
  organization_type: "B2B", // Can be "B2B", "B2C", or "Hybrid"
  skills: {
    hardSkills: {
      marketing_strategy: 0,
      digital_marketing: 0,
      data_analytics: 0,
      strategic_planning: 0,
    },
    softSkills: {
      leadership: 0,
      stakeholder_management: 0,
      communication: 0,
      team_building: 0,
    },
  },
  skill_depth_levels: {
    strategic_understanding: {
      business_acumen: 0,
      market_analysis: 0,
      growth_strategy: 0,
      resource_planning: 0,
    },
    managerial_oversight: {
      team_development: 0,
      performance_management: 0,
      budget_control: 0,
      process_optimization: 0,
    },
    conversational_proficiency: {
      stakeholder_communication: 0,
      sales_alignment: 0,
      board_presentations: 0,
      team_collaboration: 0,
    },
    executional_expertise: {
      marketing_automation: 0,
      analytics_implementation: 0,
      team_structure: 0,
      process_development: 0,
    },
  },
  key_strengths: [],
  growth_areas: [],
  maturity_stage: {
    best_fit: "",
    alignment_reasons: [],
  },
};

module.exports = { CMO_PROFILE_TEMPLATE };
