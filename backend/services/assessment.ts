import { openaiService } from "./openai";
import { generateReports } from "../templates/reports";
import { evaluateSkillsByStage } from "./scoring";
import path from "path";
import fs from "fs";
import type { CMOProfile, AssessmentResult } from '../types';

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

async function processTranscript(transcript: string): Promise<ProcessedTranscript> {
  const analysis = await openaiService.analyze(transcript);
  return {
    keyPoints: [],  // Extracted from analysis
    skills: analysis.skills,
    skill_depth_levels: analysis.skill_depth_levels,
    experience: {
      years: analysis.years_experience,
      roles: [analysis.current_role]
    }
  };
}

export async function handleAssessment(transcript: string) {
  try {
    // 1. Process transcript
    const processed = await processTranscript(transcript);
    
    // 2. Generate reports
    const { candidateReport, clientReport } = generateReports(processed);
    
    // 3. Save and return
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