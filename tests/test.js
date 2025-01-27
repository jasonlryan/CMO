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
      timestamp: new Date().toISOString(),
      transcript_length: transcript.length,
      test: "successful",
    };

    // Ensure directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Save file
    fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
    console.log("\nTest data saved to:", outputPath);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
