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

const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const { ANALYSIS_PROMPT } = require("../prompts/promptLoader");
const { openaiService } = require("../services/openai.js");
const { handleAssessment } = require("../services/assessment.js");
const { generateReports } = require("../templates/reports.js");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile.js");
const { evaluateSkillsByStage } = require("../services/scoring");
require("dotenv").config();

async function test() {
  try {
    console.log("\n=== CMO Assessment Test ===");

    // 1. Load transcript & send to OpenAI
    const transcriptPath = path.join(__dirname, "../../docs/transcript.txt");
    const transcript = fs.readFileSync(transcriptPath, "utf8");
    console.log(`✓ Loaded transcript from: ${transcriptPath}`);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: transcript },
      ],
    });
    console.log("\n✓ OpenAI analysis complete");

    // 2. Process through assessment service
    const result = await handleAssessment(transcript);
    console.log("\n✓ Assessment processed");

    // Add test logging
    console.log("\n=== Skill Gaps ===");
    console.log("Hard Skills:", result.scores.gaps.hardSkills);
    console.log("Soft Skills:", result.scores.gaps.softSkills);
    console.log("Leadership:", result.scores.gaps.leadershipSkills);
    console.log("Commercial:", result.scores.gaps.commercialAcumen);

    console.log("\n=== Maturity Score ===");
    console.log("Overall Score:", result.scores.score);

    // 3. Verify reports were generated
    if (!result.reports?.candidate || !result.reports?.client) {
      throw new Error("Missing assessment reports");
    }
    console.log("\n✓ Reports generated");

    console.log("\nOutputs will be saved to:");
    console.log("- Profiles:", path.join(__dirname, "../data/profiles"));
    console.log("- Reports:", path.join(__dirname, "../data/reports"));

    // After saving
    console.log("\n✓ Files saved successfully");
    console.log("Check the above directories to view the assessment results");

    // Test scoring system
    console.log("\n=== Testing Scoring System ===");

    // Sample skills data
    const sampleSkills = {
      hardSkills: {
        marketing_strategy: 0.9,
        digital_marketing: 0.8,
        data_analytics: 0.7,
      },
      softSkills: {
        leadership: 0.8,
        communication: 0.9,
      },
      leadershipSkills: {
        vision_setting: 0.7,
        team_development: 0.8,
      },
      commercialAcumen: {
        financial_modeling: 0.6,
        market_sizing: 0.7,
      },
    };

    // Test each stage
    const stages = ["Early-Stage", "Growth", "Scale-Up", "Enterprise"];

    stages.forEach((stage) => {
      console.log(`\nTesting ${stage} Stage:`);
      const result = evaluateSkillsByStage(sampleSkills, stage);

      console.log("Maturity Score:", result.score);
      console.log(
        "Stage Alignment:",
        result.stageAlignment.matches ? "✓ Matches" : "✗ Gaps Found"
      );

      if (!result.stageAlignment.matches) {
        console.log("Gaps:", result.stageAlignment.gaps);
        console.log("Recommendations:", result.stageAlignment.recommendations);
      }
    });
  } catch (error) {
    console.error("\n✗ Test failed:");
    console.error(`  Error: ${error.message}`);
    process.exit(1);
  }
}

test();
