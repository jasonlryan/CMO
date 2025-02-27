// api/chatgpt/endpoint.js
// Dedicated serverless function handler for the ChatGPT assessment endpoint

// Load environment variables
require("dotenv").config();

// Import required modules
const { handleAssessment } = require("../../backend/services/assessment");
const { debugLog } = require("../../backend/config/logging");

// Export the serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );

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
    console.log("[Vercel] [ChatGPT Endpoint] Request received");
    console.log(
      "[Vercel] [ChatGPT Endpoint] Request headers:",
      JSON.stringify(req.headers)
    );

    // Debug log the request body
    debugLog("[Vercel] [ChatGPT Endpoint] Request data:", {
      bodyType: typeof req.body,
      has_transcript: !!req.body?.transcript,
      sample: req.body?.transcript
        ? req.body.transcript.substring(0, 100)
        : "none",
    });

    // Validate request
    if (!req.body || !req.body.transcript) {
      console.log(
        "[Vercel] [ChatGPT Endpoint] Invalid request - missing transcript"
      );
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Missing transcript in request body",
        },
      });
    }

    // Process assessment
    console.log("[Vercel] [ChatGPT Endpoint] Starting assessment process...");
    const result = await handleAssessment(String(req.body.transcript));

    // Validate result
    if (!result || !result.profile) {
      console.log(
        "[Vercel] [ChatGPT Endpoint] Processing failed - no result or profile"
      );
      return res.status(500).json({
        error: {
          code: "PROCESSING_FAILED",
          message: "Failed to process assessment",
        },
      });
    }

    console.log("[Vercel] [ChatGPT Endpoint] Assessment successful");
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Vercel] [ChatGPT Endpoint] Error:", error);
    return res.status(500).json({
      error: {
        code: "ASSESSMENT_FAILED",
        message: error.message || "Assessment failed",
      },
    });
  }
};
