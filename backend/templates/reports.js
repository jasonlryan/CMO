// Updated Report Templates

const path = require("path");

// Stub function for generating depth recommendations.
// This can be extended to include more sophisticated logic.
function generateDepthRecommendations(level, data) {
  if (data && data.impact > 0) {
    return [`Improve ${level} proficiency to reduce the current gap.`];
  }
  return [];
}

const CANDIDATE_REPORT_TEMPLATE = {
  title: "CMO Assessment Report - Candidate View",
  skillAnalysis: {
    technical: [],
    soft: [],
    leadership: [],
    commercial: [],
  },
  depthAnalysis: {
    byLevel: [],
  },
  capabilityAnalysis: {
    capabilities: [],
  },
  evidenceAnalysis: {
    strengths: [],
    development_areas: [],
  },
  nextSteps: [],
  qualitativeInsights: {
    leadershipStyle: { emphases: [], values: [], focus: [] },
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
    leadershipStyle: { emphases: [], values: [], focus: [] },
    stakeholderManagement: {
      cfoRelationship: "",
      salesAlignment: "",
      stakeholderEducation: "",
    },
  },
};

function generateReports(profile, scores) {
  // Generate candidate report with updated structure
  const candidateReport = {
    ...CANDIDATE_REPORT_TEMPLATE,
    skillAnalysis: {
      technical: Object.entries(profile.skills.hardSkills).map(
        ([skill, data]) => ({
          skill,
          score: {
            raw: data.score,
            adjusted: data.scores ? data.scores.adjusted : data.score,
            depth: data.depth,
            evidence: data.evidence,
          },
          gap:
            scores.gaps && scores.gaps.hardSkills
              ? scores.gaps.hardSkills[skill] || 0
              : 0,
        })
      ),
      soft: Object.entries(profile.skills.softSkills).map(([skill, data]) => ({
        skill,
        score: {
          raw: data.score,
          adjusted: data.scores ? data.scores.adjusted : data.score,
          depth: data.depth,
          evidence: data.evidence,
        },
        gap:
          scores.gaps && scores.gaps.softSkills
            ? scores.gaps.softSkills[skill] || 0
            : 0,
      })),
      leadership: Object.entries(profile.skills.leadershipSkills).map(
        ([skill, data]) => ({
          skill,
          score: {
            raw: data.score,
            adjusted: data.scores ? data.scores.adjusted : data.score,
            depth: data.depth,
            evidence: data.evidence,
          },
          gap:
            scores.gaps && scores.gaps.leadershipSkills
              ? scores.gaps.leadershipSkills[skill] || 0
              : 0,
        })
      ),
      commercial: Object.entries(profile.skills.commercialAcumen).map(
        ([skill, data]) => ({
          skill,
          score: {
            raw: data.score,
            adjusted: data.scores ? data.scores.adjusted : data.score,
            depth: data.depth,
            evidence: data.evidence,
          },
          gap:
            scores.gaps && scores.gaps.commercialAcumen
              ? scores.gaps.commercialAcumen[skill] || 0
              : 0,
        })
      ),
    },
    depthAnalysis: {
      byLevel: Object.entries(profile.depthAnalysis).map(([level, data]) => ({
        level,
        evidence: data.evidence,
        impact: data.impact,
        recommendations: generateDepthRecommendations(level, data),
      })),
    },
    capabilityAnalysis: {
      capabilities: scores.capabilities
        ? scores.capabilities.map((cap) => ({
            capability: cap.name,
            score: cap.score,
            gap: cap.gap,
            recommendation: cap.recommendation,
          }))
        : [],
    },
    evidenceAnalysis: {
      strengths: Object.entries(
        (profile.evidence_analysis && profile.evidence_analysis.strengths) || {}
      ).map(([area, items]) => ({ area, items })),
      development_areas: Object.entries(
        (profile.evidence_analysis &&
          profile.evidence_analysis.development_areas) ||
          {}
      ).map(([area, items]) => ({ area, items })),
    },
    nextSteps: profile.growth_areas
      ? profile.growth_areas.map((area) => ({
          area,
          recommendations: [`Focus on developing ${area}`],
        }))
      : [],
    qualitativeInsights: {
      leadershipStyle: {
        emphases:
          (profile.qualitative_insights &&
            profile.qualitative_insights.leadership_style &&
            profile.qualitative_insights.leadership_style.emphases) ||
          [],
        values:
          (profile.qualitative_insights &&
            profile.qualitative_insights.leadership_style &&
            profile.qualitative_insights.leadership_style.values) ||
          [],
        focus:
          (profile.qualitative_insights &&
            profile.qualitative_insights.leadership_style &&
            profile.qualitative_insights.leadership_style.focus) ||
          [],
      },
      stakeholderManagement: {
        cfoRelationship:
          (profile.qualitative_insights &&
            profile.qualitative_insights.stakeholder_management &&
            profile.qualitative_insights.stakeholder_management
              .cfo_relationship) ||
          "",
        salesAlignment:
          (profile.qualitative_insights &&
            profile.qualitative_insights.stakeholder_management &&
            profile.qualitative_insights.stakeholder_management
              .sales_alignment) ||
          "",
        stakeholderEducation:
          (profile.qualitative_insights &&
            profile.qualitative_insights.stakeholder_management &&
            profile.qualitative_insights.stakeholder_management
              .stakeholder_education) ||
          "",
      },
    },
  };

  // Generate client report by reusing candidate report structure
  const clientReport = {
    ...CLIENT_REPORT_TEMPLATE,
    skillAnalysis: candidateReport.skillAnalysis,
    depthAnalysis: candidateReport.depthAnalysis,
    capabilityAnalysis: candidateReport.capabilityAnalysis,
    evidenceAnalysis: candidateReport.evidenceAnalysis,
    assessmentNotes: {
      redFlags:
        (profile.assessment_notes &&
          profile.assessment_notes.red_flags &&
          profile.assessment_notes.red_flags.map((flag) => ({
            issue: flag,
          }))) ||
        [],
      followUp:
        (profile.assessment_notes &&
          profile.assessment_notes.follow_up &&
          profile.assessment_notes.follow_up.map((topic) => ({
            area: topic,
          }))) ||
        [],
      leadershipStyle: {
        style: profile.assessment_notes
          ? profile.assessment_notes.leadership_style
          : "",
      },
    },
    qualitativeInsights: candidateReport.qualitativeInsights,
  };

  return {
    candidate: candidateReport,
    client: clientReport,
  };
}

module.exports = { generateReports };
