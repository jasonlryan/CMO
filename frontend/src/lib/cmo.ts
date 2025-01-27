import { supabase } from './supabase';
import type { CMOProfile, AssessmentResult, MaturityStage } from './types';

// Create new CMO profile
export async function createProfile(profile: Omit<CMOProfile, 'id'>) {
  const { data, error } = await supabase
    .from('cmo_profiles')
    .insert([profile])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get CMO profile by ID
export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('cmo_profiles')
    .select(`
      *,
      assessment_results (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Update CMO profile
export async function updateProfile(id: string, updates: Partial<CMOProfile>) {
  const { data, error } = await supabase
    .from('cmo_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Save assessment results
export async function saveAssessmentResults(
  profileId: string, 
  results: Omit<AssessmentResult, 'id' | 'profile_id'>
) {
  const { data, error } = await supabase
    .from('assessment_results')
    .upsert({
      profile_id: profileId,
      ...results
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all profiles (with optional filters)
export async function getProfiles(filters?: {
  industry?: string;
  organizationType?: 'B2B' | 'B2C' | 'Hybrid';
}) {
  let query = supabase
    .from('cmo_profiles')
    .select(`
      *,
      assessment_results (*)
    `);

  if (filters?.industry) {
    query = query.eq('industry', filters.industry);
  }
  if (filters?.organizationType) {
    query = query.eq('organization_type', filters.organizationType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Get maturity stages
export async function getMaturityStages() {
  const { data, error } = await supabase
    .from('company_maturity_stages')
    .select('*');

  if (error) throw error;
  return data;
}

// Get profiles by maturity stage
export async function getProfilesByMaturityStage(stageId: string) {
  const { data, error } = await supabase
    .from('cmo_profiles')
    .select(`
      *,
      assessment_results (*),
      company_maturity_stages (*)
    `)
    .eq('target_maturity_stage', stageId);

  if (error) throw error;
  return data;
}

// Get maturity stage
export async function getMaturityStage(id: string) {
  const { data, error } = await supabase
    .from('company_maturity_stages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MaturityStage;
}

// Calculate weighted score
export async function calculateMaturityScore(
  profileId: string,
  scores: {
    hardSkills: number;
    softSkills: number;
    leadershipSkills: number;
    commercialAcumen: number;
  }
) {
  // First get the profile
  const { data: profile, error: profileError } = await supabase
    .from('cmo_profiles')
    .select('maturity_stage_id')
    .eq('id', profileId)
    .single();

  if (profileError) throw profileError;
  if (!profile.maturity_stage_id) {
    throw new Error('No maturity stage set for profile');
  }

  // Then get the maturity stage
  const maturityStage = await getMaturityStage(profile.maturity_stage_id);
  
  // Calculate weighted score
  let weightedScore = 0;
  const weights = maturityStage.skill_weightings;
  
  Object.keys(scores).forEach((key) => {
    const scoreKey = key as keyof typeof scores;
    weightedScore += scores[scoreKey] * weights[scoreKey];
  });

  return weightedScore;
}

// Evaluate skills based on maturity stage
export async function evaluateSkillsByStage(
  profileId: string,
  skills: CMOProfile['skills']
) {
  // Get profile with maturity stage
  const { data: profile, error: profileError } = await supabase
    .from('cmo_profiles')
    .select('maturity_stage_id')
    .eq('id', profileId)
    .single();

  if (profileError) throw profileError;
  if (!profile.maturity_stage_id) {
    throw new Error('No maturity stage set for profile');
  }

  // Get maturity stage details
  const maturityStage = await getMaturityStage(profile.maturity_stage_id);

  // Calculate score based on maturity expectations
  const stageWeights = maturityStage.skill_weightings;
  let totalScore = 0;

  // Calculate weighted scores
  for (const [category, weight] of Object.entries(stageWeights)) {
    const skillKey = category as keyof typeof skills;
    const categorySkills = skills[skillKey];
    
    // Average the skills in this category
    const categoryScore = Object.values(categorySkills).reduce(
      (sum, score) => sum + score, 
      0
    ) / Object.keys(categorySkills).length;

    totalScore += categoryScore * weight;
  }

  return totalScore;
} 