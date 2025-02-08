const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
const { debugLog } = require("../config");
const fs = require("fs");
const path = require("path");

// Helper to fix precision and normalize numbers (available globally)
function fixPrecision(num) {
  return Number(Number(num).toFixed(1)) || 0;
}

// Remove types and simplify
function calculateSkillGaps(skills, targetWeights) {
  if (!targetWeights) {
    console.warn("\nMissing targetWeights in calculateSkillGaps");
    targetWeights = {
      hardSkills: 0.8,
      softSkills: 0.8,
      leadershipSkills: 0.8,
      commercialAcumen: 0.8,
    };
  }

  debugLog("DEBUG - Calculating gaps with weights:", targetWeights);

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
        Object.entries(skills[category]).forEach(([skill, score]) => {
          gaps[category][skill] = fixPrecision(
            Math.max(0, targetWeights[category] - Number(score))
          );
        });
      }
    }
  );

  return gaps;
}

// Load benchmark values from external JSON file
const benchmarksPath = path.join(__dirname, "../config/benchmarks.json");
debugLog("Attempting to load benchmarks from:", benchmarksPath);
let STAGE_WEIGHTS;
try {
  const benchmarksData = fs.readFileSync(benchmarksPath, "utf8");
  debugLog("Raw benchmark data:", benchmarksData.substring(0, 100) + "...");
  STAGE_WEIGHTS = JSON.parse(benchmarksData);
  debugLog("Loaded benchmark stages:", Object.keys(STAGE_WEIGHTS).join(", "));
  debugLog("Benchmark Loading:", {
    path: benchmarksPath,
    loaded: Object.keys(STAGE_WEIGHTS),
    sample: STAGE_WEIGHTS["Growth"],
    exists: fs.existsSync(benchmarksPath),
  });
} catch (err) {
  debugLog("Benchmark loading error:", err);
  console.warn(
    `Failed to load benchmarks from JSON (${err.message}), using default hard-coded values.`
  );
  STAGE_WEIGHTS = {
    "Early-Stage": {
      hardSkills: 0.4,
      softSkills: 0.2,
      leadershipSkills: 0.2,
      commercialAcumen: 0.2,
      technical_capability: 0.7,
      leadership_capability: 0.6,
      investor_readiness: 0.5,
      tech_readiness: 0.6,
    },
    Growth: {
      hardSkills: 0.3,
      softSkills: 0.3,
      leadershipSkills: 0.2,
      commercialAcumen: 0.2,
      technical_capability: 0.8,
      leadership_capability: 0.7,
      investor_readiness: 0.6,
      tech_readiness: 0.7,
    },
    "Scale-Up": {
      hardSkills: 0.2,
      softSkills: 0.3,
      leadershipSkills: 0.3,
      commercialAcumen: 0.2,
      technical_capability: 0.9,
      leadership_capability: 0.8,
      investor_readiness: 0.7,
      tech_readiness: 0.8,
    },
    Enterprise: {
      hardSkills: 0.2,
      softSkills: 0.2,
      leadershipSkills: 0.3,
      commercialAcumen: 0.3,
      technical_capability: 0.9,
      leadership_capability: 0.9,
      investor_readiness: 0.8,
      tech_readiness: 0.9,
    },
  };
}

function calculateMaturityScore(skills, stage) {
  const weights = STAGE_WEIGHTS[stage] || STAGE_WEIGHTS["Growth"];
  if (!weights) {
    console.warn(
      `Invalid stage "${stage}" in calculateMaturityScore, using Growth weights`
    );
  }

  let totalScore = 0;
  let totalWeight = 0;

  // Calculate weighted scores by cluster
  Object.entries(skills).forEach(([cluster, clusterSkills]) => {
    const clusterWeight = weights[cluster];
    const clusterScore =
      Object.values(clusterSkills).reduce((sum, score) => sum + score, 0) /
      Object.keys(clusterSkills).length;

    totalScore += fixPrecision(clusterScore * clusterWeight);
    totalWeight += clusterWeight;
  });

  return totalWeight > 0 ? fixPrecision(totalScore / totalWeight) : 0;
}

// Add new function to evaluate capabilities
function evaluateCapabilities(capabilities, stage) {
  const weights = STAGE_WEIGHTS[stage] || STAGE_WEIGHTS["Growth"];
  if (!weights) {
    console.warn(
      `Invalid stage "${stage}" in evaluateCapabilities, using Growth weights`
    );
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

// Update main evaluation function
function evaluateSkillsByStage(skills, stage, capabilities) {
  debugLog("DEBUG - Inside scoring:", { skills, stage, capabilities });

  if (!capabilities) {
    console.warn("\nMissing capabilities in evaluateSkillsByStage");
    capabilities = CMO_PROFILE_TEMPLATE.capability_analysis;
  }

  // 1. Normalize stage name
  const normalizedStage = stage?.replace(" Stage", "");

  // 2. Get weights with fallback
  const weights = STAGE_WEIGHTS[normalizedStage] || STAGE_WEIGHTS["Growth"];

  if (!STAGE_WEIGHTS[normalizedStage]) {
    console.warn(`\nInvalid stage "${stage}", using Growth stage weights`);
  }

  debugLog("DEBUG - Using weights for stage:", {
    stage: normalizedStage,
    weights: weights,
  });

  // 3. Use normalized weights
  return {
    gaps: calculateSkillGaps(skills, weights),
    score: calculateMaturityScore(skills, normalizedStage),
    stageAlignment: calculateStageAlignment(skills, normalizedStage),
    capabilities: evaluateCapabilities(capabilities, normalizedStage),
  };
}

function calculateStageAlignment(skills, stage) {
  const weights = STAGE_WEIGHTS[stage];
  const clusterScores = {};

  // Calculate average score for each cluster
  Object.entries(skills).forEach(([cluster, clusterSkills]) => {
    clusterScores[cluster] =
      Object.values(clusterSkills).reduce((sum, score) => sum + score, 0) /
      Object.keys(clusterSkills).length;
  });

  // Check if scores meet stage requirements
  const alignment = {
    matches: true,
    gaps: {},
    recommendations: [],
  };

  Object.entries(clusterScores).forEach(([cluster, score]) => {
    const requiredScore = weights[cluster] * 10; // Convert weight to target score
    if (score < requiredScore) {
      alignment.matches = false;
      alignment.gaps[cluster] = Number((requiredScore - score).toFixed(1));
      alignment.recommendations.push(
        `Improve ${cluster} skills to meet ${stage} requirements (gap: ${alignment.gaps[cluster]})`
      );
    }
  });

  return alignment;
}

// Add helper function for calculating gaps
function calculateGap(score, targetWeight) {
  return Number(Math.max(0, targetWeight - score).toFixed(1));
}

module.exports = {
  calculateSkillGaps,
  calculateMaturityScore,
  evaluateSkillsByStage,
  calculateStageAlignment,
  calculateGap,
  fixPrecision,
};
