const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { handleAssessment } = require("../services/assessment");
const { analyzeTranscript } = require("../services/openai");

const API_URL = "http://localhost:3000/api";
const TRANSCRIPT_PATH = path.join(__dirname, "../../docs/transcript.txt");

async function testEndpoints() {
  try {
    // Load actual transcript data
    const transcript = fs.readFileSync(TRANSCRIPT_PATH, "utf-8");

    // Test Assessment Endpoint
    console.log("\nTesting POST /api/assessment");
    const assessmentResponse = await axios.post(`${API_URL}/assessment`, {
      transcript,
    });

    // Debug full response
    console.log(
      "Raw API Response:",
      JSON.stringify(assessmentResponse.data, null, 2)
    );

    // Add more detailed logging
    console.log("Response structure:", Object.keys(assessmentResponse.data));

    // Verify response
    const result = assessmentResponse.data;
    if (!result) {
      throw new Error("No response data from API");
    }

    // Check if profile is in the data property (new structure) or directly in the response (old structure)
    const profile = result.profile || result.data;
    if (!profile || !profile.id) {
      console.error("Expected profile object but got:", Object.keys(result));
      throw new Error("No valid profile object in response");
    }
    console.log("Got profile:", profile.id);

    // Test Reports Endpoint
    console.log("\nTesting GET /api/reports/:id");
    const reportResponse = await axios.get(`${API_URL}/reports/123`);
    console.log("Report Response:", reportResponse.data);

    // Test Profiles Endpoint
    console.log("\nTesting GET /api/profiles/:id");
    const profileResponse = await axios.get(`${API_URL}/profiles/123`);
    console.log("Profile Response:", profileResponse.data);
  } catch (error) {
    console.error("Test failed:", error.message);
    throw error;
  }
}

// Run the test
testEndpoints();
