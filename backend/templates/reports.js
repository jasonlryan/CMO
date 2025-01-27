// Remove TypeScript types
function assessSkillDepth(score) {
  if (score >= 0.9) return "Expert";
  if (score >= 0.7) return "Proficient";
  if (score >= 0.5) return "Competent";
  return "Developing";
}

function generateSkillAnalysis(skills, targetWeight) {
  // Add safety check
  if (!skills || !skills.hardSkills || !skills.softSkills) {
    console.warn("Missing skills data structure");
    return {
      hardSkills: [],
      softSkills: [],
    };
  }

  const analysis = {
    hardSkills: [],
    softSkills: [],
  };

  // Process hard skills
  Object.entries(skills.hardSkills || {}).forEach(([skill, score]) => {
    analysis.hardSkills.push({
      skill,
      score,
      target: targetWeight,
      gap: Math.max(0, targetWeight - score),
    });
  });

  // Process soft skills
  Object.entries(skills.softSkills || {}).forEach(([skill, score]) => {
    analysis.softSkills.push({
      skill,
      score,
      target: targetWeight,
      gap: Math.max(0, targetWeight - score),
    });
  });

  return analysis;
}

function generateDepthAnalysis(depthLevels) {
  // Add safety check
  if (!depthLevels) {
    console.warn("Missing depth levels data structure");
    return [];
  }

  try {
    return Object.entries(depthLevels || {}).map(([level, skills]) => ({
      level,
      skills: Object.entries(skills || {}).map(([skill, score]) => ({
        skill,
        score,
        assessment: assessSkillDepth(score),
      })),
    }));
  } catch (error) {
    console.warn("Error processing depth levels:", error);
    return [];
  }
}

function generateNextSteps(profile) {
  // Add safety check
  if (!profile || !profile.growth_areas) {
    console.warn("Missing profile or growth areas");
    return [];
  }

  const steps = [];
  profile.growth_areas.forEach((area) => {
    steps.push(`Focus on developing ${area}`);
  });
  return steps;
}

module.exports = {
  generateSkillAnalysis,
  generateDepthAnalysis,
  generateNextSteps,
};
