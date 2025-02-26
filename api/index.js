// Vercel serverless function handler for API-only routes
// This file is used for compatibility with the new Express app

// Import our Express app with request handler
const handler = require("../backend/index.js");

// Export the handler function to be used as an API route
module.exports = (req, res) => {
  // Route requests to the backend handler
  return handler(req, res);
};
