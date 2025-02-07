const OpenAI = require("openai");
const { ANALYSIS_PROMPT } = require("../prompts/promptLoader");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");

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

const openaiService = {
  async analyze(transcript) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: transcript },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;

    try {
      // More robust cleaning
      const cleanedContent = content
        .replace(/\n/g, "") // Remove newlines
        .replace(/\s+/g, " ") // Normalize spaces
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
        .replace(/```json/g, "") // Remove markdown
        .replace(/```/g, "") // Remove markdown
        .replace(/^[^{]*/, "") // Remove anything before first {
        .replace(/[^}]*$/, "") // Remove anything after last }
        .trim(); // Clean up whitespace

      // Ensure proper JSON structure
      if (!cleanedContent.endsWith("}")) {
        throw new Error("Malformed JSON: missing closing brace");
      }

      // Parse the cleaned response
      const parsed = JSON.parse(cleanedContent);

      // Validate skills structure
      if (!validateSkills(parsed.skills)) {
        console.warn(
          "\nInvalid skills structure from OpenAI, using template defaults"
        );
        parsed.skills = {
          hardSkills: { ...CMO_PROFILE_TEMPLATE.skills.hardSkills },
          softSkills: { ...CMO_PROFILE_TEMPLATE.skills.softSkills },
          leadershipSkills: { ...CMO_PROFILE_TEMPLATE.skills.leadershipSkills },
          commercialAcumen: { ...CMO_PROFILE_TEMPLATE.skills.commercialAcumen },
        };
      }

      // Convert string scores to numbers
      Object.keys(parsed.skills).forEach((category) => {
        Object.keys(parsed.skills[category]).forEach((skill) => {
          const originalValue = parsed.skills[category][skill];
          parsed.skills[category][skill] = parseFloat(originalValue);

          // Debug log any parsing issues
          if (isNaN(parsed.skills[category][skill])) {
            console.warn(`\nFailed to parse score for ${category}.${skill}:`, {
              original: originalValue,
              parsed: parsed.skills[category][skill],
            });
          }
        });
      });

      return parsed;
    } catch (error) {
      console.error("Failed to parse OpenAI response. Content:", content);
      console.error("Cleaning error:", error.message);
      throw new Error("Invalid JSON response from OpenAI");
    }
  },
};

module.exports = { openaiService };
