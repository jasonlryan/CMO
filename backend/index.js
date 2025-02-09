// backend/index.js

// Load environment variables from .env
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

// List of required environment variables
const requiredEnvVars = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"];

// Check for missing variables and throw an error if any are missing
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

// Initialize the Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Optionally export the supabase client for use in other modules
module.exports = { supabase };

// For now, simply log that the backend configuration is complete.
console.log("Backend initialized successfully using Node.js.");

// If you plan to add an HTTP server later (for example, using Express or Fastify),
// you could set it up here.
