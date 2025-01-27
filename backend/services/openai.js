const OpenAI = require("openai");
const { ANALYSIS_PROMPT } = require("../prompts/assessment");

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
      // Parse the response into an object
      const parsed = JSON.parse(content);

      // Convert string scores to numbers
      Object.keys(parsed.skills).forEach((category) => {
        Object.keys(parsed.skills[category]).forEach((skill) => {
          parsed.skills[category][skill] = parseFloat(
            parsed.skills[category][skill]
          );
        });
      });

      return parsed;
    } catch (error) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid JSON response from OpenAI");
    }
  },
};

module.exports = { openaiService };
