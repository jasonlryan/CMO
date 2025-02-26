// vercel.js - Entry point for Vercel deployment
// This file is configured in the Vercel project settings as the main entry point

// Load environment variables
require("dotenv").config();

// Import our server from the backend/index.js combined export
const { server } = require("./backend/index.js");

// For Vercel, we need to export the Express app directly
module.exports = server;
