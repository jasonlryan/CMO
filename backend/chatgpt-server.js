// backend/chatgpt-server.js
// Minimal server that only serves the ChatGPT endpoint

// Load environment variables
require("dotenv").config();

// Import required modules
const express = require("express");
const cors = require("cors");
const { handleAssessment } = require("./services/assessment");

// Check for required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing required environment variable: OPENAI_API_KEY");
  process.exit(1);
}

// Create Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "chatgpt-only" });
});

// ChatGPT assessment endpoint
app.post("/api/chatgpt/assessment", async (req, res) => {
  try {
    console.log("[ChatGPT Server] Request received");

    // Validate request
    if (!req.body || !req.body.transcript) {
      console.log("[ChatGPT Server] Missing transcript in request body");
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Missing transcript in request body",
        },
      });
    }

    // Log transcript sample for debugging
    console.log(
      "[ChatGPT Server] Transcript sample:",
      req.body.transcript.substring(0, 100) + "..."
    );

    // Process assessment
    console.log("[ChatGPT Server] Starting assessment process...");
    const result = await handleAssessment(String(req.body.transcript));

    // Validate result
    if (!result || !result.profile) {
      console.log("[ChatGPT Server] Processing failed - no result or profile");
      return res.status(500).json({
        error: {
          code: "PROCESSING_FAILED",
          message: "Failed to process assessment",
        },
      });
    }

    // Return successful response
    console.log("[ChatGPT Server] Assessment successful");
    return res.status(200).json(result);
  } catch (error) {
    // Log and return error
    console.error("[ChatGPT Server] Error:", error);
    return res.status(500).json({
      error: {
        code: "ASSESSMENT_FAILED",
        message: error.message || "Assessment failed",
      },
    });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ ChatGPT-only server running on port ${PORT}`);
  console.log(`🚀 Ready to process assessments`);
});
