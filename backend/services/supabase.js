const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_ANON_KEY
);

const supabaseService = {
  async saveAssessment(data) {
    const { data: saved, error } = await supabase
      .from("assessments")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return saved;
  },

  async getProfile(id) {
    const { data, error } = await supabase
      .from("cmo_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createProfile(profile) {
    const { data, error } = await supabase
      .from("cmo_profiles")
      .insert([profile])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(id, updates) {
    const { data, error } = await supabase
      .from("cmo_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

module.exports = { supabaseService };
