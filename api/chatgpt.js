// api/chatgpt.js
// Dedicated serverless function for the ChatGPT assessment endpoint

// Load environment variables
require("dotenv").config();

// Import the core assessment logic
const { handleAssessment } = require("../backend/services/assessment");
const { debugLog } = require("../backend/config/logging");

// Export the serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are allowed",
      },
    });
  }

  try {
    console.log("[ChatGPT Serverless] Request received");

    // Debug log the request headers
    console.log("[ChatGPT Serverless] Headers:", JSON.stringify(req.headers));

    // Validate request
    if (!req.body || !req.body.transcript) {
      console.log("[ChatGPT Serverless] Missing transcript in request body");
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Missing transcript in request body",
        },
      });
    }

    // Log transcript sample for debugging
    console.log(
      "[ChatGPT Serverless] Transcript sample:",
      req.body.transcript.substring(0, 100) + "..."
    );

    // Process assessment using the core logic
    console.log("[ChatGPT Serverless] Starting assessment process...");
    const result = await handleAssessment(String(req.body.transcript));

    // Validate result
    if (!result || !result.profile) {
      console.log(
        "[ChatGPT Serverless] Processing failed - no result or profile"
      );
      return res.status(500).json({
        error: {
          code: "PROCESSING_FAILED",
          message: "Failed to process assessment",
        },
      });
    }

    // Return successful response
    console.log("[ChatGPT Serverless] Assessment successful");
    return res.status(200).json(result);
  } catch (error) {
    // Log and return error
    console.error("[ChatGPT Serverless] Error:", error);
    return res.status(500).json({
      error: {
        code: "ASSESSMENT_FAILED",
        message: error.message || "Assessment failed",
      },
    });
  }
};
