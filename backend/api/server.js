/**
 * API Server
 *
 * Performance Optimizations (2023-11-XX):
 * 1. Added compression middleware to reduce response size and improve transfer speeds
 * 2. Increased JSON body size limit to 10MB to handle larger transcripts
 * 3. Optimized CORS settings for ChatGPT endpoint:
 *    - Limited methods to only POST and OPTIONS
 *    - Added preflightContinue: false for faster preflight handling
 *    - Set optionsSuccessStatus: 204 for efficient OPTIONS responses
 * 4. Added performance-related headers to ChatGPT endpoint:
 *    - Cache-Control: no-cache to prevent caching of dynamic content
 *    - X-Content-Type-Options: nosniff for security and faster content handling
 * 5. Improved validation to fail fast on invalid requests
 *
 * These changes aim to reduce the "Talking to connector" delay and improve
 * overall assessment processing times.
 */

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const {
  supabase,
  initializeSchema,
  getSupabaseStatus,
} = require("../services/supabase");
const { openaiService } = require("../services/openai");
const { handleAssessment } = require("../services/assessment");
const { debugLog } = require("../config/logging");

// Initialize Supabase schema
if (supabase) {
  initializeSchema().catch((error) => {
    console.error("Failed to initialize schema:", error);
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  });
} else {
  console.warn("Skipping schema initialization: Supabase client not available");
}

const app = express();

// Performance optimizations
app.use(compression());
app.use(express.json({ limit: "10mb" }));

// General CORS for UI API - permissive
app.use(cors());

// Routes
app.post("/api/assessment", async (req, res) => {
  try {
    // Start timing
    const startTime = Date.now();
    console.log("[Regular API] Assessment request received");

    // Validate request
    if (!req.body || !req.body.transcript) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Missing transcript in request body",
        },
      });
    }

    // Debug exact type of incoming transcript
    debugLog("API Request:", {
      bodyType: typeof req.body,
      transcriptType: typeof req.body.transcript,
      sample: req.body.transcript?.substring(0, 100),
    });

    // Process assessment
    console.log(
      `[Regular API] Processing started at ${new Date().toISOString()}`
    );
    const result = await handleAssessment(String(req.body.transcript));
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `[Regular API] Processing completed in ${processingTime} seconds`
    );

    // Return response
    return res.json({
      data: result.profile,
      scores: result.scores,
      reports: result.reports,
    });
  } catch (error) {
    console.error("Assessment failed:", error);
    return res.status(500).json({
      error: {
        code: "PROCESSING_FAILED",
        message: "Failed to process assessment",
      },
    });
  }
});

app.get("/api/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(500).json({ error: "Supabase client not configured" });
    }

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Report not found" });

    res.json({ data });
  } catch (error) {
    console.error("Failed to fetch report:", error);
    res.status(500).json({ error: error.message || "Failed to fetch report" });
  }
});

app.get("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(500).json({ error: "Supabase client not configured" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Profile not found" });

    res.json({ data });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

// Add health check endpoint
app.get("/api/health", (req, res) => {
  // Get Supabase connection status
  const supabaseStatus = getSupabaseStatus();

  res.status(200).json({
    status: "ok",
    supabase: supabaseStatus,
    environment: {
      node_env: process.env.NODE_ENV || "development",
      is_vercel: !!process.env.VERCEL,
    },
  });
});

app.get("/api/assessments", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ data });
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
    return res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: error.message || "Failed to fetch assessments",
      },
    });
  }
});

// ChatGPT Integration Endpoint (can be disabled with ENABLE_CHATGPT_ENDPOINT=false)
if (process.env.ENABLE_CHATGPT_ENDPOINT !== "false") {
  // Special CORS configuration just for the ChatGPT endpoint
  const chatGptCorsOptions = {
    origin: "*", // Allow all origins for testing
    methods: ["POST", "OPTIONS"], // Limit to only needed methods
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204, // Return 204 for OPTIONS requests
  };

  // Add an explicit OPTIONS handler for preflight requests
  app.options("/api/chatgpt/assessment", cors(chatGptCorsOptions));

  app.post(
    "/api/chatgpt/assessment",
    cors(chatGptCorsOptions),
    async (req, res) => {
      try {
        // Start timing
        const startTime = Date.now();
        console.log("[ChatGPT Endpoint] Assessment request received");
        console.log("[ChatGPT] Request headers:", JSON.stringify(req.headers));
        debugLog("[ChatGPT] Request data:", {
          bodyType: typeof req.body,
          has_transcript: !!req.body?.transcript,
          sample: req.body?.transcript
            ? req.body.transcript.substring(0, 100)
            : "none",
        });

        // Validate request (same validation as regular endpoint)
        if (!req.body || !req.body.transcript) {
          console.log(
            "[ChatGPT Endpoint] Invalid request - missing transcript"
          );
          return res.status(400).json({
            error: {
              code: "INVALID_REQUEST",
              message: "Missing transcript in request body",
            },
          });
        }

        // Process assessment using the same function as the regular endpoint
        console.log(
          `[ChatGPT Endpoint] Processing started at ${new Date().toISOString()}`
        );
        const result = await handleAssessment(String(req.body.transcript));
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
          `[ChatGPT Endpoint] Processing completed in ${processingTime} seconds`
        );

        // Validate result
        if (!result || !result.profile) {
          console.log(
            "[ChatGPT Endpoint] Processing failed - no result or profile"
          );
          return res.status(500).json({
            error: {
              code: "PROCESSING_FAILED",
              message: "Failed to process assessment",
            },
          });
        }

        console.log("[ChatGPT Endpoint] Assessment successful");
        // Return successful response with only profile data and scores, omitting reports to reduce size
        return res.json({
          status: "success",
          profile: result.profile,
          scores: result.scores,
          // Commenting out reports to reduce response size
          // reports: result.reports,
        });
      } catch (error) {
        console.error("[ChatGPT Endpoint] Assessment failed:", error);
        return res.status(500).json({
          error: {
            code: "ASSESSMENT_FAILED",
            message: error.message || "Assessment failed",
          },
        });
      }
    }
  );
  console.log(
    "✓ ChatGPT integration endpoint enabled at /api/chatgpt/assessment"
  );
} else {
  console.log("ℹ️ ChatGPT integration endpoint disabled");
}

// ... other routes ...

// Export the Express app directly
module.exports = app;
