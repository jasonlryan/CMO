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
const { handleAssessment } = require("../services/assessment.js");
require("dotenv").config();

async function test() {
  try {
    console.log("\n=== CMO Assessment Test ===");

    // 1. Load transcript from file
    const transcriptPath = path.join(__dirname, "../../docs/transcript.txt");
    const transcript = fs.readFileSync(transcriptPath, "utf8");
    console.log(`✓ Loaded transcript from: ${transcriptPath}`);

    // 2. Process through assessment service (single OpenAI call)
    const result = await handleAssessment(transcript);
    console.log("\n✓ Assessment processed");

    // Optionally log timing or other details
    console.log("\nAssessment Timing:", result.timing);

    // 3. Verify reports were generated
    if (!result.reports?.candidate || !result.reports?.client) {
      throw new Error("Missing assessment reports");
    }
    console.log("\n✓ Reports generated");

    console.log("\nOutputs will be saved to:");
    console.log("- Profiles:", path.join(__dirname, "../data/profiles"));
    console.log("- Reports:", path.join(__dirname, "../data/reports"));
  } catch (error) {
    console.error("\n✗ Test failed:");
    console.error(`  Error: ${error.message}`);
    process.exit(1);
  }
}

test();
