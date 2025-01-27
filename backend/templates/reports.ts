import type { CMOProfile } from '../types';
import type { ProcessedTranscript } from '../types';

function assessSkillDepth(score: number): string {
  if (score >= 0.9) return 'Expert';
  if (score >= 0.7) return 'Proficient';
  if (score >= 0.5) return 'Competent';
  return 'Developing';
}

export function generateSkillAnalysis(
  skills: CMOProfile['skills'],
  targetWeight: number
) {
  const analysis = {
    hardSkills: [] as Array<{skill: string; score: number; target: number; gap: number}>,
    softSkills: [] as Array<{skill: string; score: number; target: number; gap: number}>
  };

  // Process hard skills
  Object.entries(skills.hardSkills).forEach(([skill, score]) => {
    analysis.hardSkills.push({
      skill,
      score,
      target: targetWeight,
      gap: Math.max(0, targetWeight - score)
    });
  });

  // Process soft skills
  Object.entries(skills.softSkills).forEach(([skill, score]) => {
    analysis.softSkills.push({
      skill,
      score,
      target: targetWeight,
      gap: Math.max(0, targetWeight - score)
    });
  });

  return analysis;
}

export function generateDepthAnalysis(depthLevels: CMOProfile['skill_depth_levels']) {
  return Object.entries(depthLevels).map(([level, skills]) => ({
    level,
    skills: Object.entries(skills).map(([skill, score]) => ({
      skill,
      score,
      assessment: assessSkillDepth(score)
    }))
  }));
}

export function generateNextSteps(profile: CMOProfile): string[] {
  const steps: string[] = [];
  
  // Add steps based on growth areas
  profile.growth_areas.forEach(area => {
    steps.push(`Focus on developing ${area}`);
  });

  return steps;
}

export function calculateSkillGaps(skills: CMOProfile['skills'], target: number) {
  const gaps = {
    hardSkills: {} as Record<string, number>,
    softSkills: {} as Record<string, number>
  };

  Object.entries(skills.hardSkills).forEach(([skill, score]) => {
    gaps.hardSkills[skill] = Math.max(0, target - score);
  });

  Object.entries(skills.softSkills).forEach(([skill, score]) => {
    gaps.softSkills[skill] = Math.max(0, target - score);
  });

  return gaps;
}

export function identifyRiskFactors(profile: CMOProfile) {
  return profile.growth_areas.map(area => ({
    area,
    risk_level: 'Medium',
    mitigation: `Focused development in ${area}`
  }));
}

export function generateOnboardingFocus(profile: CMOProfile) {
  return {
    immediate_focus: profile.growth_areas[0] || 'General skill development',
    key_strengths: profile.key_strengths,
    development_areas: profile.growth_areas
  };
}

export function generateReports(data: ProcessedTranscript) {
  const candidateReport = {
    title: "CMO Assessment Report - Candidate View",
    generated: new Date().toISOString(),
    candidate: {
      role: data.experience.roles[0],
      experience: data.experience.years,
    },
    skillAnalysis: generateSkillAnalysis(data.skills, 0.8),
    depthAnalysis: generateDepthAnalysis(data.skill_depth_levels)
  };

  const clientReport = {
    title: "CMO Assessment Report - Client View",
    generated: new Date().toISOString(),
    candidate: {
      profile: {
        current_role: data.experience.roles[0],
        years_experience: data.experience.years,
        industry: data.industry,
        organization_type: data.organization_type,
      }
    },
    skillAssessment: {
      overview: generateSkillAnalysis(data.skills, 0.8),
      depthAnalysis: generateDepthAnalysis(data.skill_depth_levels),
      keyStrengths: data.key_strengths
    },
    maturityFit: data.maturity_stage
  };

  return { candidateReport, clientReport };
}

// Move other report generation functions here 