import type { CMOProfile, AssessmentResult, MaturityStage } from './types';

// Report generation interfaces
interface ReportSection {
  title: string;
  content: unknown;
}

interface Report {
  id: string;
  profileId: string;
  sections: ReportSection[];
  createdAt: Date;
  type: 'candidate' | 'client';
}

// Helper functions
function generateSkillAnalysis(
  skills: Record<string, number>,
  targetWeight: number
) {
  return Object.entries(skills).map(([skill, score]) => ({
    skill,
    score,
    target: targetWeight,
    gap: Math.max(0, targetWeight - score)
  }));
}

function generateDepthAnalysis(
  depthLevels: CMOProfile['skill_depth_levels']
) {
  return Object.entries(depthLevels).map(([level, skills]) => ({
    level,
    skills: Object.entries(skills).map(([skill, score]) => ({
      skill,
      score,
      assessment: assessSkillDepth(score)
    }))
  }));
}

function generateNextSteps(
  assessment: AssessmentResult,
  maturityStage: MaturityStage
): string[] {
  const steps: string[] = [];
  const scores = assessment.category_scores;

  Object.entries(scores).forEach(([category, score]) => {
    const target = maturityStage.skill_weightings[category as keyof typeof scores];
    if (score < target) {
      steps.push(`Focus on developing ${category} capabilities`);
    }
  });

  return steps;
}

function generateKeyQualifications(profile: CMOProfile): string[] {
  const qualifications: string[] = [];
  
  // Experience-based qualifications
  qualifications.push(`${profile.years_experience}+ years of experience`);
  qualifications.push(`Current role: ${profile.current_role}`);
  
  // Skills-based qualifications
  Object.entries(profile.skills).forEach(([category, skills]) => {
    const topSkills = Object.entries(skills)
      .filter(([_, score]) => score >= 0.8)
      .map(([skill]) => skill);
    if (topSkills.length > 0) {
      qualifications.push(`Strong ${category}: ${topSkills.join(', ')}`);
    }
  });

  return qualifications;
}

function calculateSkillGaps(
  current: AssessmentResult['category_scores'],
  required: MaturityStage['skill_weightings']
) {
  return Object.entries(required).reduce((gaps, [category, target]) => {
    const currentScore = current[category as keyof typeof current] || 0;
    if (currentScore < target) {
      gaps[category] = target - currentScore;
    }
    return gaps;
  }, {} as Record<string, number>);
}

function identifyRiskFactors(
  assessment: AssessmentResult,
  maturityStage: MaturityStage
): string[] {
  const risks: string[] = [];
  const scores = assessment.category_scores;

  Object.entries(scores).forEach(([category, score]) => {
    const target = maturityStage.skill_weightings[category as keyof typeof scores];
    if (score < target * 0.7) {
      risks.push(`Significant gap in ${category} capabilities`);
    }
  });

  return risks;
}

function generateOnboardingFocus(assessment: AssessmentResult): string[] {
  const focus: string[] = [];
  const scores = assessment.category_scores;

  Object.entries(scores).forEach(([category, score]) => {
    if (score < 0.7) {
      focus.push(`${category} capability development`);
    }
  });

  return focus;
}

function assessSkillDepth(score: number): string {
  if (score >= 0.9) return 'Expert';
  if (score >= 0.7) return 'Proficient';
  if (score >= 0.5) return 'Competent';
  return 'Developing';
}

// Export all functions
export {
  type Report,
  type ReportSection,
  generateSkillAnalysis,
  generateDepthAnalysis,
  generateNextSteps,
  generateKeyQualifications,
  calculateSkillGaps,
  identifyRiskFactors,
  generateOnboardingFocus
}; 