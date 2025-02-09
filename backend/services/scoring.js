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

// Remove types and simplify
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

  // Add depth adjustment
  function adjustScoreForDepth(score, actualDepth, expectedDepth) {
    if (actualDepth < expectedDepth) {
      const gap = expectedDepth - actualDepth;
      return score * (1 - gap / 3); // Max penalty of 3 levels
    }
    return score; // No penalty if meeting/exceeding depth
  }

  // Process all 4 categories consistently
  ["hardSkills", "softSkills", "leadershipSkills", "commercialAcumen"].forEach(
    (category) => {
      if (skills[category]) {
        Object.entries(skills[category]).forEach(([skill, skillData]) => {
          // stage is now passed in, already normalized
          const expectedDepth = DEPTH_LEVELS[stage]?.[category]?.[skill] || 1;
          const actualDepth = skillData.depth || 1;
          const adjustedScore = adjustScoreForDepth(
            skillData.score,
            actualDepth,
            expectedDepth
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

function calculateMaturityScore(skills, stage) {
  const weights = STAGE_WEIGHTS[stage] || STAGE_WEIGHTS["Growth"];
  if (!weights) {
    warnLog("Invalid stage, using default:", {
      stage: stage,
      function: "calculateMaturityScore",
      using: "Growth weights",
    });
  }

  let totalScore = 0;
  let totalWeight = 0;

  // Calculate weighted scores by cluster
  Object.entries(skills).forEach(([cluster, clusterSkills]) => {
    const clusterWeight = weights[cluster];
    const clusterScore =
      Object.values(clusterSkills).reduce(
        (sum, skill) => sum + skill.score,
        0
      ) / Object.keys(clusterSkills).length;

    totalScore += fixPrecision(clusterScore * clusterWeight);
    totalWeight += clusterWeight;
  });

  return totalWeight > 0 ? fixPrecision(totalScore / totalWeight) : 0;
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

// Update main evaluation function
function evaluateSkillsByStage(skills, stage, capabilities) {
  debugLog("Stage received by scoring:", stage);
  if (!capabilities) {
    warnLog("Missing capabilities, using defaults");
    capabilities = CMO_PROFILE_TEMPLATE.capability_analysis;
  }

  const normalizedStage = stage?.replace(" Stage", "");
  const weights = STAGE_WEIGHTS[normalizedStage] || STAGE_WEIGHTS["Growth"];

  if (!STAGE_WEIGHTS[normalizedStage]) {
    warnLog(`Invalid stage "${stage}", using Growth`);
  }

  // Depth levels affect final scores
  const depthWeights = {
    1: 0.7, // Strategic - weighted less for early stage
    2: 0.8, // Managerial
    3: 0.9, // Conversational
    4: 1.0, // Executional - full weight
  };

  // Calculate adjusted scores based on depth
  Object.entries(skills).forEach(([category, skillSet]) => {
    Object.entries(skillSet).forEach(([skill, data]) => {
      const rawScore = data.score;
      const depth = data.depth;

      // Adjust score based on depth level weight
      const depthWeight = depthWeights[depth] || 1.0;
      const adjustedScore = rawScore * depthWeight;

      // Store both raw and adjusted scores
      skills[category][skill].scores = {
        raw: rawScore,
        adjusted: adjustedScore,
        depth: depth,
      };
    });
  });

  return {
    gaps: calculateSkillGaps(skills, weights, normalizedStage),
    score: calculateMaturityScore(skills, normalizedStage),
    stageAlignment: calculateStageAlignment(skills, normalizedStage),
    capabilities: evaluateCapabilities(capabilities, normalizedStage),
  };
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

module.exports = {
  calculateSkillGaps,
  calculateMaturityScore,
  evaluateSkillsByStage,
  calculateStageAlignment,
  calculateGap,
  fixPrecision,
};
