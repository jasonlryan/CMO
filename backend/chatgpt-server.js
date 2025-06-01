// backend/chatgpt-server.js
// Minimal server that only serves the ChatGPT endpoint

// Load environment variables
require("dotenv").config();

// Import required modules
const express = require("express");
const cors = require("cors");
const { handleAssessment } = require("./services/assessment");
const path = require("path");
const fs = require("fs");

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

// Create Express app
const app = express();

// Configure middleware
app.use(cors());

// Only use compression in production
if (process.env.NODE_ENV === "production") {
  console.log("✅ Enabling production optimizations");

  // Add compression in production only
  const compression = require("compression");
  app.use(
    compression({
      threshold: 1024, // Only compress responses larger than 1KB
      level: 6, // Compression level (1-9, where 9 is best compression but slowest)
    })
  );

  // Initialize Google Cloud Logging in production only if explicitly enabled
  if (process.env.ENABLE_CLOUD_LOGGING === "true") {
    try {
      const { Logging } = require("@google-cloud/logging");
      const logging = new Logging();
      global.cloudLogger = logging.log("cmo-performance-metrics");
      console.log("✅ Google Cloud Logging initialized");
    } catch (error) {
      console.warn("⚠️ Google Cloud Logging not available:", error.message);
      global.cloudLogger = null;
    }
  }
}

// JSON parsing middleware
app.use(
  express.json({
    limit: "10mb",
    strict: false, // Faster parsing
  })
);

// Simple performance logging function that won't block tests
function logPerformanceMetric(metric, value, metadata = {}) {
  // Always log to console
  console.log(`[PERFORMANCE] ${metric}: ${value}ms`, metadata);

  // Only log to Google Cloud in production with explicit opt-in
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_CLOUD_LOGGING === "true" &&
    global.cloudLogger
  ) {
    try {
      const entry = global.cloudLogger.entry(
        { severity: "INFO" },
        {
          metric,
          value,
          timestamp: new Date().toISOString(),
          ...metadata,
        }
      );

      // Fire and forget - don't wait for the result
      global.cloudLogger.write(entry).catch(() => {});
    } catch (err) {
      // Silently ignore errors in logging
    }
  }
}

// Ensure necessary directories exist
function ensureDirectoriesExist() {
  const dirs = [
    path.join(__dirname, "data", "qresponses"),
    path.join(__dirname, "data", "qresponses", "raw_json"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Ensure CSV header exists
  const csvPath = path.join(__dirname, "data", "qresponses", "forms.csv");
  if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
    const header =
      "timestamp,submission_id,section,question_number,question_title,response\n";
    fs.writeFileSync(csvPath, header);
    console.log("Created forms.csv with header");
  }
}

// Call to ensure directories exist when server starts
ensureDirectoriesExist();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "chatgpt-only" });
});

// Handle form data storage
function storeFormData(formData) {
  try {
    // Generate timestamp for filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const submissionId = formData.submission_id || `FORM-${Date.now()}`;

    // Save complete form data as JSON
    const jsonPath = path.join(
      __dirname,
      "data",
      "qresponses",
      "raw_json",
      `form_${timestamp}_${submissionId}.json`
    );
    fs.writeFileSync(jsonPath, JSON.stringify(formData, null, 2));
    console.log(`[Form Data] Saved JSON to ${jsonPath}`);

    // Extract individual questions and append to CSV
    const csvPath = path.join(__dirname, "data", "qresponses", "forms.csv");

    // Process each section and its questions
    formData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        // Escape quotes in text fields
        const safeTitle = question.title.replace(/"/g, '""');
        const safeResponse = question.response.replace(/"/g, '""');

        // Create CSV line
        const csvLine = `"${timestamp}","${submissionId}","${section.title}","${question.number}","${safeTitle}","${safeResponse}"\n`;
        fs.appendFileSync(csvPath, csvLine);
      });
    });

    console.log(`[Form Data] Appended to CSV: ${csvPath}`);
    return true;
  } catch (error) {
    console.error("[Form Data] Storage error:", error);
    return false;
  }
}

// ChatGPT assessment endpoint
app.post("/api/chatgpt/assessment", async (req, res) => {
  try {
    console.log("[ChatGPT Server] Request received");
    console.log("[DEBUG] Request body keys:", Object.keys(req.body));
    const startTime = Date.now();

    // Validate request - check for either transcript or form
    if (!req.body || (!req.body.transcript && !req.body.form)) {
      console.log("[DEBUG] Invalid request body:", req.body);
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Request must include either transcript or form data",
        },
      });
    }

    // Determine input type and extract data
    const input_type = req.body.form ? "form" : "transcript";
    let input_data;

    if (input_type === "form") {
      // Handle form data
      const formData = req.body.form;
      console.log("[ChatGPT Server] Processing form data");

      // Store form data before processing
      const storageSuccess = storeFormData(formData);
      if (!storageSuccess) {
        console.warn(
          "[ChatGPT Server] Form data storage failed, continuing with processing"
        );
      }

      input_data = formData;
    } else {
      // Handle transcript
      input_data = String(req.body.transcript);
      console.log("[ChatGPT Server] Processing transcript");
    }

    // Generate cache key based on input type and data
    const cacheKey = require("crypto")
      .createHash("md5")
      .update(JSON.stringify({ type: input_type, data: input_data }))
      .digest("hex");

    // Check cache
    if (cache.has(cacheKey)) {
      const cachedEntry = cache.get(cacheKey);
      if (Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        console.log("[ChatGPT Server] Cache hit - returning cached result");
        const processingTime = Date.now() - startTime;
        console.log(
          `[ChatGPT Server] Request processed in ${processingTime}ms (cached)`
        );

        // Set cache header
        res.setHeader("X-Cache", "HIT");

        // Log cache hit performance
        logPerformanceMetric("request_processing_time", processingTime, {
          cached: true,
          input_type,
        });

        return res.status(200).json(cachedEntry.data);
      } else {
        // Cache expired, remove it
        cache.delete(cacheKey);
      }
    }

    // Set cache header for misses
    res.setHeader("X-Cache", "MISS");

    // Process assessment with input type flag
    console.log(
      `[ChatGPT Server] Starting ${input_type} assessment process...`
    );
    const result = await handleAssessment({
      data: input_data,
      input_type,
    });

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

    // Add input type to result
    result.input_type = input_type;

    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result,
    });

    // Return successful response
    const totalProcessingTime = Date.now() - startTime;
    console.log(
      `[ChatGPT Server] ${input_type} assessment successful in ${totalProcessingTime}ms`
    );

    // Log performance metrics
    logPerformanceMetric("request_processing_time", totalProcessingTime, {
      cached: false,
      input_type,
    });

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

// Implement cache cleanup every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
  console.log(
    `[ChatGPT Server] Cache cleanup complete. Current size: ${cache.size} entries`
  );
}, 3600 * 1000); // Run every hour

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ ChatGPT-only server running on port ${PORT}`);
  console.log(`🚀 Ready to process assessments`);
});
