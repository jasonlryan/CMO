// Remove types and simplify
function calculateSkillGaps(skills, targetWeights) {
  const gaps = {
    hardSkills: {},
    softSkills: {},
  };

  // Calculate gaps for hard skills
  Object.entries(skills.hardSkills).forEach(([skill, score]) => {
    gaps.hardSkills[skill] = Math.max(0, targetWeights.hardSkills - score);
  });

  // Calculate gaps for soft skills
  Object.entries(skills.softSkills).forEach(([skill, score]) => {
    gaps.softSkills[skill] = Math.max(0, targetWeights.softSkills - score);
  });

  return gaps;
}

function calculateMaturityScore(skills, maturityWeights) {
  let totalScore = 0;
  let totalWeight = 0;

  // Calculate weighted scores for hard skills
  Object.entries(skills.hardSkills).forEach(([_, score]) => {
    totalScore += score * maturityWeights.hardSkills;
    totalWeight += maturityWeights.hardSkills;
  });

  // Calculate weighted scores for soft skills
  Object.entries(skills.softSkills).forEach(([_, score]) => {
    totalScore += score * maturityWeights.softSkills;
    totalWeight += maturityWeights.softSkills;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

function evaluateSkillsByStage(skills, maturityWeights) {
  return {
    gaps: calculateSkillGaps(skills, maturityWeights),
    score: calculateMaturityScore(skills, maturityWeights),
  };
}

module.exports = {
  calculateSkillGaps,
  calculateMaturityScore,
  evaluateSkillsByStage,
};
