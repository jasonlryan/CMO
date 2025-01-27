const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Just test if we can connect
async function test() {
  try {
    // 1. Test OpenAI connection
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("OpenAI initialized successfully");

    // 2. Test reading transcript
    const transcriptPath = path.join(__dirname, "../docs/transcript.txt");
    const transcript = fs.readFileSync(transcriptPath, "utf8");
    console.log("\nTranscript loaded:", transcript.length, "characters");

    // 3. Save to profiles directory
    const outputDir = path.join(__dirname, "../frontend/src/lib/data/profiles");
    const outputPath = path.join(outputDir, "test_analysis.json");

    // Create test data
    const testData = {
      timestamp: new Date()
        .toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/[/:]/g, "-"),
      transcript_length: transcript.length,
      test: "successful",
    };

    // Ensure directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Save file
    fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
    console.log("\nTest data saved to:", outputPath);

    // Save profile
    function formatDate(date) {
      return date
        .toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/[/:]/g, "-");
    }

    const timestamp = formatDate(new Date());

    const profilesDir = path.join(__dirname, "../data/profiles");
    const reportsDir = path.join(__dirname, "../data/reports");
    fs.mkdirSync(profilesDir, { recursive: true });
    fs.mkdirSync(reportsDir, { recursive: true });

    // This will now create files like:
    // profiles/27-01-2024-17-59_cmo_profile.json
    const profilePath = path.join(profilesDir, `${timestamp}_cmo_profile.json`);

    // And reports like:
    // reports/27-01-2024-17-59_candidate_report.json
    // reports/27-01-2024-17-59_client_report.json
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
