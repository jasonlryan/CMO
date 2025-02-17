// backend/index.js

// Load environment variables from .env
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { server } = require("./api/server.js"); // Using server.js

// List of required environment variables
const requiredEnvVars = [
  "OPENAI_API_KEY",
  "SUPABASE_PROJECT_URL",
  "SUPABASE_ANON_KEY",
];

// Check for missing variables and throw an error if any are missing
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

// Initialize the Supabase client
const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_ANON_KEY
);

// Optionally export the supabase client for use in other modules
module.exports = { supabase };

// For now, simply log that the backend configuration is complete.
console.log("Backend initialized successfully using Node.js.");

// If you plan to add an HTTP server later (for example, using Express or Fastify),
// you could set it up here.

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
