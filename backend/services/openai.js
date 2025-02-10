const OpenAI = require("openai");
require("dotenv").config(); // Ensure this is at top
const { ANALYSIS_PROMPT } = require("../prompts/promptLoader");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
const {
  debugLog,
  infoLog,
  warnLog,
  errorLog,
  timeLog,
} = require("../config/logging");

// Helper to validate skills structure
function validateSkills(skills) {
  // Debug validation input
  console.log("DEBUG - Validation Input:", {
    hasSkills: !!skills,
    clusters: skills ? Object.keys(skills) : "none",
  });

  const requiredClusters = [
    "hardSkills",
    "softSkills",
    "leadershipSkills",
    "commercialAcumen",
  ];

  // Check if skills exists and has all required clusters
  if (!skills) return false;

  return requiredClusters.every((cluster) => {
    // Check cluster exists
    if (typeof skills[cluster] !== "object" || skills[cluster] === null) {
      return false;
    }

    // Check each skill has score, depth and evidence
    return Object.values(skills[cluster]).every((skill) => {
      return (
        typeof skill === "object" &&
        typeof skill.score === "number" &&
        skill.score >= 0 &&
        skill.score <= 1 &&
        typeof skill.depth === "number" &&
        skill.depth >= 1 &&
        skill.depth <= 4 &&
        Array.isArray(skill.evidence)
      );
    });
  });
}

// First add new validation helper
function validateCapabilityAnalysis(capabilities) {
  const requiredCapabilities = [
    "technical_capability",
    "leadership_capability",
    "investor_readiness",
    "tech_readiness",
  ];

  if (!capabilities) return false;

  return requiredCapabilities.every((cap) => {
    const capability = capabilities[cap];
    return (
      capability &&
      typeof capability.score === "number" &&
      typeof capability.gap === "number" &&
      typeof capability.recommendation === "string"
    );
  });
}

// Add new validation helper
function validateEvidenceAnalysis(evidenceAnalysis) {
  if (!evidenceAnalysis) return false;
  return (
    evidenceAnalysis.strengths &&
    typeof evidenceAnalysis.strengths === "object" &&
    evidenceAnalysis.development_areas &&
    typeof evidenceAnalysis.development_areas === "object"
  );
}

// Add helper function for brace balancing
function balanceBraces(content) {
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  return content + "}".repeat(Math.max(0, openBraces - closeBraces));
}

// Add structure correction
function correctSkillsStructure(skills) {
  const correctedSkills = {
    hardSkills: {},
    softSkills: {},
    leadershipSkills: {},
    commercialAcumen: {},
  };

  // Move any nested skills to top level
  Object.entries(skills).forEach(([category, skillsObj]) => {
    Object.entries(skillsObj).forEach(([skill, data]) => {
      if (
        skill === "softSkills" ||
        skill === "leadershipSkills" ||
        skill === "commercialAcumen"
      ) {
        correctedSkills[skill] = data;
        delete skillsObj[skill];
      } else {
        correctedSkills[category][skill] = data;
      }
    });
  });

  return correctedSkills;
}

const openaiService = {
  async analyze(transcript) {
    try {
      infoLog("Starting stage: OpenAI");
      const startApi = performance.now();

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: transcript },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      });

      const content = completion.choices[0].message.content;
      timeLog("OpenAI API call", performance.now() - startApi);

      try {
        // Clean and parse response once
        const cleanedContent = balanceBraces(
          content
            .replace(/\n/g, "")
            .replace(/\s+/g, " ")
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]")
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()
        );

        // Parse JSON once and store
        const parsed = JSON.parse(cleanedContent);

        // Validate complete structure first
        if (!parsed.skills || typeof parsed.skills !== "object") {
          throw new Error("Missing or invalid skills structure");
        }

        // Log parsed response
        console.log("\nOpenAI Parsed Response:", {
          hasSkills: !!parsed.skills,
          skillClusters: Object.keys(parsed.skills || {}),
          sampleSkill: parsed.skills?.hardSkills?.marketing_strategy,
        });

        // Process skills structure
        parsed.skills = correctSkillsStructure(parsed.skills);

        // Only validate evidence after structure is confirmed
        Object.entries(parsed.skills).forEach(([clusterName, cluster]) => {
          Object.entries(cluster).forEach(([skillName, skill]) => {
            if (!skill.evidence?.length) {
              throw new Error(
                `Missing evidence for ${clusterName}.${skillName}`
              );
            }
          });
        });

        return parsed;
      } catch (error) {
        errorLog("Failed to parse OpenAI response:", {
          content: content,
          error: error.message,
        });
        throw new Error("Invalid JSON response from OpenAI");
      }
    } catch (error) {
      errorLog("OpenAI analysis failed:", error);
      throw error;
    }
  },
};

module.exports = { openaiService };
