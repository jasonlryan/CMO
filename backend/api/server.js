const express = require("express");
const cors = require("cors");
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

// General CORS for UI API - permissive
app.use(cors());
app.use(express.json());

// Routes
app.post("/api/assessment", async (req, res) => {
  try {
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
    const result = await handleAssessment(String(req.body.transcript));

    // Validate result
    if (!result || !result.profile) {
      return res.status(500).json({
        error: {
          code: "PROCESSING_FAILED",
          message: "Failed to process assessment",
        },
      });
    }

    // Return successful response
    return res.json({
      data: result.profile,
      scores: result.scores,
      reports: result.reports,
    });
  } catch (error) {
    console.error("Assessment failed:", error);
    return res.status(500).json({
      error: {
        code: "ASSESSMENT_FAILED",
        message: error.message || "Assessment failed",
      },
    });
  }
});

app.get("/api/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement report fetch
    res.json({ message: "Report endpoint ready" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

app.get("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement profile fetch
    res.json({ message: "Profile endpoint ready" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
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
    origin: ["https://chat.openai.com", "https://chatgpt.com", "*"],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours
  };

  app.options("/api/chatgpt/assessment", cors(chatGptCorsOptions));

  app.post(
    "/api/chatgpt/assessment",
    cors(chatGptCorsOptions),
    async (req, res) => {
      try {
        console.log("[ChatGPT Endpoint] Assessment request received");
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
        const result = await handleAssessment(String(req.body.transcript));

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
        // Return successful response (same format as regular endpoint)
        return res.json({
          data: result.profile,
          scores: result.scores,
          reports: result.reports,
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
