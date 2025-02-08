const { evaluateSkillsByStage, fixPrecision } = require("../services/scoring");

// Report templates - NO logic, just structure
const CANDIDATE_REPORT_TEMPLATE = {
  title: "CMO Assessment Report - Candidate View",
  skillAnalysis: {
    technical: [],
    soft: [],
    leadership: [],
    commercial: [],
  },
  depthAnalysis: [],
  capabilityAnalysis: {
    capabilities: [],
  },
  evidenceAnalysis: {
    strengths: [],
    development_areas: [],
  },
  nextSteps: [],
  qualitativeInsights: {
    leadershipStyle: {
      emphases: [],
      values: [],
      focus: [],
    },
    stakeholderManagement: {
      cfoRelationship: "",
      salesAlignment: "",
      stakeholderEducation: "",
    },
  },
};

const CLIENT_REPORT_TEMPLATE = {
  title: "CMO Assessment Report - Client View",
  skillAnalysis: {
    technical: [],
    soft: [],
    leadership: [],
    commercial: [],
  },
  depthAnalysis: [],
  capabilityAnalysis: {
    capabilities: [],
  },
  evidenceAnalysis: {
    strengths: [],
    development_areas: [],
  },
  assessmentNotes: {
    redFlags: [],
    followUp: [],
    leadershipStyle: {},
  },
  qualitativeInsights: {
    leadershipStyle: {
      emphases: [],
      values: [],
      focus: [],
    },
    stakeholderManagement: {
      cfoRelationship: "",
      salesAlignment: "",
      stakeholderEducation: "",
    },
  },
};

function generateReports(profile, scores) {
  // Validate scores.capabilities exists
  if (!Array.isArray(scores?.capabilities)) {
    console.warn("Missing or invalid capabilities in scores");
    scores.capabilities = [];
  }

  const candidateReport = {
    ...CANDIDATE_REPORT_TEMPLATE,
    skillAnalysis: {
      technical: Object.entries(profile.skills.hardSkills).map(
        ([skill, score]) => ({
          skill,
          score,
          gap: scores.gaps.hardSkills[skill] || 0,
        })
      ),
      soft: Object.entries(profile.skills.softSkills).map(([skill, score]) => ({
        skill,
        score,
        gap: scores.gaps.softSkills[skill] || 0,
      })),
      leadership: Object.entries(profile.skills.leadershipSkills).map(
        ([skill, score]) => ({
          skill,
          score,
          gap: scores.gaps.leadershipSkills[skill] || 0,
        })
      ),
      commercial: Object.entries(profile.skills.commercialAcumen).map(
        ([skill, score]) => ({
          skill,
          score,
          gap: scores.gaps.commercialAcumen[skill] || 0,
        })
      ),
    },
    depthAnalysis: Object.entries(profile.skill_depth_levels || {}).map(
      ([level, skills]) => ({
        level,
        skills: Object.entries(skills).map(([skill, score]) => ({
          skill,
          score: fixPrecision(score),
        })),
      })
    ),
    capabilityAnalysis: {
      capabilities: scores.capabilities.map((cap) => ({
        capability: cap.name,
        score: cap.score,
        gap: cap.gap,
        recommendation: cap.recommendation,
      })),
    },
    evidenceAnalysis: {
      strengths: Object.entries(profile.evidence_analysis?.strengths || {}).map(
        ([area, items]) => ({
          area,
          items,
        })
      ),
      development_areas: Object.entries(
        profile.evidence_analysis?.development_areas || {}
      ).map(([area, items]) => ({
        area,
        items,
      })),
    },
    nextSteps:
      profile.growth_areas?.map((area) => ({
        area,
        recommendations: [`Focus on developing ${area}`],
      })) || [],
    qualitativeInsights: {
      leadershipStyle: {
        emphases:
          profile.qualitative_insights?.leadership_style?.emphases || [],
        values: profile.qualitative_insights?.leadership_style?.values || [],
        focus: profile.qualitative_insights?.leadership_style?.focus || [],
      },
      stakeholderManagement: {
        cfoRelationship:
          profile.qualitative_insights?.stakeholder_management
            ?.cfo_relationship || "",
        salesAlignment:
          profile.qualitative_insights?.stakeholder_management
            ?.sales_alignment || "",
        stakeholderEducation:
          profile.qualitative_insights?.stakeholder_management
            ?.stakeholder_education || "",
      },
    },
  };

  const clientReport = {
    ...CLIENT_REPORT_TEMPLATE,
    skillAnalysis: candidateReport.skillAnalysis,
    depthAnalysis: candidateReport.depthAnalysis,
    capabilityAnalysis: candidateReport.capabilityAnalysis,
    evidenceAnalysis: candidateReport.evidenceAnalysis,
    assessmentNotes: {
      redFlags:
        profile.assessment_notes?.red_flags?.map((flag) => ({ issue: flag })) ||
        [],
      followUp:
        profile.assessment_notes?.follow_up?.map((topic) => ({
          area: topic,
        })) || [],
      leadershipStyle: {
        style: profile.assessment_notes?.leadership_style || "",
      },
    },
    qualitativeInsights: candidateReport.qualitativeInsights,
  };

  return { candidateReport, clientReport };
}

module.exports = { generateReports };
