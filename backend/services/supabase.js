const { createClient } = require("@supabase/supabase-js");
const { debugLog } = require("../config/logging");

if (!process.env.SUPABASE_PROJECT_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Initialize database schema if needed
async function initializeSchema() {
  debugLog("Checking Supabase schema...");

  // Verify assessments table exists
  const { error: assessmentsError } = await supabase
    .from("assessments")
    .select("id")
    .limit(1);

  if (assessmentsError?.code === "42P01") {
    // Table doesn't exist
    debugLog("Creating assessments table...");
    const { error } = await supabase.rpc("init_assessments_table");
    if (error) throw error;
  }

  // Verify profiles table exists
  const { error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (profilesError?.code === "42P01") {
    // Table doesn't exist
    debugLog("Creating profiles table...");
    const { error } = await supabase.rpc("init_profiles_table");
    if (error) throw error;
  }

  // Verify reports table exists
  const { error: reportsError } = await supabase
    .from("reports")
    .select("id")
    .limit(1);

  if (reportsError?.code === "42P01") {
    // Table doesn't exist
    debugLog("Creating reports table...");
    const { error } = await supabase.rpc("init_reports_table");
    if (error) throw error;
  }

  debugLog("Schema verification complete");
}

// Export initialized client and helper functions
module.exports = {
  supabase,
  initializeSchema,
};
