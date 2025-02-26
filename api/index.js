// Vercel serverless function handler
// This file should be referenced in vercel.json as the main serverless function for API routes

// Import our Express app with request handler
const handler = require("../backend/index.js");

// Export the handler function
module.exports = handler;
