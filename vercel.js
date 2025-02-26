// vercel.js - Entry point for Vercel deployment
// This file is configured in the Vercel project settings as the main entry point

// Load environment variables
require("dotenv").config();

// Import the necessary modules
const express = require("express");
const path = require("path");
const fs = require("fs");

// Import the API handler
const apiHandler = require("./backend/index.js");

// Create a new Express app for handling static files
const app = express();

// Add specific content-type handling as a middleware
app.use((req, res, next) => {
  // Match specific file extensions and set appropriate MIME types
  if (req.path.match(/\.(js|mjs|jsx|ts|tsx)$/i)) {
    res.set("Content-Type", "application/javascript; charset=utf-8");
  } else if (req.path.match(/\.css$/i)) {
    res.set("Content-Type", "text/css; charset=utf-8");
  } else if (req.path.match(/\.svg$/i)) {
    res.set("Content-Type", "image/svg+xml");
  } else if (req.path.match(/\.html$/i)) {
    res.set("Content-Type", "text/html; charset=utf-8");
  }

  // Continue to next middleware
  next();
});

// Special handling for the main.tsx file which seems to be problematic
app.get("/main.tsx", (req, res) => {
  const filePath = path.join(__dirname, "frontend", "main.tsx");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send("File not found");
      return;
    }

    res.set("Content-Type", "application/javascript; charset=utf-8");
    res.send(data);
  });
});

// Serve static files from the frontend directory with custom headers
app.use(
  express.static(path.join(__dirname, "frontend"), {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      // Set appropriate content types based on file extension
      if ([".js", ".mjs", ".jsx", ".ts", ".tsx"].includes(ext)) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (ext === ".css") {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      } else if (ext === ".svg") {
        res.setHeader("Content-Type", "image/svg+xml");
      } else if (ext === ".html") {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }
    },
  })
);

// Handle API routes - delegate to the backend handler
app.use("/api", (req, res) => {
  return apiHandler(req, res);
});

// Handle privacy, terms, and contact page routes
app.get("/(privacy|terms|contact)", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Serve the index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Start the server if running directly (not when imported as a serverless function)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel serverless function
module.exports = app;
