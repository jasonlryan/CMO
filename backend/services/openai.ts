import OpenAI from "openai";
import { ANALYSIS_PROMPT } from "../prompts/assessment";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiService = {
  async analyze(transcript: string) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: transcript },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    return JSON.parse(content);
  }
}; 