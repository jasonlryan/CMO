// Test script for depth levels implementation

const fs = require("fs");
const path = require("path");
const scoringModule = require("../services/scoring");

// Enable debug logging
process.env.DEBUG = "true";

// Mock the debugLog function if not available
global.debugLog = global.debugLog || console.log;
global.warnLog = global.warnLog || console.warn;
global.errorLog = global.errorLog || console.error;

// Check if assessDepthLevels is exported
if (!scoringModule.assessDepthLevels) {
  console.error(
    "assessDepthLevels function is not exported from scoring module"
  );
  console.log("Available exports:", Object.keys(scoringModule));

  // Create a wrapper to call the internal function
  console.log("Creating a wrapper for assessDepthLevels...");

  // We'll use evaluateSkillsByStage which should be exported and calls assessDepthLevels internally
  if (!scoringModule.evaluateSkillsByStage) {
    console.error("evaluateSkillsByStage function is not exported either");
    process.exit(1);
  }
}

// Load depth levels config directly for comparison
const depthLevelsPath = path.join(__dirname, "../config/depthLevels.json");
let DEPTH_LEVELS;

try {
  const depthLevelsData = fs.readFileSync(depthLevelsPath, "utf8");
  DEPTH_LEVELS = JSON.parse(depthLevelsData);
  console.log("Successfully loaded depth levels configuration");
  console.log("Available stages:", Object.keys(DEPTH_LEVELS));
} catch (err) {
  console.error("Failed to load depth levels:", err.message);
  process.exit(1);
}

// Create a sample skills object for testing
const sampleSkills = {
  hardSkills: {
    marketing_strategy: { score: 0.8, reportedDepth: 2, evidence: [] },
    digital_marketing: { score: 0.7, reportedDepth: 2, evidence: [] },
    data_analytics: { score: 0.5, reportedDepth: 1, evidence: [] },
  },
  softSkills: {
    communication: { score: 0.8, reportedDepth: 3, evidence: [] },
    strategic_thinking: { score: 0.9, reportedDepth: 3, evidence: [] },
  },
  leadershipSkills: {
    vision_setting: { score: 0.8, reportedDepth: 3, evidence: [] },
  },
  commercialAcumen: {
    financial_modeling: { score: 0.5, reportedDepth: 1, evidence: [] },
  },
};

// Test for each maturity stage
const stages = Object.keys(DEPTH_LEVELS);

console.log("\n=== TESTING DEPTH LEVEL CALCULATIONS ===\n");

stages.forEach((stage) => {
  console.log(`\nTesting stage: ${stage}`);

  // Get expected depths from configuration
  const expectedMarketingStrategyDepth =
    DEPTH_LEVELS[stage].hardSkills.marketing_strategy;
  const expectedCommunicationDepth =
    DEPTH_LEVELS[stage].softSkills.communication;

  console.log(
    `Expected depth from config - marketing_strategy: ${expectedMarketingStrategyDepth}`
  );
  console.log(
    `Expected depth from config - communication: ${expectedCommunicationDepth}`
  );

  // Calculate depth analysis using evaluateSkillsByStage
  const result = scoringModule.evaluateSkillsByStage(sampleSkills, stage);
  const depthAnalysis = result.depthAnalysis.perSkill;

  // Verify results
  const calculatedMarketingStrategyDepth =
    depthAnalysis.hardSkills.marketing_strategy.expectedDepth;
  const calculatedCommunicationDepth =
    depthAnalysis.softSkills.communication.expectedDepth;

  console.log(
    `Calculated depth - marketing_strategy: ${calculatedMarketingStrategyDepth}`
  );
  console.log(
    `Calculated depth - communication: ${calculatedCommunicationDepth}`
  );

  // Check if they match
  if (
    expectedMarketingStrategyDepth === calculatedMarketingStrategyDepth &&
    expectedCommunicationDepth === calculatedCommunicationDepth
  ) {
    console.log(`✅ PASS: Depth levels for ${stage} match configuration`);
  } else {
    console.log(
      `❌ FAIL: Depth levels for ${stage} do not match configuration`
    );
    console.log("Expected:", {
      marketing_strategy: expectedMarketingStrategyDepth,
      communication: expectedCommunicationDepth,
    });
    console.log("Calculated:", {
      marketing_strategy: calculatedMarketingStrategyDepth,
      communication: calculatedCommunicationDepth,
    });
  }

  // Calculate gaps
  const marketingStrategyGap = depthAnalysis.hardSkills.marketing_strategy.gap;
  const communicationGap = depthAnalysis.softSkills.communication.gap;

  console.log(
    `Gap - marketing_strategy: ${marketingStrategyGap} (Reported: ${sampleSkills.hardSkills.marketing_strategy.reportedDepth}, Expected: ${calculatedMarketingStrategyDepth})`
  );
  console.log(
    `Gap - communication: ${communicationGap} (Reported: ${sampleSkills.softSkills.communication.reportedDepth}, Expected: ${calculatedCommunicationDepth})`
  );

  // Verify gap calculation
  const expectedMarketingStrategyGap = Math.max(
    0,
    expectedMarketingStrategyDepth -
      sampleSkills.hardSkills.marketing_strategy.reportedDepth
  );
  const expectedCommunicationGap = Math.max(
    0,
    expectedCommunicationDepth -
      sampleSkills.softSkills.communication.reportedDepth
  );

  if (
    marketingStrategyGap === expectedMarketingStrategyGap &&
    communicationGap === expectedCommunicationGap
  ) {
    console.log(`✅ PASS: Gap calculations for ${stage} are correct`);
  } else {
    console.log(`❌ FAIL: Gap calculations for ${stage} are incorrect`);
  }
});

console.log("\n=== DEPTH LEVEL TEST COMPLETE ===\n");
