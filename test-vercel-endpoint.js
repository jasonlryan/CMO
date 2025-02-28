// Test script for the ChatGPT endpoint on Vercel
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "https://cmoassessment.vercel.app/api/chatgpt/assessment";
const SAMPLE_TRANSCRIPT_PATH = path.join(__dirname, "docs/transcript.txt");

async function testVercelEndpoint() {
  try {
    console.log(`Testing Vercel endpoint: ${API_URL}`);

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

    // Send request to the assessment endpoint
    console.log(`Sending request to ${API_URL}...`);
    const response = await axios.post(API_URL, { transcript });

    // Check response
    if (response.status === 200 && response.data) {
      console.log("✓ Vercel endpoint test successful!");
      const dataKeys = Object.keys(response.data);
      console.log(`Response contains keys: ${dataKeys.join(", ")}`);
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
    } else if (error.request) {
      // No response received
      console.error("No response received from the Vercel endpoint.");
    } else {
      // Other error
      console.error("Error message:", error.message);
    }
    return false;
  }
}

// Run the test
testVercelEndpoint()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
