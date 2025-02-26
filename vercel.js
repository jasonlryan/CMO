// vercel.js - Entry point for Vercel deployment
// This file is configured in the Vercel project settings as the main entry point

// Load environment variables
require("dotenv").config();

// Import required modules
const express = require("express");
const path = require("path");
const fs = require("fs");
const serverHandler = require("./backend/index.js");

// Create express app
const app = express();

// Debug logging to help troubleshoot
console.log("Starting custom server in vercel.js");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Current directory:", __dirname);

// Determine the correct path to the frontend dist directory
// In Vercel, we need to use a specific path structure
let distPath;
if (process.env.NODE_ENV === "production") {
  // Vercel production environment uses a different directory structure
  distPath = path.join(__dirname, "frontend", "dist");

  // Check if the path exists, if not, try to find the correct path
  if (!fs.existsSync(distPath)) {
    console.log(`Path ${distPath} does not exist, trying alternate paths`);

    // List of potential paths to try
    const potentialPaths = [
      path.join(__dirname, "dist"),
      path.join(process.cwd(), "frontend", "dist"),
      path.join(process.cwd(), "dist"),
      "/var/task/frontend/dist",
      "/var/task/dist",
    ];

    for (const potentialPath of potentialPaths) {
      console.log(`Checking path: ${potentialPath}`);
      if (fs.existsSync(potentialPath)) {
        console.log(`Found valid path: ${potentialPath}`);
        distPath = potentialPath;
        break;
      }
    }
  }
} else {
  // Local development environment
  distPath = path.join(__dirname, "frontend", "dist");
}

console.log(`Using dist path: ${distPath}`);

// Set appropriate MIME types for all JavaScript files
app.use((req, res, next) => {
  const url = req.url;
  console.log(`Request URL: ${url}`);

  if (url.endsWith(".js") || url.endsWith(".mjs")) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  } else if (url.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
  }
  next();
});

// Set up API routes - all /api/* requests go to the backend handler
app.use("/api", serverHandler);

// Check if dist path exists before attempting to serve static files
if (fs.existsSync(distPath)) {
  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    console.log(`index.html found at: ${indexPath}`);

    // For any other request, serve the index.html to support client-side routing
    app.get("*", (req, res) => {
      console.log(`Fallback route: serving index.html for ${req.url}`);
      res.sendFile(indexPath);
    });
  } else {
    console.error(`index.html not found at: ${indexPath}`);
    app.get("*", (req, res) => {
      res.status(404).send(`File not found. Checked path: ${indexPath}`);
    });
  }
} else {
  console.error(`Dist directory not found at: ${distPath}`);
  app.get("*", (req, res) => {
    res.status(404).send(`Frontend build not found. Checked path: ${distPath}`);
  });
}

// Start server if running directly (not through Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Export the express app as the handler function for Vercel
module.exports = app;
