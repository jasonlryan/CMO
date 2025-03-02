const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
const {
  debugLog,
  infoLog,
  warnLog,
  errorLog,
  timeLog,
} = require("../config/logging");
const fs = require("fs");
const path = require("path");

// Helper to fix precision and normalize numbers (available globally)
function fixPrecision(num) {
  return Number(Number(num).toFixed(1)) || 0;
}

// Load depth levels config
const depthLevelsPath = path.join(__dirname, "../config/depthLevels.json");
let DEPTH_LEVELS;

try {
  const depthLevelsData = fs.readFileSync(depthLevelsPath, "utf8");
  DEPTH_LEVELS = JSON.parse(depthLevelsData);
} catch (err) {
  warnLog("Failed to load depth levels:", err.message);
}

// Load benchmark values from external JSON file
const benchmarksPath = path.join(__dirname, "../config/benchmarks.json");
let STAGE_WEIGHTS;

try {
  const benchmarksData = fs.readFileSync(benchmarksPath, "utf8");
  STAGE_WEIGHTS = JSON.parse(benchmarksData);
} catch (err) {
  warnLog("Failed to load benchmarks:", err.message);
  throw new Error("Cannot proceed without valid benchmarks configuration");
}

/**
 * Calculates overall maturity score based on skill scores
 * @param {Object} skills - Skill scores by category
 * @returns {number} Normalized score 0-1
 */
function calculateMaturityScore(skills, stage) {
  const weights = STAGE_WEIGHTS[stage] || STAGE_WEIGHTS["Growth"];
  let totalScore = 0;

  Object.entries(skills).forEach(([category, clusterSkills]) => {
    const clusterScore =
      Object.values(clusterSkills).reduce(
        (sum, skill) => sum + skill.scores.raw,
        0
      ) / Object.keys(clusterSkills).length;

    totalScore += clusterScore * weights[category];
  });

  return totalScore;
}

// Add new function to evaluate capabilities
function evaluateCapabilities(capabilities, stage) {
  const weights = STAGE_WEIGHTS[stage] || STAGE_WEIGHTS["Growth"];
  if (!weights) {
    warnLog("Invalid stage, using default:", {
      stage: stage,
      function: "evaluateCapabilities",
      using: "Growth weights",
    });
  }
  const defaultWeight = 0.8;

  // Validate each capability has required fields
  const validatedCapabilities = Object.entries(capabilities).map(
    ([key, capability]) => {
      // Ensure we have valid numbers for score and gap
      const score = typeof capability.score === "number" ? capability.score : 0;
      const gap = typeof capability.gap === "number" ? capability.gap : 0;

      return {
        name: key,
        score: fixPrecision(score),
        gap: fixPrecision(calculateGap(score, weights[key] || defaultWeight)),
        recommendation:
          capability.recommendation || "No recommendation provided",
        weight: weights[key] || defaultWeight,
      };
    }
  );

  // Sort by gap size to highlight biggest improvement areas
  return validatedCapabilities.sort((a, b) => b.gap - a.gap);
}

/**
 * Validates skills structure meets analysis requirements
 * @param {Object} skills - Skills data to validate
 * @throws {Error} If structure is invalid
 */
function validateSkillsStructure(skills) {
  if (!skills || typeof skills !== "object") {
    throw new Error("Skills must be an object");
  }

  const requiredClusters = [
    "hardSkills",
    "softSkills",
    "leadershipSkills",
    "commercialAcumen",
  ];

  requiredClusters.forEach((cluster) => {
    if (!skills[cluster] || typeof skills[cluster] !== "object") {
      throw new Error(`Missing required skill cluster: ${cluster}`);
    }
  });
}

/**
 * @param {Object} skills - Validated skills structure
 * @param {string} maturityStage - From profile.maturity_stage.best_fit
 */
function evaluateSkillsByStage(skills, maturityStage) {
  try {
    validateSkillsStructure(skills);
  } catch (error) {
    errorLog("Invalid skills structure:", error.message);
    errorLog("Profile maturity stage:", maturityStage);
    throw new Error("Cannot analyze skills: Invalid structure");
  }

  console.log("[Scoring Input] Skills Structure:", {
    hasHardSkills: !!skills.hardSkills,
    hasSoftSkills: !!skills.softSkills,
    skillCount: Object.keys(skills).length,
  });

  debugLog("Stage received by scoring:", maturityStage);
  if (!skills) {
    warnLog("Missing skills, using defaults");
    skills = CMO_PROFILE_TEMPLATE.capability_analysis;
  }

  const scoringStage = maturityStage?.replace(" Stage", "") || "Growth";
  const weights = STAGE_WEIGHTS[scoringStage] || STAGE_WEIGHTS["Growth"];

  if (!STAGE_WEIGHTS[scoringStage]) {
    warnLog(`Invalid stage "${scoringStage}", using Growth`);
  }

  Object.entries(skills).forEach(([category, skillSet]) => {
    Object.entries(skillSet).forEach(([skill, data]) => {
      const rawScore = data.score;

      skills[category][skill].scores = {
        raw: rawScore,
      };
    });
  });

  const depthStage = maturityStage.depth || "Growth";
  const depthAnalysis = assessDepthLevels(skills, depthStage);

  const results = {
    gaps: calculateSkillGaps(skills, weights, scoringStage),
    score: calculateMaturityScore(skills, scoringStage),
    stageAlignment: calculateStageAlignment(skills, scoringStage),
    capabilities: evaluateCapabilities(skills, scoringStage),
    depthAnalysis: depthAnalysis,
  };

  return results;
}

function calculateStageAlignment(skills, stage) {
  debugLog("Processing stage alignment:", {
    stage: stage,
    skills: Object.keys(skills),
  });
  const weights = STAGE_WEIGHTS[stage];
  const clusterScores = {};

  // Calculate average score for each cluster
  Object.entries(skills).forEach(([cluster, clusterSkills]) => {
    clusterScores[cluster] =
      Object.values(clusterSkills).reduce(
        (sum, skill) => sum + skill.score,
        0
      ) / Object.keys(clusterSkills).length;
  });

  // Check if scores meet stage requirements
  const alignment = {
    matches: true,
    gaps: {},
    recommendations: [],
  };

  Object.entries(clusterScores).forEach(([cluster, score]) => {
    const requiredScore = weights[cluster];
    if (score < requiredScore) {
      alignment.matches = false;
      alignment.gaps[cluster] = Number((requiredScore - score).toFixed(1));
      alignment.recommendations.push(
        `Improve ${cluster} skills to meet ${stage} requirements`,
        { gap: alignment.gaps[cluster] }
      );
    }
  });

  return alignment;
}

// Add helper function for calculating gaps
function calculateGap(score, targetWeight) {
  return Number(Math.max(0, targetWeight - score).toFixed(1));
}

/**
 * Analyzes depth gaps between reported and expected skill levels
 * @param {Object} skills - Must contain hardSkills, softSkills,
 * leadershipSkills, and commercialAcumen clusters
 * @param {string} maturityStage - Current maturity stage
 * @returns {Object} Depth analysis by level
 */
function assessDepthLevels(skills, maturityStage) {
  const depthAnalysis = {};

  Object.entries(skills).forEach(([category, skills]) => {
    Object.entries(skills).forEach(([skillName, skillData]) => {
      // Check for reportedDepth first, then fall back to depth if not present
      const reportedDepth =
        skillData.reportedDepth !== undefined
          ? skillData.reportedDepth
          : skillData.depth || 1;
      const expectedDepth =
        DEPTH_LEVELS[maturityStage]?.[category]?.[skillName] || 1;

      depthAnalysis[category] = depthAnalysis[category] || {};
      depthAnalysis[category][skillName] = {
        reportedDepth,
        expectedDepth,
        gap: Math.max(0, expectedDepth - reportedDepth),
      };
    });
  });

  return depthAnalysis;
}

function calculateSkillGaps(skills, targetWeights, stage) {
  if (!targetWeights) {
    warnLog("Invalid weights, using defaults:", {
      expected: "custom weights",
      using: "default weights",
    });
    targetWeights = {
      hardSkills: 0.8,
      softSkills: 0.8,
      leadershipSkills: 0.8,
      commercialAcumen: 0.8,
    };
  }

  debugLog("Calculating gaps with weights:", targetWeights);

  const gaps = {
    hardSkills: {},
    softSkills: {},
    leadershipSkills: {},
    commercialAcumen: {},
  };

  // Process all 4 categories consistently
  ["hardSkills", "softSkills", "leadershipSkills", "commercialAcumen"].forEach(
    (category) => {
      if (skills[category]) {
        Object.entries(skills[category]).forEach(([skill, skillData]) => {
          // stage is now passed in, already normalized
          const expectedDepth = DEPTH_LEVELS[stage]?.[category]?.[skill] || 1;
          // Check for reportedDepth first, then fall back to depth if not present
          const actualDepth =
            skillData.reportedDepth !== undefined
              ? skillData.reportedDepth
              : skillData.depth || 1;
          const adjustedScore = fixPrecision(
            Math.max(0, targetWeights[category] - actualDepth)
          );
          gaps[category][skill] = fixPrecision(
            Math.max(0, targetWeights[category] - adjustedScore)
          );
        });
      }
    }
  );

  return gaps;
}

module.exports = {
  calculateSkillGaps,
  calculateMaturityScore,
  evaluateSkillsByStage,
  calculateStageAlignment,
  calculateGap,
  fixPrecision,
  assessDepthLevels,
  validateSkillsStructure,
};
