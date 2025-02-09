const { openaiService } = require("./openai");
const { evaluateSkillsByStage } = require("./scoring");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
const { generateReports } = require("../templates/reports");
const { performance } = require("perf_hooks");
const {
  debugLog,
  infoLog,
  warnLog,
  errorLog,
  timeLog,
} = require("../config/logging");
const path = require("path");
const fs = require("fs");

// Helper to validate skill clusters
function getValidCluster(cluster, defaultCluster) {
  if (
    !cluster ||
    typeof cluster !== "object" ||
    Object.keys(cluster || {}).length === 0
  ) {
    return { ...defaultCluster };
  }
  return cluster;
}

// Helper to create CMO profile from analysis
function createProfile(analysis) {
  const profile = {
    ...CMO_PROFILE_TEMPLATE,
    id: new Date().toISOString(),
    name: analysis.name || "Anonymous",
    current_role: analysis.current_role || "",
    years_experience: analysis.years_experience || 0,
    industry: analysis.industry || "",
    organization_type: analysis.organization_type || "B2B",
    skills: {
      hardSkills:
        analysis.skills?.hardSkills || CMO_PROFILE_TEMPLATE.skills.hardSkills,
      softSkills:
        analysis.skills?.softSkills || CMO_PROFILE_TEMPLATE.skills.softSkills,
      leadershipSkills: getValidCluster(
        analysis.skills?.leadershipSkills,
        CMO_PROFILE_TEMPLATE.skills.leadershipSkills
      ),
      commercialAcumen: getValidCluster(
        analysis.skills?.commercialAcumen,
        CMO_PROFILE_TEMPLATE.skills.commercialAcumen
      ),
    },
    capability_analysis:
      analysis.capability_analysis || CMO_PROFILE_TEMPLATE.capability_analysis,
    evidence_analysis:
      analysis.evidence_analysis || CMO_PROFILE_TEMPLATE.evidence_analysis,
    maturity_stage: analysis.maturity_stage || {
      best_fit: "Growth",
      alignment_reasons: [],
    },
  };

  console.log("\nCreated Profile:", {
    id: profile.id,
    hasSkills: !!profile.skills?.hardSkills,
    skillCount: Object.keys(profile.skills?.hardSkills || {}).length,
    sampleSkill: profile.skills?.hardSkills?.marketing_strategy,
  });

  // Log structure after object creation
  debugLog("Profile Skills:", analysis.skills?.hardSkills);
  return profile;
}

async function handleAssessment(transcript) {
  try {
    infoLog("Starting assessment...");
    const startTotal = performance.now();

    // Core operations
    const analysis = await openaiService.analyze(transcript);
    const profile = createProfile(analysis);
    debugLog("Profile maturity stage:", profile.maturity_stage);
    const scores = evaluateSkillsByStage(
      profile.skills,
      profile.maturity_stage?.best_fit,
      profile.capability_analysis
    );
    const reports = generateReports(profile, scores);

    const endTotal = performance.now();
    timeLog("Assessment complete", endTotal - startTotal);

    // Save outputs with timestamp
    const timestamp = formatDate(new Date());
    saveOutputs(profile, reports.candidate, reports.client, timestamp);

    console.log("\nSaved outputs:", {
      timestamp,
      profile: `profile_${timestamp}.json`,
      candidate: `candidate_report_${timestamp}.json`,
      client: `client_report_${timestamp}.json`,
    });

    return {
      status: "success",
      profile,
      scores,
      reports,
      timing: endTotal - startTotal,
    };
  } catch (error) {
    errorLog("Assessment failed:", error);
    throw error;
  }
}

function formatDate(date) {
  return date
    .toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/[/:]/g, "-");
}

function saveOutputs(profile, candidateReport, clientReport, timestamp) {
  const dataDir = path.join(__dirname, "../data");
  const reportsDir = path.join(dataDir, "reports");
  const profilesDir = path.join(dataDir, "profiles");

  // Ensure directories exist
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.mkdirSync(profilesDir, { recursive: true });

  // Save profile
  fs.writeFileSync(
    path.join(profilesDir, `profile_${timestamp}.json`),
    JSON.stringify(profile, null, 2)
  );

  // Save reports
  fs.writeFileSync(
    path.join(reportsDir, `candidate_report_${timestamp}.json`),
    JSON.stringify(candidateReport, null, 2)
  );

  fs.writeFileSync(
    path.join(reportsDir, `client_report_${timestamp}.json`),
    JSON.stringify(clientReport, null, 2)
  );
}

module.exports = { handleAssessment };
