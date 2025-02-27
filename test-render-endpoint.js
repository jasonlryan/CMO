// Test script for the ChatGPT endpoint on Render
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Replace with your Render URL
const RENDER_URL = "https://cmo-assessment-api.onrender.com";
const API_URL = `${RENDER_URL}/api/chatgpt/assessment`;
const SAMPLE_TRANSCRIPT_PATH = path.join(__dirname, "docs/transcript.txt");

async function testRenderEndpoint() {
  try {
    console.log(`Testing Render endpoint: ${API_URL}`);

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
      const healthCheck = await axios.get(`${RENDER_URL}/api/health`);
      console.log(`Health check status: ${healthCheck.status}`);
      console.log(`Health check response: ${JSON.stringify(healthCheck.data)}`);
    } catch (healthError) {
      console.warn("⚠️ Health check failed, but continuing with main test");
      console.warn(healthError.message);
    }

    // Send request to the assessment endpoint
    console.log(`Sending request to ${API_URL}...`);
    const response = await axios.post(API_URL, { transcript });

    // Check response
    if (response.status === 200 && response.data) {
      console.log("✓ Render endpoint test successful!");
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

      return true;
    } else {
      console.error("❌ Unexpected response:");
      console.log(`Status: ${response.status}`);
      console.log("Data:", response.data);
      return false;
    }
  } catch (error) {
    console.error("❌ Test failed:");
    if (error.response) {
      // Server responded with an error
      console.error(`Status: ${error.response.status}`);
      console.error("Error data:", error.response.data);

      // Detailed error for assessment failures
      if (error.response.data?.error?.code === "ASSESSMENT_FAILED") {
        console.error(
          "Assessment failed with message:",
          error.response.data.error.message
        );
        console.error(
          "This is likely an OpenAI API or processing error, not an endpoint issue."
        );
      }
    } else if (error.request) {
      // No response received
      console.error("No response received from the Render endpoint.");
      console.error("Check that your Render service is deployed and running.");
    } else {
      // Other error
      console.error("Error message:", error.message);
    }
    return false;
  }
}

// Run the test
testRenderEndpoint()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
