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
const path = require("path");
const fs = require("fs");

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

  // Handle case where skills might be undefined
  if (!skills) {
    console.warn("Skills object is undefined, returning empty structure");
    return correctedSkills;
  }

  // Extract capability_analysis if it exists within skills
  let capabilityAnalysis = null;
  if (skills.capability_analysis) {
    capabilityAnalysis = skills.capability_analysis;
    delete skills.capability_analysis;
  }

  // Move any nested skills to top level
  Object.entries(skills).forEach(([category, skillsObj]) => {
    if (category === "capability_analysis") return; // Skip capability_analysis

    // Handle case where skillsObj might not be an object
    if (!skillsObj || typeof skillsObj !== "object") {
      console.warn(`Skipping non-object skill category: ${category}`);
      return;
    }

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

  // Add capability_analysis back if it was extracted
  if (capabilityAnalysis) {
    skills.capability_analysis = capabilityAnalysis;
  }

  return correctedSkills;
}

const openaiService = {
  async analyze(transcript) {
    try {
      infoLog("Starting stage: OpenAI");
      const startApi = performance.now();

      // Log the API key being used (first few characters only for security)
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        errorLog("No OpenAI API key found in environment variables");
        throw new Error(
          "Missing OpenAI API key. Please set OPENAI_API_KEY in your .env file."
        );
      }

      debugLog("Using API key starting with:", apiKey.substring(0, 10) + "...");

      const openai = new OpenAI({
        apiKey: apiKey,
      });

      // Debug transcript type and content
      debugLog("OpenAI Input:", {
        type: typeof transcript,
        isString: typeof transcript === "string",
        length: transcript?.length,
        sample: transcript?.substring(0, 100),
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: transcript },
        ],
        temperature: 0.2,
      });

      // Debug API payload
      debugLog("OpenAI API Payload:", {
        messageTypes: completion.messages?.map((m) => typeof m.content),
        userContent: typeof completion.messages?.[1]?.content,
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

        // Log the full parsed response structure for debugging
        debugLog(
          "Full OpenAI Response Structure:",
          JSON.stringify(parsed, null, 2)
        );

        // Create a valid structure even if the response is unexpected
        if (!parsed.skills || typeof parsed.skills !== "object") {
          warnLog("Missing or invalid skills structure in OpenAI response");
          parsed.skills = {}; // Ensure skills exists even if empty
        }

        // Log parsed response
        console.log("\nOpenAI Parsed Response:", {
          hasSkills: !!parsed.skills,
          skillClusters: Object.keys(parsed.skills || {}),
          sampleSkill: parsed.skills?.hardSkills?.marketing_strategy,
          hasCapabilityAnalysis:
            !!parsed.capability_analysis ||
            !!parsed.skills?.capability_analysis,
        });

        // Store capability_analysis separately if it exists at the top level
        let capabilityAnalysis = parsed.capability_analysis;

        // Or if it exists inside skills
        if (!capabilityAnalysis && parsed.skills?.capability_analysis) {
          capabilityAnalysis = parsed.skills.capability_analysis;
          delete parsed.skills.capability_analysis;
        }

        // Process skills structure
        parsed.skills = correctSkillsStructure(parsed.skills);

        // Add capability_analysis back to the parsed object (not inside skills)
        if (capabilityAnalysis) {
          parsed.capability_analysis = capabilityAnalysis;

          // Validate capability_analysis structure only if it exists
          const requiredCapabilities = [
            "technical_capability",
            "leadership_capability",
            "investor_readiness",
            "tech_readiness",
          ];

          const missingCapabilities = requiredCapabilities.filter(
            (cap) => !parsed.capability_analysis[cap]
          );

          if (missingCapabilities.length > 0) {
            warnLog(
              `Missing required capabilities: ${missingCapabilities.join(", ")}`
            );
            // Log warning but don't throw error
          }
        } else {
          // Log warning but don't throw error for missing capability_analysis
          warnLog("Missing capability_analysis in OpenAI response");
        }

        // Validate evidence without adding defaults
        let missingEvidence = false;
        Object.entries(parsed.skills).forEach(([clusterName, cluster]) => {
          Object.entries(cluster).forEach(([skillName, skill]) => {
            if (
              !skill.evidence ||
              !Array.isArray(skill.evidence) ||
              skill.evidence.length === 0
            ) {
              warnLog(`Missing evidence for ${clusterName}.${skillName}`);
              missingEvidence = true;
            }
          });
        });

        if (missingEvidence) {
          warnLog("Some skills are missing evidence in the OpenAI response");
          // Log warning but don't throw error
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
      errorLog("OpenAI analysis failed:", error);
      throw error;
    }
  },

  async analyzeForm(formData) {
    infoLog("Starting form analysis...");
    debugLog("Form data structure:", {
      sections: formData.sections.length,
      type: formData.type,
      submission_id: formData.submission_id,
    });

    try {
      // Fetch the form analysis prompt
      const promptPath = path.join(__dirname, "../prompts/formAnalysis.md");
      let systemPrompt;

      if (fs.existsSync(promptPath)) {
        systemPrompt = fs.readFileSync(promptPath, "utf8");
      } else {
        // Fall back to transcript prompt if form prompt doesn't exist yet
        warnLog("Form analysis prompt not found, using transcript prompt");
        systemPrompt = fs.readFileSync(
          path.join(__dirname, "../prompts/transcriptAnalysis.md"),
          "utf8"
        );
      }

      // Format the form data for analysis
      const formattedFormData = this.formatFormData(formData);

      // Fetch depth levels for reference
      const depthLevelsPath = path.join(
        __dirname,
        "../config/depthLevels.json"
      );
      const depthLevels = JSON.parse(fs.readFileSync(depthLevelsPath, "utf8"));

      // Build messages array
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Analyze this form submission: ${formattedFormData}`,
        },
      ];

      // Add depth level reference if needed
      messages.push({
        role: "system",
        content: `Here are the depth level definitions for reference: ${JSON.stringify(
          depthLevels,
          null,
          2
        )}`,
      });

      // Time the API call
      const startApi = performance.now();
      debugLog("Starting OpenAI API call...");

      // Make API call
      const response = await openAIClient.chat.completions.create({
        model: CONFIG.gptModel,
        messages,
        temperature: 0.2,
        max_tokens: 2500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      // Log API call timing
      timeLog("OpenAI API call", performance.now() - startApi);

      // Process response to extract structured data
      debugLog("Received response from OpenAI");
      const content = response.choices[0].message.content;

      // Extract JSON from response
      try {
        // Find JSON in the content
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/{[\s\S]*}/);

        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;

        // Parse JSON
        const parsedData = JSON.parse(jsonString.trim());
        debugLog("Successfully parsed response JSON");
        return parsedData;
      } catch (parseError) {
        errorLog("Failed to parse GPT response:", parseError);
        errorLog("Raw content:", content);
        throw new Error("Failed to parse GPT response: " + parseError.message);
      }
    } catch (error) {
      errorLog("Form analysis failed:", error);
      throw error;
    }
  },

  formatFormData: function (formData) {
    let formatted = `Form Submission ID: ${formData.submission_id}\n`;
    formatted += `Timestamp: ${formData.timestamp}\n\n`;

    formatted += "## Form Responses\n\n";

    formData.sections.forEach((section) => {
      formatted += `### ${section.title}\n\n`;

      section.questions.forEach((question) => {
        formatted += `**Q${question.number}: ${question.title}**\n`;
        formatted += `A: ${question.response || "No response provided"}\n\n`;
      });
    });

    return formatted;
  },
};

module.exports = {
  openaiService,
  analyzeTranscript: openaiService.analyze,
};
