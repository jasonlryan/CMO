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

// Function to get formatted timestamp in DDMMYYYY_HHMMSS format
function getFormattedTimestamp() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${dd}${mm}${yyyy}_${hh}${min}${ss}`;
}

// Helper to validate skill clusters
function getValidCluster(cluster, defaultCluster) {
  const validCluster = {};
  for (const [skillName, skillData] of Object.entries(cluster)) {
    validCluster[skillName] =
      "reportedDepth" in skillData
        ? {
            score: skillData.score,
            reportedDepth: skillData.reportedDepth,
            evidence: skillData.evidence || [],
          }
        : {
            ...defaultCluster[skillName],
            evidence: skillData.evidence || [],
          };
  }
  if (Object.keys(validCluster).length === 0) {
    warnLog("Invalid cluster structure");
    return defaultCluster;
  }
  return validCluster;
}

// Helper to create CMO profile from analysis
function createProfile(analysis) {
  const profile = {
    ...CMO_PROFILE_TEMPLATE,
    id: getFormattedTimestamp(),
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
    maturity_stage: {
      best_fit: analysis.maturity_stage?.best_fit || "Growth",
      scoring: analysis.maturity_stage?.scoring || "Growth",
      depth: analysis.maturity_stage?.depth || "Growth",
      alignment_reasons: analysis.maturity_stage?.alignment_reasons || [],
    },
    assessment_notes:
      analysis.assessment_notes || CMO_PROFILE_TEMPLATE.assessment_notes,
    qualitative_insights:
      analysis.qualitative_insights ||
      CMO_PROFILE_TEMPLATE.qualitative_insights,
  };

  console.log("\nCreated Profile:", {
    id: profile.id,
    hasSkills: !!profile.skills?.hardSkills,
    skillCount: Object.keys(profile.skills?.hardSkills || {}).length,
    sampleSkill: profile.skills?.hardSkills?.marketing_strategy,
    hasQualitativeData: {
      notes: !!analysis.assessment_notes,
      insights: !!analysis.qualitative_insights,
    },
  });

  // Log structure after object creation
  debugLog("Profile Skills:", analysis.skills?.hardSkills);
  return profile;
}

// Alias for backward compatibility
const calculateScores = evaluateSkillsByStage;

async function handleAssessment(transcript) {
  try {
    infoLog("Starting assessment...");
    const startTotal = performance.now();

    // Core operations
    const analysis = await openaiService.analyze(transcript);
    const profile = createProfile(analysis);

    // Preserve categorical structure
    const skills = {
      hardSkills: profile.skills?.hardSkills || {},
      softSkills: profile.skills?.softSkills || {},
      leadershipSkills: profile.skills?.leadershipSkills || {},
      commercialAcumen: profile.skills?.commercialAcumen || {},
    };

    debugLog("Profile skills structure:", {
      clusters: Object.keys(skills),
      sampleSkill: skills.hardSkills.marketing_strategy,
    });

    // Pass structured skills to scoring
    const scores = evaluateSkillsByStage(
      skills,
      profile.maturity_stage.best_fit
    );
    const reports = generateReports(profile, scores);

    const endTotal = performance.now();
    timeLog("Assessment complete", endTotal - startTotal);

    // Save outputs with timestamp
    saveOutputs(
      profile,
      reports.candidate,
      reports.client,
      getFormattedTimestamp()
    );

    console.log("\nSaved outputs:", {
      timestamp: getFormattedTimestamp(),
      profile: `profile_${getFormattedTimestamp()}.json`,
      candidate: `candidate_report_${getFormattedTimestamp()}.json`,
      client: `client_report_${getFormattedTimestamp()}.json`,
    });

    // Log qualitative data specifically
    console.log("[Assessment] Qualitative Data:", {
      hasQualitative: !!analysis.qualitative_insights,
      hasNotes: !!analysis.assessment_notes,
    });

    const timestamp = getFormattedTimestamp();
    const id = `cmo_${timestamp}`;

    return {
      status: "success",
      profile: {
        ...profile,
        id,
      },
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
  // Skip file saving when ChatGPT endpoint is enabled
  if (process.env.ENABLE_CHATGPT_ENDPOINT === "true") {
    console.log("[Assessment] Skipping file saves - ChatGPT endpoint enabled");
    return;
  }

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
