const express = require("express");
const cors = require("cors");
const { supabaseService } = require("../services/supabase");
const { openaiService } = require("../services/openai");
const { handleAssessment } = require("../services/assessment");
const { debugLog } = require("../config/logging");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.post("/api/assessment", async (req, res) => {
  try {
    // Debug exact type of incoming transcript
    console.log("Type of transcript:", typeof req.body.transcript);
    console.log(
      "Is string?",
      Object.prototype.toString.call(req.body.transcript) === "[object String]"
    );
    console.log("Value:", req.body.transcript?.substring(0, 50), "...");

    // Debug request body
    debugLog("API Request:", {
      bodyType: typeof req.body,
      transcriptType: typeof req.body.transcript,
      sample: req.body.transcript?.substring(0, 100),
    });

    console.log("Received transcript length:", req.body.transcript.length);
    const profile = await handleAssessment(String(req.body.transcript));
    console.log("Generated profile:", profile);
    res.json(profile);
  } catch (error) {
    console.error("Assessment failed:", error);
    res.status(500).json({
      error: "Assessment failed",
      details: error.message,
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

// ... other routes ...

module.exports = { server: app };
