const { openaiService } = require("./openai");
const { evaluateSkillsByStage } = require("./scoring");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
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

async function handleAssessment(transcript) {
  try {
    infoLog("Starting assessment...");
    const startTotal = performance.now();

    // Core operations
    const analysis = await openaiService.analyze(transcript);
    const profile = createProfile(analysis);
    const scores = evaluateSkillsByStage(
      profile.skills,
      profile.maturity_stage?.best_fit
    );
    const reports = generateReports(profile, scores);

    const endTotal = performance.now();
    timeLog("Assessment complete", endTotal - startTotal);

    return { status: "success", profile, scores, reports };
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
