const OpenAI = require("openai");
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
  const requiredClusters = [
    "hardSkills",
    "softSkills",
    "leadershipSkills",
    "commercialAcumen",
  ];

  // Check if skills exists and has all required clusters
  if (!skills) return false;

  return requiredClusters.every((cluster) => {
    return typeof skills[cluster] === "object" && skills[cluster] !== null;
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

const openaiService = {
  async analyze(transcript) {
    try {
      infoLog("Starting stage: OpenAI");
      debugLog("Processing transcript:", transcript.length);

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const startApi = performance.now();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: transcript },
        ],
        temperature: 0.3,
      });
      const endApi = performance.now();
      timeLog("OpenAI API call", endApi - startApi);

      const content = completion.choices[0].message.content;

      debugLog("Received response:", content.length);

      try {
        // More robust cleaning
        const cleanedContent = balanceBraces(
          content
            .replace(/\n/g, "") // Remove newlines
            .replace(/\s+/g, " ") // Normalize spaces
            .replace(/,\s*}/g, "}") // Remove trailing commas
            .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
            .replace(/```json/g, "") // Remove markdown
            .replace(/```/g, "") // Remove markdown
            .replace(/^[^{]*/, "") // Remove anything before first {
            .replace(/[^}]*$/, "") // Remove anything after last }
            .trim() // Clean up whitespace
        );

        // Parse the cleaned response
        const parsed = JSON.parse(cleanedContent);

        // Validate skills structure
        if (!validateSkills(parsed.skills)) {
          warnLog("Invalid structure, using defaults:", {
            component: "skills",
            expected: "OpenAI format",
            using: "template defaults",
          });
          parsed.skills = {
            hardSkills: { ...CMO_PROFILE_TEMPLATE.skills.hardSkills },
            softSkills: { ...CMO_PROFILE_TEMPLATE.skills.softSkills },
            leadershipSkills: {
              ...CMO_PROFILE_TEMPLATE.skills.leadershipSkills,
            },
            commercialAcumen: {
              ...CMO_PROFILE_TEMPLATE.skills.commercialAcumen,
            },
          };
        }

        // Convert string scores to numbers
        Object.keys(parsed.skills).forEach((category) => {
          Object.keys(parsed.skills[category]).forEach((skill) => {
            const originalValue = parsed.skills[category][skill];
            parsed.skills[category][skill] = parseFloat(originalValue);

            // Debug log any parsing issues
            if (isNaN(parsed.skills[category][skill])) {
              debugLog(`\nFailed to parse score for ${category}.${skill}:`, {
                original: originalValue,
                parsed: parsed.skills[category][skill],
              });
            }
          });
        });

        // Add validation for capability_analysis
        if (!validateCapabilityAnalysis(parsed.capability_analysis)) {
          warnLog("Invalid capability analysis, using defaults");
          parsed.capability_analysis = {
            technical_capability: {
              ...CMO_PROFILE_TEMPLATE.capability_analysis.technical_capability,
            },
            leadership_capability: {
              ...CMO_PROFILE_TEMPLATE.capability_analysis.leadership_capability,
            },
            investor_readiness: {
              ...CMO_PROFILE_TEMPLATE.capability_analysis.investor_readiness,
            },
            tech_readiness: {
              ...CMO_PROFILE_TEMPLATE.capability_analysis.tech_readiness,
            },
          };
        }

        // Add validation for evidence_analysis
        if (!validateEvidenceAnalysis(parsed.evidence_analysis)) {
          warnLog("Invalid structure, using defaults:", {
            component: "evidence_analysis",
            expected: "OpenAI format",
            using: "template defaults",
          });
          parsed.evidence_analysis = {
            strengths: { ...CMO_PROFILE_TEMPLATE.evidence_analysis.strengths },
            development_areas: {
              ...CMO_PROFILE_TEMPLATE.evidence_analysis.development_areas,
            },
          };
        }

        return parsed;
      } catch (error) {
        errorLog("Failed to parse OpenAI response:", {
          content: content,
          error: error.message,
        });
        throw new Error("Invalid JSON response from OpenAI");
      }
    } catch (error) {
      errorLog("Failed to parse OpenAI response:", error.message);
      throw error;
    }
  },
};

module.exports = { openaiService };
