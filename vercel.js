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
console.log("====== VERCEL SERVER INITIALIZATION ======");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Current directory:", __dirname);
console.log("Current working directory:", process.cwd());
console.log(
  "Files in current directory:",
  fs.readdirSync(__dirname).join(", ")
);

// Try to find frontend directory
try {
  console.log("Checking for frontend directory:");
  if (fs.existsSync(path.join(__dirname, "frontend"))) {
    console.log("frontend directory exists at root level");
    console.log(
      "Contents:",
      fs.readdirSync(path.join(__dirname, "frontend")).join(", ")
    );
  } else {
    console.log("No frontend directory at root level");
  }
} catch (err) {
  console.error("Error checking frontend directory:", err.message);
}

// Determine the correct path to the frontend dist directory
// In Vercel, we need to use a specific path structure
let distPath;
if (process.env.NODE_ENV === "production") {
  // Vercel production environment uses a different directory structure
  distPath = path.join(__dirname, "frontend", "dist");
  console.log(`Checking primary dist path: ${distPath}`);

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

    console.log("Checking potential dist paths:");
    for (const potentialPath of potentialPaths) {
      console.log(`Checking path: ${potentialPath}`);
      try {
        if (fs.existsSync(potentialPath)) {
          console.log(`Found valid path: ${potentialPath}`);
          console.log(`Contents: ${fs.readdirSync(potentialPath).join(", ")}`);
          distPath = potentialPath;
          break;
        }
      } catch (err) {
        console.error(`Error checking path ${potentialPath}:`, err.message);
      }
    }
  } else {
    console.log(`Path ${distPath} exists!`);
    try {
      console.log(`Contents: ${fs.readdirSync(distPath).join(", ")}`);
    } catch (err) {
      console.error(`Error reading ${distPath}:`, err.message);
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
    console.log(`index.html size: ${fs.statSync(indexPath).size} bytes`);

    // For any other request, serve the index.html to support client-side routing
    app.get("*", (req, res) => {
      console.log(`Fallback route: serving index.html for ${req.url}`);
      res.sendFile(indexPath);
    });
  } else {
    console.error(`index.html not found at: ${indexPath}`);
    app.get("*", (req, res) => {
      res
        .status(404)
        .send(
          `File not found. Checked path: ${indexPath}. Available files in ${distPath}: ${fs
            .readdirSync(distPath)
            .join(", ")}`
        );
    });
  }
} else {
  console.error(`Dist directory not found at: ${distPath}`);
  // List all directories to help debug
  try {
    console.log(
      "Root directory contents:",
      fs.readdirSync(__dirname).join(", ")
    );
    if (fs.existsSync(path.join(__dirname, "frontend"))) {
      console.log(
        "Frontend directory contents:",
        fs.readdirSync(path.join(__dirname, "frontend")).join(", ")
      );
    }
  } catch (err) {
    console.error("Error listing directories:", err.message);
  }

  app.get("*", (req, res) => {
    res
      .status(404)
      .send(
        `Frontend build not found. Checked path: ${distPath}. This is likely because the build process did not complete successfully. Please check the build logs.`
      );
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
