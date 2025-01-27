import { createClient } from "@supabase/supabase-js";
import type { CMOProfile, MaturityStage } from '../types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const supabaseService = {
  async saveAssessment(data: {
    profile: any;
    scores: any;
    reports: any;
  }) {
    const { data: saved, error } = await supabase
      .from("assessments")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return saved;
  },
  
  // We should add the missing operations here instead of new files:
  // - Profile operations
  // - Maturity stage operations
  // - Query operations

  // Profile Operations
  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('cmo_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createProfile(profile: Omit<CMOProfile, 'id'>) {
    const { data, error } = await supabase
      .from('cmo_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(id: string, updates: Partial<CMOProfile>) {
    const { data, error } = await supabase
      .from('cmo_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Query Operations
  async getProfiles(filters?: {
    industry?: string;
    organizationType?: 'B2B' | 'B2C' | 'Hybrid';
  }) {
    let query = supabase.from('cmo_profiles').select('*');

    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.organizationType) {
      query = query.eq('organization_type', filters.organizationType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Maturity Stage Operations
  async getMaturityStage(id: string) {
    const { data, error } = await supabase
      .from('company_maturity_stages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MaturityStage;
  },

  async getMaturityStages() {
    const { data, error } = await supabase
      .from('company_maturity_stages')
      .select('*');

    if (error) throw error;
    return data;
  },

  async getProfilesByMaturityStage(stageId: string) {
    const { data, error } = await supabase
      .from('cmo_profiles')
      .select('*')
      .eq('target_maturity_stage', stageId);

    if (error) throw error;
    return data;
  }
}; 