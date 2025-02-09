// Updated CMO Profile Template

const CMO_PROFILE_TEMPLATE = {
  name: "Anonymous",
  current_role: "",
  years_experience: 0,
  industry: "",
  organization_type: "B2B", // Allowed values: "B2B", "B2C", "Hybrid"
  skills: {
    hardSkills: {
      marketing_strategy: { score: 0, depth: 1, evidence: [] },
      digital_marketing: { score: 0, depth: 1, evidence: [] },
      data_analytics: { score: 0, depth: 1, evidence: [] },
      brand_development: { score: 0, depth: 1, evidence: [] },
      marketing_operations: { score: 0, depth: 1, evidence: [] },
      budget_management: { score: 0, depth: 1, evidence: [] },
    },
    softSkills: {
      communication: { score: 0, depth: 1, evidence: [] },
      strategic_thinking: { score: 0, depth: 1, evidence: [] },
      stakeholder_management: { score: 0, depth: 1, evidence: [] },
      team_development: { score: 0, depth: 1, evidence: [] },
      adaptability: { score: 0, depth: 1, evidence: [] },
    },
    leadershipSkills: {
      vision_setting: { score: 0, depth: 1, evidence: [] },
      team_development: { score: 0, depth: 1, evidence: [] },
      change_management: { score: 0, depth: 1, evidence: [] },
      strategic_influence: { score: 0, depth: 1, evidence: [] },
      organizational_design: { score: 0, depth: 1, evidence: [] },
    },
    commercialAcumen: {
      financial_modeling: { score: 0, depth: 1, evidence: [] },
      market_sizing: { score: 0, depth: 1, evidence: [] },
      revenue_optimization: { score: 0, depth: 1, evidence: [] },
      resource_allocation: { score: 0, depth: 1, evidence: [] },
      budget_management: { score: 0, depth: 1, evidence: [] },
    },
  },
  key_strengths: [],
  growth_areas: [],
  maturity_stage: {
    best_fit: "",
    alignment_reasons: [],
  },
  capability_analysis: {
    technical_capability: { score: 0, gap: 0, recommendation: "" },
    leadership_capability: { score: 0, gap: 0, recommendation: "" },
    investor_readiness: { score: 0, gap: 0, recommendation: "" },
    tech_readiness: { score: 0, gap: 0, recommendation: "" },
  },
  evidence_analysis: {
    strengths: {},
    development_areas: {},
  },
  assessment_notes: {
    red_flags: [],
    follow_up: [],
    leadership_style: "",
  },
  qualitative_insights: {
    leadership_style: { emphases: [], values: [], focus: [] },
    stakeholder_management: {
      cfo_relationship: "",
      sales_alignment: "",
      stakeholder_education: "",
    },
  },
  depthAnalysis: {
    strategic: { level: 1, evidence: [], impact: 0, skills: [] },
    managerial: { level: 2, evidence: [], impact: 0, skills: [] },
    conversational: { level: 3, evidence: [], impact: 0, skills: [] },
    executional: { level: 4, evidence: [], impact: 0, skills: [] },
  },
};

module.exports = { CMO_PROFILE_TEMPLATE };
