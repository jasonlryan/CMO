// Remove types and simplify
function calculateSkillGaps(skills, targetWeights) {
  // Add null safety and normalize input
  if (!targetWeights) {
    console.warn("\nMissing targetWeights in calculateSkillGaps");
    targetWeights = {
      hardSkills: 0.8,
      softSkills: 0.8,
      leadershipSkills: 0.8,
      commercialAcumen: 0.8,
    };
  }

  const gaps = {
    hardSkills: {},
    softSkills: {},
    leadershipSkills: {},
    commercialAcumen: {},
  };

  // Helper to fix precision and normalize scores
  const fixPrecision = (num) => Number(Number(num).toFixed(1)) || 0;

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

// Stage-specific weights
const STAGE_WEIGHTS = {
  "Early-Stage": {
    hardSkills: 0.4,
    softSkills: 0.2,
    leadershipSkills: 0.2,
    commercialAcumen: 0.2,
  },
  Growth: {
    hardSkills: 0.3,
    softSkills: 0.3,
    leadershipSkills: 0.2,
    commercialAcumen: 0.2,
  },
  "Scale-Up": {
    hardSkills: 0.2,
    softSkills: 0.3,
    leadershipSkills: 0.3,
    commercialAcumen: 0.2,
  },
  Enterprise: {
    hardSkills: 0.2,
    softSkills: 0.2,
    leadershipSkills: 0.3,
    commercialAcumen: 0.3,
  },
};

function calculateMaturityScore(skills, stage) {
  const weights = STAGE_WEIGHTS[stage];
  let totalScore = 0;
  let totalWeight = 0;

  // Calculate weighted scores by cluster
  Object.entries(skills).forEach(([cluster, clusterSkills]) => {
    const clusterWeight = weights[cluster];
    const clusterScore =
      Object.values(clusterSkills).reduce((sum, score) => sum + score, 0) /
      Object.keys(clusterSkills).length;

    totalScore += clusterScore * clusterWeight;
    totalWeight += clusterWeight;
  });

  return totalWeight > 0 ? Number((totalScore / totalWeight).toFixed(1)) : 0;
}

function evaluateSkillsByStage(skills, stage) {
  // 1. Normalize stage name
  const normalizedStage = stage?.replace(" Stage", "");

  // 2. Get weights with fallback
  const weights = STAGE_WEIGHTS[normalizedStage] || STAGE_WEIGHTS["Growth"];

  if (!STAGE_WEIGHTS[normalizedStage]) {
    console.warn(`\nInvalid stage "${stage}", using Growth stage weights`);
  }

  // 3. Use normalized weights
  return {
    gaps: calculateSkillGaps(skills, weights),
    score: calculateMaturityScore(skills, normalizedStage),
    stageAlignment: calculateStageAlignment(skills, normalizedStage),
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

module.exports = {
  calculateSkillGaps,
  calculateMaturityScore,
  evaluateSkillsByStage,
  calculateStageAlignment,
};
