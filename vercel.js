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
  fs.readdirSync(process.cwd()).join(", ")
);
console.log("Files in __dirname:", fs.readdirSync(__dirname).join(", "));

// Try to find frontend directory
try {
  console.log("Checking for frontend directory:");
  const frontendPath = path.join(process.cwd(), "frontend");
  if (fs.existsSync(frontendPath)) {
    console.log("frontend directory exists at:", frontendPath);
    console.log("Contents:", fs.readdirSync(frontendPath).join(", "));

    // Check if dist exists in frontend
    const distPathInFrontend = path.join(frontendPath, "dist");
    if (fs.existsSync(distPathInFrontend)) {
      console.log("dist directory exists in frontend!");
      console.log("Contents:", fs.readdirSync(distPathInFrontend).join(", "));
    } else {
      console.log("No dist directory in frontend");
    }
  } else {
    console.log("No frontend directory at:", frontendPath);
  }
} catch (err) {
  console.error("Error checking frontend directory:", err.message);
}

// Determine the correct path to the frontend dist directory
// In Vercel, we need to use a specific path structure
let distPath;
const possiblePaths = [
  path.join(process.cwd(), "frontend", "dist"),
  path.join(__dirname, "frontend", "dist"),
  path.join(process.cwd(), "dist"),
  path.join(__dirname, "dist"),
  "/var/task/frontend/dist",
  "/var/task/dist",
  path.join(process.cwd(), "..", "frontend", "dist"), // Try parent directory
  path.join(__dirname, "..", "frontend", "dist"), // Try parent directory
  process.env.VERCEL_OUTPUT_DIR
    ? path.join(process.env.VERCEL_OUTPUT_DIR)
    : null, // Check Vercel output dir if defined
].filter(Boolean); // Remove null entries

console.log("Checking ALL possible dist paths:");
console.log("VERCEL_OUTPUT_DIR:", process.env.VERCEL_OUTPUT_DIR);
console.log("BUILD_OUTPUT_DIR:", process.env.BUILD_OUTPUT_DIR);
let foundValidPath = false;

for (const pathToCheck of possiblePaths) {
  console.log(`Checking path: ${pathToCheck}`);
  try {
    if (fs.existsSync(pathToCheck)) {
      console.log(`Found valid path: ${pathToCheck}`);
      try {
        const files = fs.readdirSync(pathToCheck);
        console.log(`Contents: ${files.join(", ")}`);
        if (files.includes("index.html")) {
          console.log(`✅ index.html found in ${pathToCheck}`);
          distPath = pathToCheck;
          foundValidPath = true;
          break;
        } else {
          console.log(`❌ No index.html in ${pathToCheck}`);
        }
      } catch (err) {
        console.error(`Error reading directory ${pathToCheck}:`, err.message);
      }
    } else {
      console.log(`Path ${pathToCheck} does not exist`);
    }
  } catch (err) {
    console.error(`Error checking path ${pathToCheck}:`, err.message);
  }
}

if (!foundValidPath) {
  console.log("No valid dist path found with index.html");

  // Create a minimal fallback file
  try {
    console.log("Creating fallback frontend/dist directory");
    const fallbackPath = path.join(process.cwd(), "frontend", "dist");

    // Create directories if they don't exist
    if (!fs.existsSync(path.join(process.cwd(), "frontend"))) {
      fs.mkdirSync(path.join(process.cwd(), "frontend"), { recursive: true });
    }

    if (!fs.existsSync(fallbackPath)) {
      fs.mkdirSync(fallbackPath, { recursive: true });
    }

    // Create a minimal index.html
    const indexPath = path.join(fallbackPath, "index.html");
    const fallbackHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CMO Assessment Tool - Build Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
          .error { color: #e74c3c; background: #fdf5f5; padding: 1rem; border-radius: 4px; }
          code { background: #f8f8f8; padding: 0.2rem 0.4rem; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>CMO Assessment Tool</h1>
        <div class="error">
          <h2>Build Error</h2>
          <p>The frontend build files could not be found. This usually indicates that the build process failed or did not run.</p>
          <p>Please check the Vercel build logs for more information.</p>
        </div>
        <h3>Debugging Information:</h3>
        <pre><code>Current directory: ${process.cwd()}
Node environment: ${process.env.NODE_ENV}
Checked paths: ${possiblePaths.join(", ")}
        </code></pre>
      </body>
      </html>
    `;

    fs.writeFileSync(indexPath, fallbackHtml);
    console.log(`Created fallback index.html at ${indexPath}`);
    distPath = fallbackPath;
  } catch (err) {
    console.error("Error creating fallback:", err.message);
  }
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

// Add additional debugging middleware for API requests
app.use("/api", (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] API Request: ${req.method} ${req.url}`
  );
  console.log("Headers:", JSON.stringify(req.headers));
  if (req.url.includes("/chatgpt")) {
    console.log("ChatGPT endpoint requested");

    // Add CORS headers for ChatGPT endpoint
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
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
      fs.readdirSync(process.cwd()).join(", ")
    );
    if (fs.existsSync(path.join(process.cwd(), "frontend"))) {
      console.log(
        "Frontend directory contents:",
        fs.readdirSync(path.join(process.cwd(), "frontend")).join(", ")
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
