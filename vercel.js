// vercel.js - Entry point for Vercel deployment
// This file is configured in the Vercel project settings as the main entry point

// Load environment variables
require("dotenv").config();

// Import our server handler function from backend/index.js
const serverHandler = require("./backend/index.js");

// Export the handler function directly for Vercel
module.exports = serverHandler;
