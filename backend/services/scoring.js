// Remove types and simplify
function calculateSkillGaps(skills, targetWeights) {
  const gaps = {
    hardSkills: {},
    softSkills: {},
    leadershipSkills: {},
    commercialAcumen: {},
  };

  // Calculate gaps for hard skills
  Object.entries(skills.hardSkills).forEach(([skill, score]) => {
    gaps.hardSkills[skill] = Math.max(0, targetWeights.hardSkills - score);
  });

  // Calculate gaps for soft skills
  Object.entries(skills.softSkills).forEach(([skill, score]) => {
    gaps.softSkills[skill] = Math.max(0, targetWeights.softSkills - score);
  });

  // Add leadership skills gaps
  Object.entries(skills.leadershipSkills || {}).forEach(([skill, score]) => {
    gaps.leadershipSkills[skill] = Math.max(
      0,
      targetWeights.leadershipSkills - score
    );
  });

  // Add commercial acumen gaps
  Object.entries(skills.commercialAcumen || {}).forEach(([skill, score]) => {
    gaps.commercialAcumen[skill] = Math.max(
      0,
      targetWeights.commercialAcumen - score
    );
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

  // Add leadership skills scores
  Object.entries(skills.leadershipSkills || {}).forEach(([_, score]) => {
    totalScore += score * maturityWeights.leadershipSkills;
    totalWeight += maturityWeights.leadershipSkills;
  });

  // Add commercial acumen scores
  Object.entries(skills.commercialAcumen || {}).forEach(([_, score]) => {
    totalScore += score * maturityWeights.commercialAcumen;
    totalWeight += maturityWeights.commercialAcumen;
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
