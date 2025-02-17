const express = require("express");
const cors = require("cors");
const { supabase, initializeSchema } = require("../services/supabase");
const { openaiService } = require("../services/openai");
const { handleAssessment } = require("../services/assessment");
const { debugLog } = require("../config/logging");

// Initialize Supabase schema
initializeSchema().catch((error) => {
  console.error("Failed to initialize schema:", error);
  process.exit(1);
});

const app = express();

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
  res.status(200).json({ status: "ok" });
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

// ... other routes ...

module.exports = { server: app };
