// render-api.js - Simplified API-only server for Render
console.log("Starting CMO Assessment API (API-only version)...");

// Load environment variables
require("dotenv").config();

// Import required modules
const express = require("express");
const cors = require("cors");
const { handleAssessment } = require("./backend/services/assessment");

// Create Express app
const app = express();

// Configure middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ChatGPT assessment endpoint
app.post("/api/chatgpt/assessment", async (req, res) => {
  console.log("[API] ChatGPT assessment request received");

  try {
    // Validate request
    if (!req.body || !req.body.transcript) {
      console.log("[API] Missing transcript in request body");
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Missing transcript in request body",
        },
      });
    }

    // Process assessment
    console.log("[API] Starting assessment process...");
    const result = await handleAssessment(String(req.body.transcript));

    // Return successful response
    console.log("[API] Assessment successful");
    return res.status(200).json(result);
  } catch (error) {
    // Log and return error
    console.error("[API] Error:", error);
    return res.status(500).json({
      error: {
        code: "ASSESSMENT_FAILED",
        message: error.message || "Assessment failed",
      },
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ API server running on port ${PORT}`);
  console.log(`✓ Health check available at /api/health`);
  console.log(`✓ ChatGPT endpoint available at /api/chatgpt/assessment`);
});
