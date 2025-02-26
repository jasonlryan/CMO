const { createClient } = require("@supabase/supabase-js");
const { debugLog } = require("../config/logging");

// More graceful handling of missing environment variables
// This allows the app to at least start up in serverless environments
// and return proper error messages rather than crashing during initialization
let supabase = null;
let supabaseError = null;

try {
  if (!process.env.SUPABASE_PROJECT_URL || !process.env.SUPABASE_ANON_KEY) {
    supabaseError = new Error("Missing Supabase environment variables");
    console.error("WARNING: " + supabaseError.message);
  } else {
    supabase = createClient(
      process.env.SUPABASE_PROJECT_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
  }
} catch (error) {
  supabaseError = error;
  console.error("ERROR initializing Supabase:", error);
}

// Initialize database schema if needed - with error handling
async function initializeSchema() {
  if (!supabase) {
    console.error("Cannot initialize schema: Supabase client not available");
    return;
  }

  try {
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
  } catch (error) {
    console.error("Schema initialization failed:", error);
    // We don't rethrow here to avoid crashing the server
  }
}

// Check Supabase status
function getSupabaseStatus() {
  return {
    available: !!supabase,
    error: supabaseError ? supabaseError.message : null,
  };
}

// Export initialized client and helper functions
module.exports = {
  supabase,
  initializeSchema,
  getSupabaseStatus,
};
