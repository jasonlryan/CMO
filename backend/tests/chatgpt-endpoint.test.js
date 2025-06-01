// Test script for the ChatGPT endpoint
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { logTestResult } = require("./testTimingsLogger");

const API_URL = "http://localhost:3000/api/chatgpt/assessment";
const SAMPLE_TRANSCRIPT_PATH = path.join(
  __dirname,
  "../../docs/transcript.txt"
);

async function testChatGptEndpoint() {
  try {
    console.log("Starting ChatGPT endpoint test...");

    // Check environment
    console.log("Environment check:");
    console.log(
      `- ENABLE_CHATGPT_ENDPOINT=${
        process.env.ENABLE_CHATGPT_ENDPOINT || "undefined"
      }`
    );
    console.log(`- API_URL=${API_URL}`);
    console.log(`- Transcript path: ${SAMPLE_TRANSCRIPT_PATH}`);

    // Check if transcript exists
    if (!fs.existsSync(SAMPLE_TRANSCRIPT_PATH)) {
      console.error("❌ Transcript file not found!");
      console.error("Please ensure docs/transcript.txt exists");
      return false;
    }

    // Read the transcript file
    const transcript = fs.readFileSync(SAMPLE_TRANSCRIPT_PATH, "utf8");
    console.log(`Transcript length: ${transcript.length} characters`);
    console.log("Transcript excerpt: " + transcript.substring(0, 100) + "...");

    // Test health check endpoint first
    try {
      console.log("Testing server health...");
      const healthCheck = await axios.get("http://localhost:3000/api/health");
      console.log(`Health check status: ${healthCheck.status}`);
      console.log(`Health check response: ${JSON.stringify(healthCheck.data)}`);
    } catch (healthError) {
      console.error("❌ Server health check failed. Is the server running?");
      throw new Error(
        "Server not running or health check endpoint unavailable"
      );
    }

    // Start timing
    const startTime = Date.now();

    // Send request to the assessment endpoint
    console.log(`Sending request to ${API_URL}...`);
    const response = await axios.post(API_URL, { transcript });

    // End timing and log result
    const duration = Date.now() - startTime;
    logTestResult("ChatGPT Test", "success", duration);

    // Check response
    if (response.status === 200 && response.data) {
      console.log("✓ Endpoint test successful!");

      // Log condensed success results
      const dataKeys = Object.keys(response.data);
      console.log(`Response contains keys: ${dataKeys.join(", ")}`);

      if (response.data.data) {
        console.log("Profile data found:", {
          hasName: !!response.data.data.name,
          hasSkills: !!response.data.data.skills,
          skillCategories: response.data.data.skills
            ? Object.keys(response.data.data.skills)
            : [],
        });
      }

      // Add simple timing log in the exact format requested
      console.log("Duration: " + duration + "ms");
      // Add full JSON response output
      console.log("\n=== FULL JSON RESPONSE ===");
      console.log(JSON.stringify(response.data, null, 2));
      console.log("=== END FULL JSON RESPONSE ===\n");

      return true;
    } else {
      console.error("❌ Unexpected response:");
      console.log(`Status: ${response.status}`);
      console.log("Data:", response.data);
      return false;
    }
  } catch (error) {
    // Log failure
    logTestResult("ChatGPT Test", "failure", 0);
    console.error("Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testChatGptEndpoint()
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

module.exports = { testChatGptEndpoint };
