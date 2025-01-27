const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Add template imports
const {
  generateSkillAnalysis,
  generateDepthAnalysis,
  generateNextSteps,
} = require("../templates/reports.js"); // Note: .js extension

const { ANALYSIS_PROMPT } = require("../prompts/assessment.js");

async function test() {
  try {
    // 1. Test OpenAI connection
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✓ OpenAI initialized");

    // 2. Test transcript loading
    const transcriptPath = path.join(__dirname, "../../docs/transcript.txt");
    const transcript = fs.readFileSync(transcriptPath, "utf8");
    console.log("✓ Transcript loaded:", transcript.length, "characters");

    // 4. Test OpenAI analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: transcript },
      ],
      temperature: 0.3,
    });
    console.log("✓ Analysis complete");

    // Add more detailed debug logging
    console.log(
      "Raw OpenAI response:",
      completion.choices[0].message.content
        .split("\n")
        .map((line, i) => `${i + 1}: ${line}`)
        .join("\n")
    );

    const cleanJson = completion.choices[0].message.content
      .replace(/```json\n/, "")
      .replace(/```/, "")
      .trim();

    // Log the last few lines of JSON
    console.log("\nLast few lines of JSON:");
    cleanJson
      .split("\n")
      .slice(-10)
      .forEach((line, i) => {
        console.log(`${i}: ${line}`);
      });

    try {
      const profile = JSON.parse(cleanJson);
      // Debug logs
      console.log("Profile structure:", {
        skills: profile.skills,
        depth_levels: profile.skill_depth_levels,
        growth_areas: profile.growth_areas,
      });

      // Save profile
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const profilesDir = path.join(__dirname, "../data/profiles");
      const reportsDir = path.join(__dirname, "../data/reports");
      fs.mkdirSync(profilesDir, { recursive: true });
      fs.mkdirSync(reportsDir, { recursive: true });

      const profilePath = path.join(
        profilesDir,
        `${timestamp}_cmo_profile.json`
      );
      fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
      console.log("✓ Profile saved:", profilePath);

      // 7. Generate and save reports using proper templates
      const candidateReport = {
        title: "CMO Assessment Report - Candidate View",
        generated: new Date().toISOString(),
        candidate: {
          name: profile.name,
          role: profile.current_role,
          experience: profile.years_experience,
        },
        skillAnalysis: generateSkillAnalysis(profile.skills, 0.8), // Use template function
        depthAnalysis: generateDepthAnalysis(profile.skill_depth_levels), // Use template function
        developmentAreas: generateNextSteps(profile), // Use template function
      };

      const clientReport = {
        title: "CMO Assessment Report - Client View",
        generated: new Date().toISOString(),
        candidate: {
          profile: {
            current_role: profile.current_role,
            years_experience: profile.years_experience,
            industry: profile.industry,
            organization_type: profile.organization_type,
          },
        },
        skillAssessment: {
          overview: profile.skills,
          depthAnalysis: profile.skill_depth_levels,
          keyStrengths: profile.key_strengths,
        },
        maturityFit: profile.maturity_stage,
      };

      // After generating reports, log them:
      console.log(
        "\n✓ Generated Candidate Report:",
        JSON.stringify(candidateReport, null, 2)
      );

      console.log(
        "\n✓ Generated Client Report:",
        JSON.stringify(clientReport, null, 2)
      );

      // Save reports
      fs.writeFileSync(
        path.join(reportsDir, `${timestamp}_candidate_report.json`),
        JSON.stringify(candidateReport, null, 2)
      );
      console.log("✓ Candidate report saved");

      fs.writeFileSync(
        path.join(reportsDir, `${timestamp}_client_report.json`),
        JSON.stringify(clientReport, null, 2)
      );
      console.log("✓ Client report saved");
    } catch (error) {
      console.error("JSON Parse Error at position:", error.message);
      console.error(
        "JSON snippet around error:",
        cleanJson.substring(Math.max(0, 1898 - 50), 1898 + 50)
      );
      throw error;
    }
  } catch (error) {
    console.error("✗ Test failed:", error);
    process.exit(1);
  }
}

test();
