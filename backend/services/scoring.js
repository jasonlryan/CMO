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

  // Check each required cluster exists
  const missingClusters = [];
  requiredClusters.forEach((cluster) => {
    if (!skills[cluster] || typeof skills[cluster] !== "object") {
      missingClusters.push(cluster);
    }
  });

  if (missingClusters.length > 0) {
    throw new Error(
      `Missing required skill clusters: ${missingClusters.join(", ")}`
    );
  }

  // Validate each cluster has at least one skill with required properties
  const invalidClusters = [];
  requiredClusters.forEach((cluster) => {
    const clusterSkills = skills[cluster];
    if (Object.keys(clusterSkills).length === 0) {
      invalidClusters.push(`${cluster} (empty)`);
    } else {
      // Check if at least one skill has the required properties
      let hasValidSkill = false;
      for (const [skillName, skillData] of Object.entries(clusterSkills)) {
        if (
          skillData &&
          typeof skillData === "object" &&
          typeof skillData.score === "number"
        ) {
          hasValidSkill = true;
          break;
        }
      }
      if (!hasValidSkill) {
        invalidClusters.push(`${cluster} (no valid skills)`);
      }
    }
  });

  if (invalidClusters.length > 0) {
    throw new Error(`Invalid skill clusters: ${invalidClusters.join(", ")}`);
  }
}

/**
 * Computes a composite depth alignment score per cluster.
 * For each skill in a cluster, the gap is calculated as:
 *   gap = expectedDepth - reportedDepth (if reportedDepth < expectedDepth; else 0)
 * The composite score is then:
 *   composite = 1 - (totalGap / totalMaxGap)
 *
 * Returns an object with a composite score for each cluster.
 */
function computeCompositeDepthScores(skills, maturityStage) {
  const compositeScores = {};
  // For each category (hardSkills, softSkills, etc.)
  for (const category in skills) {
    let totalGap = 0;
    let totalMaxGap = 0;
    let count = 0;
    for (const skill in skills[category]) {
      const data = skills[category][skill];
      const reported =
        data.reportedDepth !== undefined ? data.reportedDepth : data.depth || 1;
      const expected =
        (DEPTH_LEVELS[maturityStage] &&
          DEPTH_LEVELS[maturityStage][category] &&
          DEPTH_LEVELS[maturityStage][category][skill]) ||
        1;
      const gap = Math.max(0, expected - reported);
      totalGap += gap;
      // Maximum gap: if reportedDepth was 1, gap = expected - 1.
      totalMaxGap += Math.max(0, expected - 1);
      count++;
    }
    compositeScores[category] = fixPrecision(
      totalMaxGap > 0 ? 1 - totalGap / totalMaxGap : 1
    );
  }
  return compositeScores;
}

/**
 * @param {Object} skills - Validated skills structure
 * @param {string} maturityStage - From profile.maturity_stage.best_fit
 */
function evaluateSkillsByStage(skills, maturityStage) {
  try {
    // Validate skills structure first
    try {
      validateSkillsStructure(skills);
    } catch (error) {
      errorLog("Invalid skills structure:", error.message);
      errorLog("Profile maturity stage:", maturityStage);
      warnLog("Using default skills structure");
      skills = JSON.parse(JSON.stringify(CMO_PROFILE_TEMPLATE.skills));
    }

    console.log("[Scoring Input] Skills Structure:", {
      hasHardSkills: !!skills.hardSkills,
      hasSoftSkills: !!skills.softSkills,
      skillCount: Object.keys(skills).length,
    });

    debugLog("Stage received by scoring:", maturityStage);

    // Normalize maturityStage
    let scoringStage = "Growth"; // Default fallback

    if (maturityStage) {
      // Remove " Stage" suffix if present
      scoringStage = maturityStage.replace(" Stage", "");

      // Check if the normalized stage is valid
      if (!STAGE_WEIGHTS[scoringStage]) {
        warnLog(`Invalid stage "${scoringStage}", using Growth`);
        scoringStage = "Growth";
      }
    } else {
      warnLog("Missing maturity stage, using Growth");
    }

    const weights = STAGE_WEIGHTS[scoringStage];

    // Process skill scores
    Object.entries(skills).forEach(([category, skillSet]) => {
      Object.entries(skillSet).forEach(([skill, data]) => {
        const rawScore = data.score;

        skills[category][skill].scores = {
          raw: rawScore,
        };
      });
    });

    const depthStage = maturityStage?.depth || scoringStage;

    // Existing per-skill depth analysis
    const perSkillDepth = assessDepthLevels(skills, depthStage);

    // NEW: Compute composite depth alignment scores per cluster
    const compositeDepth = computeCompositeDepthScores(skills, depthStage);
    const clusterKeys = Object.keys(compositeDepth);
    const overallComposite = fixPrecision(
      clusterKeys.reduce((sum, key) => sum + compositeDepth[key], 0) /
        clusterKeys.length
    );

    // Build a narrative if any cluster composite score is low (e.g., below 0.8)
    const narrativeParts = [];
    for (const [category, score] of Object.entries(compositeDepth)) {
      if (score < 0.8) {
        narrativeParts.push(
          `The ${category} composite depth score is ${Math.round(
            score * 100
          )}%, below expectations.`
        );
      }
    }
    const narrative =
      narrativeParts.length > 0
        ? narrativeParts.join(" ")
        : "All skill clusters meet expected depth levels.";

    // NEW: Generate depth analysis by reported depth level
    const depthLevelAnalysis = populateDepthAnalysis(skills);

    const results = {
      gaps: calculateSkillGaps(skills, weights, scoringStage),
      score: calculateMaturityScore(skills, scoringStage),
      stageAlignment: calculateStageAlignment(skills, scoringStage),
      capabilities: evaluateCapabilities(skills, scoringStage),
      depthAnalysis: {
        perSkill: perSkillDepth, // existing per-skill analysis
        composite: compositeDepth, // new composite per-cluster scores
        overall: overallComposite, // overall composite score
        narrative: narrative,
        byLevel: depthLevelAnalysis, // NEW: analysis by reported depth level
      },
    };

    return results;
  } catch (error) {
    errorLog("Error in evaluateSkillsByStage:", error);
    // Return a minimal valid result structure to prevent downstream errors
    return {
      gaps: {},
      score: 0.5,
      stageAlignment: {
        matches: false,
        gaps: {},
        recommendations: ["Error in skill evaluation"],
      },
      capabilities: [],
      depthAnalysis: {
        perSkill: {},
        composite: {},
        overall: 0.5,
        narrative: "Unable to analyze skill depths due to an error.",
        byLevel: {
          strategic: {
            level: 1,
            skills: [],
            evidence: [],
            narrative: "Error in depth analysis.",
          },
          managerial: {
            level: 2,
            skills: [],
            evidence: [],
            narrative: "Error in depth analysis.",
          },
          conversational: {
            level: 3,
            skills: [],
            evidence: [],
            narrative: "Error in depth analysis.",
          },
          executional: {
            level: 4,
            skills: [],
            evidence: [],
            narrative: "Error in depth analysis.",
          },
        },
      },
    };
  }
}

function calculateStageAlignment(skills, stage) {
  debugLog("Processing stage alignment:", {
    stage: stage,
    skills: Object.keys(skills),
  });

  // Ensure we have a valid stage, defaulting to "Growth" if not
  if (!stage || !STAGE_WEIGHTS[stage]) {
    warnLog(
      `Invalid stage "${stage}" in calculateStageAlignment, using Growth as fallback`
    );
    stage = "Growth";
  }

  const weights = STAGE_WEIGHTS[stage];

  // Validate that weights exist
  if (!weights) {
    errorLog(`Critical error: No weights found for stage "${stage}"`);
    // Return a default alignment structure to prevent crashes
    return {
      matches: false,
      gaps: {},
      recommendations: [
        "Unable to calculate stage alignment due to missing configuration",
      ],
    };
  }

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

/**
 * Categorizes skills by their reported depth levels and populates the depthAnalysis section
 * @param {Object} skills - The skills object from the profile
 * @returns {Object} The populated depthAnalysis object
 */
function populateDepthAnalysis(skills) {
  // Initialize the depth analysis structure
  const depthAnalysis = {
    strategic: {
      level: 1,
      skills: [],
      evidence: [],
      narrative: "",
    },
    managerial: {
      level: 2,
      skills: [],
      evidence: [],
      narrative: "",
    },
    conversational: {
      level: 3,
      skills: [],
      evidence: [],
      narrative: "",
    },
    executional: {
      level: 4,
      skills: [],
      evidence: [],
      narrative: "",
    },
  };

  // Map depth levels to their corresponding categories
  const depthMap = {
    1: "strategic",
    2: "managerial",
    3: "conversational",
    4: "executional",
  };

  // Process each skill category and skill
  Object.entries(skills).forEach(([category, skillSet]) => {
    Object.entries(skillSet).forEach(([skillName, skillData]) => {
      // Skip skills with a score of 0 (not demonstrated or assessed)
      if (skillData.score <= 0) {
        return;
      }

      // Get the reported depth, defaulting to 1 if not present
      const reportedDepth = skillData.reportedDepth || skillData.depth || 1;

      // Get the corresponding depth category
      const depthCategory = depthMap[reportedDepth];

      if (depthCategory) {
        // Add the skill to the appropriate depth level
        depthAnalysis[depthCategory].skills.push({
          name: skillName,
          category: category,
          score: skillData.score,
        });

        // Add evidence if available
        if (skillData.evidence && skillData.evidence.length > 0) {
          // Add up to 2 pieces of evidence per skill to avoid overwhelming the report
          const relevantEvidence = skillData.evidence
            .slice(0, 2)
            .map((item) => `${skillName}: ${item}`);
          depthAnalysis[depthCategory].evidence.push(...relevantEvidence);
        }
      }
    });
  });

  // Generate narratives for each depth level
  Object.keys(depthAnalysis).forEach((level) => {
    const skillCount = depthAnalysis[level].skills.length;

    if (skillCount === 0) {
      depthAnalysis[
        level
      ].narrative = `No skills identified at ${level} level.`;
    } else {
      // Group skills by category for better narrative
      const categoryCounts = {};
      depthAnalysis[level].skills.forEach((skill) => {
        categoryCounts[skill.category] =
          (categoryCounts[skill.category] || 0) + 1;
      });

      // Create narrative based on skill categories
      const categoryDescriptions = Object.entries(categoryCounts)
        .map(([category, count]) => {
          const categoryName = category
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .replace(/Skills$/, "");
          return `${count} ${categoryName} skills`;
        })
        .join(", ");

      // Map level names to more descriptive terms and descriptions
      const levelDescriptions = {
        strategic: {
          title: "Strategic (Level 1)",
          description:
            "deep expertise with ability to innovate and lead strategic initiatives",
        },
        managerial: {
          title: "Managerial (Level 2)",
          description:
            "solid understanding with ability to manage and guide others",
        },
        conversational: {
          title: "Conversational (Level 3)",
          description:
            "working knowledge sufficient to engage meaningfully in discussions",
        },
        executional: {
          title: "Executional (Level 4)",
          description:
            "basic familiarity with ability to execute under guidance",
        },
      };

      // Get top skills for this level (up to 3)
      const topSkills = depthAnalysis[level].skills
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((skill) => skill.name.replace(/_/g, " "))
        .join(", ");

      // Create a more detailed narrative
      depthAnalysis[level].narrative =
        `Demonstrates ${levelDescriptions[level].title} proficiency (${levelDescriptions[level].description}) in ${categoryDescriptions}. ` +
        (topSkills ? `Notable strengths include ${topSkills}.` : "");
    }
  });

  return depthAnalysis;
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
  computeCompositeDepthScores,
  populateDepthAnalysis,
};
