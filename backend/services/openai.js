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

        // Debug raw and cleaned content
        debugLog("Raw OpenAI Response:", content);
        debugLog("Cleaned Content:", cleanedContent);

        // Parse the cleaned response
        const parsed = JSON.parse(cleanedContent);

        console.log("\nOpenAI Parsed Response:", {
          hasSkills: !!parsed.skills,
          skillClusters: Object.keys(parsed.skills || {}),
          sampleSkill: parsed.skills?.hardSkills?.marketing_strategy,
        });

        // Convert string scores to numbers
        Object.keys(parsed.skills).forEach((category) => {
          Object.keys(parsed.skills[category]).forEach((skill) => {
            const skillObj = parsed.skills[category][skill];
            // If skill is a number/string, convert to object structure
            if (typeof skillObj !== "object" || !skillObj.score) {
              parsed.skills[category][skill] = {
                score: parseFloat(skillObj) || 0,
                depth: 1,
                evidence: [],
              };
            }
          });
        });

        // Validate skills structure
        if (!validateSkills(parsed.skills)) {
          warnLog("Invalid structure, using defaults:", {
            component: "skills",
            expected: "OpenAI format with depth",
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

        // After getting OpenAI response
        if (!validateEvidenceAnalysis(parsed.evidence_analysis)) {
          // Try to build evidence from skills
          const evidence = {
            strengths: {},
            development_areas: {},
          };

          // Extract evidence from skills
          Object.entries(parsed.skills || {}).forEach(([category, skills]) => {
            Object.entries(skills).forEach(([skill, data]) => {
              if (data.evidence?.length) {
                evidence.strengths[skill] = data.evidence;
              }
            });
          });

          parsed.evidence_analysis = evidence;
        }

        // Add debug logging
        debugLog("OpenAI Response Structure:", {
          hasSkills: !!parsed.skills,
          skillFormat: parsed.skills?.hardSkills?.marketing_strategy,
        });

        // Debug after conversion
        console.log("DEBUG - After Conversion:", {
          hasSkills: !!parsed.skills,
          sampleSkill: parsed.skills?.hardSkills?.marketing_strategy,
        });

        // Use in parse function
        parsed.skills = correctSkillsStructure(parsed.skills);

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
