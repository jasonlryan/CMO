/**
 * CMO Assessment Tool - Integration Test
 *
 * Purpose:
 * This test file validates the entire assessment flow from transcript to reports.
 * It does NOT contain business logic - it only tests the integration of services.
 *
 * Flow:
 * 1. Load transcript
 * 2. Pass to OpenAI service (using gpt-4o-mini)
 * 3. Process response through assessment.ts
 * 4. Generate reports using templates (cmoProfile.js & reports.js)
 * 5. Save outputs
 *
 * Important:
 * - NO business logic here - that belongs in templates/
 * - NO report generation logic - that's in reports.js
 * - NO profile structure - that's in cmoProfile.js
 * - ONLY test the flow and integration
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config();
const assert = require("assert");
const { handleAssessment } = require("../services/assessment");
const { infoLog, errorLog } = require("../config/logging");

// Set DEBUG_MODE before requiring any services
process.env.DEBUG_MODE = "false";

// Verify DEBUG_MODE is set correctly
if (process.env.DEBUG_MODE?.toLowerCase() === "true") {
  warnLog("Debug enabled in test environment:", {
    mode: process.env.DEBUG_MODE,
    environment: "test",
  });
}

async function test() {
  try {
    console.log("\n=== CMO Assessment Test ===");

    // 1. Load transcript from file
    const transcript = fs.readFileSync(
      path.join(__dirname, "../../docs/transcript.txt"),
      "utf-8"
    );

    // 2. Process through assessment service (single OpenAI call)
    const result = await handleAssessment(transcript);
    infoLog("Assessment complete", { timing: result.timing });

    // 3. Verify reports were generated
    if (!result.reports?.candidate || !result.reports?.client) {
      throw new Error("Missing assessment reports");
    }
  } catch (error) {
    console.error("\n✗ Test failed:");
    console.error(`  Error: ${error.message}`);
    errorLog("Test failed", error);
    process.exit(1);
  }
}

test();
