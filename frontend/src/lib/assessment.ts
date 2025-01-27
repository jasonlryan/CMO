import type { CMOProfile, MaturityStage, AssessmentResult } from './types';
import { getMaturityStage, createProfile, saveAssessmentResults } from './cmo';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY  // Changed from import.meta.env
});

// Analysis prompt
export const ANALYSIS_PROMPT = `You are an expert CMO assessment system analyzing interview transcripts. Your task is to:

1. Extract and evaluate key information:
- Current role and responsibilities
- Years of experience 
- Industry expertise
- Type of organizations (B2B/B2C/Hybrid)
- Team size and scope

2. Assess skills and capabilities:

Hard Skills (score 0-1):
- Marketing strategy
- Digital marketing
- Data/analytics
- Brand development
- Marketing operations
- Budget management

Soft Skills (score 0-1):
- Leadership
- Communication
- Strategic thinking
- Change management
- Stakeholder management
- Team development

3. Identify:
- Key strengths with supporting examples
- Development areas
- Leadership style and approach
- Growth stage alignment

Provide your analysis in a structured JSON format that can be parsed by the assessment system.`;

// Types for transcript processing
export interface ProcessedTranscript {
  keyPoints: string[];
  skills: CMOProfile['skills'];
  skill_depth_levels: CMOProfile['skill_depth_levels'];
  experience: {
    years: number;
    roles: string[];
  };
}

// Report interfaces
interface AssessmentReport {
  title: string;
  content: Record<string, unknown>;
}

// 1. Process transcript using AI
export async function processTranscript(transcript: string): Promise<ProcessedTranscript> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: transcript }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return {
      keyPoints: analysis.keyPoints || [],
      skills: {
        hardSkills: analysis.hardSkills || {},
        softSkills: analysis.softSkills || {}
      },
      skill_depth_levels: analysis.skillDepthLevels || {},
      experience: {
        years: analysis.yearsExperience || 0,
        roles: analysis.roles || []
      }
    };
  } catch (error) {
    console.error('Transcript processing failed:', error);
    throw error;
  }
}

// 2. Score candidate
async function scoreCandidate(
  processed: ProcessedTranscript,
  maturityStage: MaturityStage
) {
  const hardSkillsScore = Object.values(processed.skills.hardSkills)
    .reduce((sum, score) => sum + score, 0) / Object.keys(processed.skills.hardSkills).length;

  const softSkillsScore = Object.values(processed.skills.softSkills)
    .reduce((sum, score) => sum + score, 0) / Object.keys(processed.skills.softSkills).length;

  // Apply maturity stage weightings
  const weightedHardSkills = hardSkillsScore * maturityStage.skill_weightings.hardSkills;
  const weightedSoftSkills = softSkillsScore * maturityStage.skill_weightings.softSkills;
  
  const total = (weightedHardSkills + weightedSoftSkills) / 2;

  return {
    total,
    categories: {
      hardSkills: hardSkillsScore,
      softSkills: softSkillsScore
    }
  };
}

// 3. Generate reports
function generateCandidateReport(
  profile: CMOProfile,
  assessment: AssessmentResult,
  detailed_scores: { total: number; categories: { hardSkills: number; softSkills: number } }
): AssessmentReport[] {
  return [
    {
      title: 'Executive Summary',
      content: {
        overall_score: assessment.overall_score,
        key_strengths: Object.entries(profile.skills.hardSkills)
          .filter(([_, score]) => score >= 0.8)
          .map(([skill]) => skill),
        category_scores: detailed_scores.categories
      }
    },
    {
      title: 'Skill Assessment',
      content: {
        hard_skills: {
          skills: profile.skills.hardSkills,
          score: detailed_scores.categories.hardSkills
        },
        soft_skills: {
          skills: profile.skills.softSkills,
          score: detailed_scores.categories.softSkills
        },
        depth_levels: profile.skill_depth_levels
      }
    }
  ];
}

function generateClientReport(
  profile: CMOProfile,
  assessment: AssessmentResult,
  detailed_scores: { total: number; categories: { hardSkills: number; softSkills: number } }
): AssessmentReport[] {
  return [
    {
      title: 'Candidate Overview',
      content: {
        fit_score: assessment.overall_score,
        experience_years: profile.years_experience,
        industry: profile.industry,
        skill_scores: detailed_scores.categories
      }
    },
    {
      title: 'Recommendations',
      content: {
        hiring_recommendation: detailed_scores.total >= 0.75 ? 'Recommended' : 'Consider',
        key_strengths: Object.entries(profile.skills.hardSkills)
          .filter(([_, score]) => score >= 0.8)
          .map(([skill]) => skill),
        category_performance: {
          hard_skills: detailed_scores.categories.hardSkills,
          soft_skills: detailed_scores.categories.softSkills
        }
      }
    }
  ];
}

// 4. Complete assessment flow
export async function assessCMOCandidate(
  input: string,
  companyContext: {
    stage: string,
    industry: string,
    organizationType: 'B2B' | 'B2C' | 'Hybrid'
  }
): Promise<{
  profile: CMOProfile;
  assessment: AssessmentResult;
  detailed_scores: {
    total: number;
    categories: {
      hardSkills: number;
      softSkills: number;
    };
  };
  reports: {
    candidate: AssessmentReport[];
    client: AssessmentReport[];
  };
}> {
  try {
    const processed = await processTranscript(input);
    const maturityStage = await getMaturityStage(companyContext.stage);
    const scores = await scoreCandidate(processed, maturityStage);
    
    const profile = await createProfile({
      name: "Test Candidate", // TODO: Extract from transcript
      current_role: processed.experience.roles[0],
      years_experience: processed.experience.years,
      industry: companyContext.industry,
      organization_type: companyContext.organizationType,
      skills: processed.skills,
      skill_depth_levels: processed.skill_depth_levels,
      target_maturity_stage: maturityStage.id
    });

    const assessment = await saveAssessmentResults(profile.id, {
      overall_score: scores.total,
      category_scores: scores.categories,
      recommendations: []
    });

    const reports = {
      candidate: generateCandidateReport(profile, assessment, scores),
      client: generateClientReport(profile, assessment, scores)
    };

    return {
      profile,
      assessment,
      detailed_scores: scores,
      reports
    };

  } catch (error) {
    console.error('Assessment failed:', error);
    throw error;
  }
} 