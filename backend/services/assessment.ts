import { openaiService } from "./openai";
import { 
  generateSkillAnalysis, 
  generateDepthAnalysis, 
  generateNextSteps 
} from "../templates/reports.js";
import { evaluateSkillsByStage } from "./scoring.js";
import path from "path";
import fs from "fs";
import type { CMOProfile, AssessmentResult } from '../types.ts';

const PROFILES_DIR = path.join(__dirname, "../data/profiles");

// Moved from frontend/src/lib/assessment.ts
interface ProcessedTranscript {
  keyPoints: string[];
  skills: CMOProfile['skills'];
  skill_depth_levels: CMOProfile['skill_depth_levels'];
  experience: {
    years: number;
    roles: string[];
  };
}

async function processTranscript(transcript: string): Promise<CMOProfile> {
  const analysis = await openaiService.analyze(transcript);
  return {
    id: new Date().toISOString(),
    name: "Anonymous",
    current_role: analysis.current_role,
    years_experience: analysis.years_experience,
    industry: analysis.industry,
    organization_type: analysis.organization_type,
    skills: analysis.skills,
    skill_depth_levels: analysis.skill_depth_levels,
    key_strengths: analysis.key_strengths,
    growth_areas: analysis.growth_areas,
    maturity_stage: analysis.maturity_stage
  };
}

function generateReports(profile: CMOProfile) {
  // Generate candidate report
  const candidateReport = {
    title: "CMO Assessment Report - Candidate View",
    generated: new Date().toISOString(),
    candidate: {
      name: profile.name,
      role: profile.current_role,
      experience: profile.years_experience,
    },
    skillAnalysis: generateSkillAnalysis(profile.skills, 0.8),
    depthAnalysis: generateDepthAnalysis(profile.skill_depth_levels),
    developmentAreas: generateNextSteps(profile),
  };

  // Generate client report
  const clientReport = {
    title: "CMO Assessment Report - Client View",
    generated: new Date().toISOString(),
    candidate: {
      profile: {
        current_role: profile.current_role,
        years_experience: profile.years_experience,
        industry: profile.industry,
        organization_type: profile.organization_type,
      },
    },
    skillAssessment: {
      overview: profile.skills,
      depthAnalysis: profile.skill_depth_levels,
      keyStrengths: profile.key_strengths,
    },
    maturityFit: profile.maturity_stage,
  };

  return { candidateReport, clientReport };
}

export async function handleAssessment(transcript: string) {
  try {
    // 1. Process transcript
    const processed = await processTranscript(transcript);
    
    // 2. Generate reports
    const { candidateReport, clientReport } = generateReports(processed);
    
    // 3. Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportsDir = path.join(__dirname, "../data/reports");
    fs.mkdirSync(reportsDir, { recursive: true });

    fs.writeFileSync(
      path.join(reportsDir, `${timestamp}_candidate_report.json`),
      JSON.stringify(candidateReport, null, 2)
    );

    fs.writeFileSync(
      path.join(reportsDir, `${timestamp}_client_report.json`),
      JSON.stringify(clientReport, null, 2)
    );
    
    // 4. Return results
    return {
      status: 'success',
      data: processed,
      reports: {
        candidate: candidateReport,
        client: clientReport
      }
    };
  } catch (error) {
    console.error('Assessment failed:', error);
    throw error;
  }
} 