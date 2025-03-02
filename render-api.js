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
app.use(express.json());
app.use(express.text({ type: ["text/*", "application/*"] })); // Handle various content types as text
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
  console.log("[API] Content-Type:", req.get("Content-Type"));
  console.log("[API] Request Headers:", req.headers);
  console.log("[API] Raw Body Type:", typeof req.body);
  console.log("[API] Raw Body:", req.body);

  // Check if ChatGPT endpoint is enabled
  if (process.env.ENABLE_CHATGPT_ENDPOINT !== "true") {
    console.log("[API] ChatGPT endpoint is disabled");
    return res.status(403).json({
      error: {
        code: "ENDPOINT_DISABLED",
        message: "ChatGPT endpoint is not enabled",
      },
    });
  }

  try {
    // Get transcript from request body with enhanced content type handling
    let transcript;
    const contentType = req.get("Content-Type") || "";

    if (typeof req.body === "string") {
      // For text/* and application/* content types, try to parse as JSON first
      try {
        const parsed = JSON.parse(req.body);
        transcript = parsed.transcript;
      } catch (e) {
        // If parsing fails, use the raw text as transcript
        console.log("[API] Failed to parse body as JSON, using raw text");
        transcript = req.body;
      }
    } else if (req.body && typeof req.body === "object") {
      // For application/json content type (already parsed by express.json())
      transcript = req.body.transcript;
    } else {
      console.log("[API] Unexpected body type:", typeof req.body);
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid request body format",
        },
      });
    }

    // Validate transcript
    if (!transcript) {
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
    const result = await handleAssessment(String(transcript));

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
