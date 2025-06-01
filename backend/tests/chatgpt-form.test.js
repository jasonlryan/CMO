// Test script for the ChatGPT form assessment endpoint
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { logTestResult } = require("./testTimingsLogger");

const API_URL = "http://localhost:3000/api/chatgpt/assessment";
const FORM_DATA_PATH = path.join(
  __dirname,
  "../data/qresponses/cmo_assessment_form_example.json"
);

async function validateResponseStructure(response) {
  const data = response.data;

  console.log("\nValidating form response structure:");

  // Basic structure checks
  const hasProfile = !!data.profile;
  const hasSkills = data.profile && !!data.profile.skills;
  console.log(`- Has profile: ${hasProfile}`);
  console.log(`- Has skills data: ${hasSkills}`);
  console.log(`- Input type: ${data.input_type || "not specified"}`);

  // Check if response was cached
  console.log(`- Cache status: ${response.headers["x-cache"] || "not cached"}`);

  if (!hasProfile || !hasSkills) {
    throw new Error("Invalid response structure for form assessment");
  }

  return true;
}

async function testFormAssessment() {
  try {
    console.log("Starting ChatGPT form assessment test...");

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

    // Test form assessment
    if (!fs.existsSync(FORM_DATA_PATH)) {
      console.error("❌ Form data file not found at:", FORM_DATA_PATH);
      return false;
    }

    const formData = JSON.parse(fs.readFileSync(FORM_DATA_PATH, "utf8"));
    console.log(`Form data loaded: ${formData.sections.length} sections`);

    const startTime = Date.now();
    const response = await axios.post(API_URL, { form: formData });
    const duration = Date.now() - startTime;

    await validateResponseStructure(response);
    console.log(`✓ Form assessment test passed (${duration}ms)`);
    logTestResult("ChatGPT Form Test", "success", duration);

    console.log("\n=== Test Complete ===");
    console.log(`Total duration: ${duration}ms`);
    return true;
  } catch (error) {
    logTestResult("ChatGPT Form Test", "failure", 0);
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
  testFormAssessment()
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

module.exports = { testFormAssessment };
