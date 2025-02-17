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

    // Verify response
    const profile = assessmentResponse.data;
    console.log("Full profile:", profile);
    if (!profile || !profile.id) {
      throw new Error("Invalid profile response");
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
  }
}

// Run the test
testEndpoints();
