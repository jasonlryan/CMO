// vercel.js - Entry point for Vercel deployment
// This file is configured in the Vercel project settings as the main entry point

// Load environment variables
require("dotenv").config();

// Import required modules
const express = require("express");
const path = require("path");
const serverHandler = require("./backend/index.js");

// Create express app
const app = express();

// Set appropriate MIME types for all JavaScript files
app.use((req, res, next) => {
  const url = req.url;
  if (url.endsWith(".js") || url.endsWith(".mjs")) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  } else if (url.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
  }
  next();
});

// Set up API routes - all /api/* requests go to the backend handler
app.use("/api", serverHandler);

// Serve static files from the frontend/dist directory
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// For any other request, serve the index.html to support client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Start server if running directly (not through Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Export the express app as the handler function for Vercel
module.exports = app;
