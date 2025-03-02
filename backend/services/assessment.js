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
  // Start with a deep copy of the template
  const defaultProfile = JSON.parse(JSON.stringify(CMO_PROFILE_TEMPLATE));

  // Extract nested fields from capability_analysis if they exist
  let extractedData = {};

  if (analysis.capability_analysis) {
    // Extract fields that should be at the root level
    const fieldsToExtract = [
      "key_strengths",
      "growth_areas",
      "evidence_analysis",
      "assessment_notes",
      "qualitative_insights",
      "maturity_stage",
    ];

    fieldsToExtract.forEach((field) => {
      if (
        analysis.capability_analysis[field] &&
        (!analysis[field] || Object.keys(analysis[field]).length === 0)
      ) {
        extractedData[field] = analysis.capability_analysis[field];
        // Remove from capability_analysis to avoid duplication
        delete analysis.capability_analysis[field];
      }
    });
  }

  // Create a base profile with ID and timestamp
  const baseProfile = {
    ...defaultProfile,
    id: getFormattedTimestamp(),
  };

  // Merge the analysis data with the base profile
  const profile = deepMerge(baseProfile, {
    name: analysis.name,
    current_role: analysis.current_role,
    years_experience: analysis.years_experience,
    industry: analysis.industry,
    organization_type: analysis.organization_type,
    skills: {
      hardSkills: analysis.skills?.hardSkills,
      softSkills: analysis.skills?.softSkills,
      leadershipSkills: getValidCluster(
        analysis.skills?.leadershipSkills,
        defaultProfile.skills.leadershipSkills
      ),
      commercialAcumen: getValidCluster(
        analysis.skills?.commercialAcumen,
        defaultProfile.skills.commercialAcumen
      ),
    },
    // Use capability_analysis from analysis, but ensure it doesn't contain duplicated fields
    capability_analysis: analysis.capability_analysis,
    // Use extracted data or original analysis data for these fields
    evidence_analysis:
      extractedData.evidence_analysis || analysis.evidence_analysis,
    assessment_notes:
      extractedData.assessment_notes || analysis.assessment_notes,
    qualitative_insights:
      extractedData.qualitative_insights || analysis.qualitative_insights,
    key_strengths: extractedData.key_strengths || analysis.key_strengths,
    growth_areas: extractedData.growth_areas || analysis.growth_areas,
    maturity_stage: {
      best_fit: (
        extractedData.maturity_stage?.best_fit ||
        analysis.maturity_stage?.best_fit ||
        "Growth"
      ).replace(" Stage", ""),
      scoring: (
        extractedData.maturity_stage?.scoring ||
        analysis.maturity_stage?.scoring ||
        "Growth"
      ).replace(" Stage", ""),
      depth: (
        extractedData.maturity_stage?.depth ||
        analysis.maturity_stage?.depth ||
        "Growth"
      ).replace(" Stage", ""),
      alignment_reasons:
        extractedData.maturity_stage?.alignment_reasons ||
        analysis.maturity_stage?.alignment_reasons ||
        [],
    },
  });

  console.log("\nCreated Profile:", {
    id: profile.id,
    hasSkills: !!profile.skills?.hardSkills,
    skillCount: Object.keys(profile.skills?.hardSkills || {}).length,
    sampleSkill: profile.skills?.hardSkills?.marketing_strategy,
    hasQualitativeData: {
      notes:
        !!profile.assessment_notes &&
        Object.keys(profile.assessment_notes).length > 0,
      insights:
        !!profile.qualitative_insights &&
        Object.keys(profile.qualitative_insights).length > 0,
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

    // Normalize the analysis structure immediately to ensure valid skills structure
    // This prevents the "Cannot read properties of undefined (reading 'hardSkills')" error
    if (!analysis.skills) {
      warnLog("Missing skills in analysis, using default template");
      analysis.skills = JSON.parse(JSON.stringify(CMO_PROFILE_TEMPLATE.skills));
    } else {
      // Create a normalized skills structure using deepMerge
      const defaultSkills = JSON.parse(
        JSON.stringify(CMO_PROFILE_TEMPLATE.skills)
      );
      analysis.skills = deepMerge(defaultSkills, analysis.skills);
    }

    // Ensure maturity_stage has a valid value
    if (
      !analysis.maturity_stage ||
      analysis.maturity_stage.best_fit === "insufficient data"
    ) {
      warnLog("Invalid maturity stage, using default Growth stage");
      analysis.maturity_stage = {
        best_fit: "Growth",
        scoring: "Growth",
        depth: "Growth",
        alignment_reasons: [],
      };
    }

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

/**
 * Safely merges source object into target object without overwriting populated fields with empty values
 * @param {Object} target - The target object to merge into
 * @param {Object} source - The source object to merge from
 * @returns {Object} - The merged object
 */
function deepMerge(target, source) {
  // If source is null or undefined, return target
  if (!source) return target;

  // Create a new object to avoid modifying the original target
  const result = { ...target };

  // Iterate through source properties
  Object.keys(source).forEach((key) => {
    // Skip if source property is undefined or null
    if (source[key] === undefined || source[key] === null) return;

    // If both target and source have object values for this key, merge them recursively
    if (
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    }
    // For arrays, use source array if it's not empty, otherwise keep target
    else if (Array.isArray(source[key])) {
      result[key] = source[key].length > 0 ? source[key] : target[key] || [];
    }
    // For primitive values or when types don't match, prefer non-empty source values
    else {
      // For strings, check if source is non-empty
      if (typeof source[key] === "string") {
        result[key] =
          source[key].trim() !== "" ? source[key] : target[key] || "";
      }
      // For objects, check if it has any keys
      else if (
        typeof source[key] === "object" &&
        Object.keys(source[key]).length > 0
      ) {
        result[key] = source[key];
      }
      // For other types (numbers, booleans), use source value
      else if (typeof source[key] !== "object") {
        result[key] = source[key];
      }
      // Default case: keep target value
      else {
        result[key] = target[key];
      }
    }
  });

  return result;
}

function saveOutputs(profile, candidateReport, clientReport, timestamp) {
  // Log the environment variable value for debugging
  console.log(
    "[Assessment] ENABLE_CHATGPT_ENDPOINT value:",
    process.env.ENABLE_CHATGPT_ENDPOINT
  );
  console.log(
    "[Assessment] Type of ENABLE_CHATGPT_ENDPOINT:",
    typeof process.env.ENABLE_CHATGPT_ENDPOINT
  );

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

module.exports = { handleAssessment, deepMerge };
