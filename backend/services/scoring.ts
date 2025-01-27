// NEW FILE: Move scoring logic here
import type { CMOProfile } from '../types';

export function calculateSkillGaps(
  skills: CMOProfile['skills'],
  targetWeights: {
    hardSkills: number;
    softSkills: number;
    leadershipSkills: number;
    commercialAcumen: number;
  }
) {
  const gaps = {
    hardSkills: {} as Record<string, number>,
    softSkills: {} as Record<string, number>
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

export function calculateMaturityScore(
  skills: CMOProfile['skills'],
  maturityWeights: {
    hardSkills: number;
    softSkills: number;
    leadershipSkills: number;
    commercialAcumen: number;
  }
) {
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

export function evaluateSkillsByStage(
  skills: CMOProfile['skills'],
  maturityWeights: {
    hardSkills: number;
    softSkills: number;
    leadershipSkills: number;
    commercialAcumen: number;
  }
) {
  return {
    gaps: calculateSkillGaps(skills, maturityWeights),
    score: calculateMaturityScore(skills, maturityWeights)
  };
} 