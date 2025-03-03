// backend/chatgpt-server.js
// Minimal server that only serves the ChatGPT endpoint

// Load environment variables
require("dotenv").config();

// Import required modules
const express = require("express");
const cors = require("cors");
const { handleAssessment } = require("./services/assessment");

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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "chatgpt-only" });
});

// ChatGPT assessment endpoint
app.post("/api/chatgpt/assessment", async (req, res) => {
  try {
    console.log("[ChatGPT Server] Request received");
    const startTime = Date.now();

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

    // Generate cache key from transcript
    const transcript = String(req.body.transcript);
    const cacheKey = require("crypto")
      .createHash("md5")
      .update(transcript)
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

        // Log cache hit performance
        logPerformanceMetric("request_processing_time", processingTime, {
          cached: true,
          transcript_length: transcript.length,
        });

        return res.status(200).json(cachedEntry.data);
      } else {
        // Cache expired, remove it
        cache.delete(cacheKey);
      }
    }

    // Process assessment
    console.log("[ChatGPT Server] Starting assessment process...");
    const result = await handleAssessment(transcript);

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

    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result,
    });

    // Return successful response
    const totalProcessingTime = Date.now() - startTime;
    console.log(
      `[ChatGPT Server] Assessment successful in ${totalProcessingTime}ms`
    );

    // Log performance metrics
    logPerformanceMetric("request_processing_time", totalProcessingTime, {
      cached: false,
      transcript_length: transcript.length,
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
