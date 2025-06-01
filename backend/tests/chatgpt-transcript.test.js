// Test script for the ChatGPT transcript assessment endpoint
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { logTestResult } = require("./testTimingsLogger");

const API_URL = "http://localhost:3000/api/chatgpt/assessment";
const SAMPLE_TRANSCRIPT_PATH = path.join(
  __dirname,
  "../../docs/transcript.txt"
);

async function validateResponseStructure(response) {
  const data = response.data;

  console.log("\nValidating transcript response structure:");

  // Basic structure checks
  const hasProfile = !!data.profile;
  const hasSkills = data.profile && !!data.profile.skills;
  console.log(`- Has profile: ${hasProfile}`);
  console.log(`- Has skills data: ${hasSkills}`);
  console.log(`- Input type: ${data.input_type || "not specified"}`);

  // Check if response was cached
  console.log(`- Cache status: ${response.headers["x-cache"] || "not cached"}`);

  if (!hasProfile || !hasSkills) {
    throw new Error("Invalid response structure for transcript assessment");
  }

  return true;
}

async function testTranscriptAssessment() {
  try {
    console.log("Starting ChatGPT transcript assessment test...");

    // Environment checks
    console.log("\nEnvironment check:");
    console.log(
      `- ENABLE_CHATGPT_ENDPOINT=${
        process.env.ENABLE_CHATGPT_ENDPOINT || "undefined"
      }`
    );
    console.log(`- API_URL=${API_URL}`);

    // Test health check endpoint first
    try {
      console.log("\nTesting server health...");
      const healthCheck = await axios.get("http://localhost:3000/api/health");
      console.log(`✓ Health check successful (${healthCheck.status})`);
    } catch (healthError) {
      console.error("❌ Server health check failed. Is the server running?");
      throw new Error(
        "Server not running or health check endpoint unavailable"
      );
    }

    // Test transcript assessment
    if (!fs.existsSync(SAMPLE_TRANSCRIPT_PATH)) {
      console.error("❌ Transcript file not found at:", SAMPLE_TRANSCRIPT_PATH);
      return false;
    }

    const transcript = fs.readFileSync(SAMPLE_TRANSCRIPT_PATH, "utf8");
    console.log(`Transcript length: ${transcript.length} characters`);

    const startTime = Date.now();
    const response = await axios.post(API_URL, { transcript });
    const duration = Date.now() - startTime;

    await validateResponseStructure(response);
    console.log(`✓ Transcript assessment test passed (${duration}ms)`);
    logTestResult("ChatGPT Transcript Test", "success", duration);

    console.log("\n=== Test Complete ===");
    console.log(`Total duration: ${duration}ms`);
    return true;
  } catch (error) {
    logTestResult("ChatGPT Transcript Test", "failure", 0);
    console.error("\n❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTranscriptAssessment()
    .then((success) => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("Unhandled error:", err);
      process.exit(1);
    });
}

module.exports = { testTranscriptAssessment };
