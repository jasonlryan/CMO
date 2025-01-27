const { evaluateSkillsByStage } = require("../services/scoring");

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
    investor: [],
    tech: [],
  },
  evidenceAnalysis: {
    strengths: [],
    development_areas: [],
  },
  nextSteps: [],
};

const CLIENT_REPORT_TEMPLATE = {
  title: "CMO Assessment Report - Client View",
  skillAnalysis: {},
  depthAnalysis: [],
  capabilityAnalysis: {},
  evidenceAnalysis: {},
  assessmentNotes: {
    redFlags: [],
    followUp: [],
    leadershipStyle: {},
  },
};

function generateReports(profile, scores) {
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
      leadership: Object.entries(profile.skills.leadershipSkills || {}).map(
        ([skill, score]) => ({
          skill,
          score,
          gap: scores.gaps.leadershipSkills?.[skill] || 0,
        })
      ),
      commercial: Object.entries(profile.skills.commercialAcumen || {}).map(
        ([skill, score]) => ({
          skill,
          score,
          gap: scores.gaps.commercialAcumen?.[skill] || 0,
        })
      ),
    },
    depthAnalysis: Object.entries(profile.skill_depth_levels || {}).map(
      ([level, skills]) => ({
        level,
        skills: Object.entries(skills).map(([skill, score]) => ({
          skill,
          score,
        })),
      })
    ),
    capabilityAnalysis: {
      investor: Object.entries(profile.investor_capabilities || {}).map(
        ([capability, score]) => ({
          capability,
          score,
        })
      ),
      tech: Object.entries(profile.tech_readiness || {}).map(
        ([capability, score]) => ({
          capability,
          score,
        })
      ),
    },
    evidenceAnalysis: {
      strengths: Object.entries(profile.evidence?.strengths || {}).map(
        ([area, items]) => ({
          area,
          items,
        })
      ),
      development_areas: Object.entries(
        profile.evidence?.development_areas || {}
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
  };

  return { candidateReport, clientReport };
}

module.exports = { generateReports };
