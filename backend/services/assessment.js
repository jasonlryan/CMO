const { openaiService } = require("./openai");
const { evaluateSkillsByStage } = require("./scoring");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
const path = require("path");
const fs = require("fs");

async function processTranscript(transcript) {
  const analysis = await openaiService.analyze(transcript);
  return {
    ...CMO_PROFILE_TEMPLATE,
    id: new Date().toISOString(),
    name: "Anonymous",
    current_role: analysis.current_role,
    years_experience: analysis.years_experience,
    industry: analysis.industry,
    organization_type: analysis.organization_type,
    skills: {
      hardSkills: analysis.skills.hardSkills,
      softSkills: analysis.skills.softSkills,
      leadershipSkills: analysis.skills.leadershipSkills,
      commercialAcumen: analysis.skills.commercialAcumen,
    },
    investor_capabilities: analysis.investor_capabilities,
    tech_readiness: analysis.tech_readiness,
    skill_depth_levels: analysis.skill_depth_levels,
    key_strengths: analysis.key_strengths,
    growth_areas: analysis.growth_areas,
    maturity_stage: analysis.maturity_stage,
    evidence: {
      strengths: analysis.evidence.strengths,
      development_areas: analysis.evidence.development_areas,
    },
    assessment_notes: {
      red_flags: analysis.assessment_notes.red_flags,
      follow_up: analysis.assessment_notes.follow_up,
      leadership_style: analysis.assessment_notes.leadership_style,
    },
  };
}

async function handleAssessment(transcript) {
  try {
    // 1. Get OpenAI analysis
    const analysis = await openaiService.analyze(transcript);

    // 2. Create CMO profile using template
    const profile = {
      ...CMO_PROFILE_TEMPLATE,
      ...analysis,
      id: new Date().toISOString(),
    };

    // 3. Score the assessment
    const scores = evaluateSkillsByStage(profile.skills, {
      hardSkills: 0.8,
      softSkills: 0.8,
      leadershipSkills: 0.8,
      commercialAcumen: 0.8,
    });

    // 4. Generate reports
    const reports = require("../templates/reports");
    const { candidateReport, clientReport } = reports.generateReports(
      profile,
      scores
    );

    // 5. Save reports and profile
    const timestamp = formatDate(new Date());
    saveOutputs(profile, candidateReport, clientReport, timestamp);

    return {
      status: "success",
      profile,
      reports: {
        candidate: candidateReport,
        client: clientReport,
      },
    };
  } catch (error) {
    console.error("Assessment failed:", error);
    throw error;
  }
}

function formatDate(date) {
  return date
    .toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/[/:]/g, "-");
}

function saveOutputs(profile, candidateReport, clientReport, timestamp) {
  const dataDir = path.join(__dirname, "../data");
  const reportsDir = path.join(dataDir, "reports");
  const profilesDir = path.join(dataDir, "profiles");

  // Ensure directories exist
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.mkdirSync(profilesDir, { recursive: true });

  // Save profile
  fs.writeFileSync(
    path.join(profilesDir, `profile_${timestamp}.json`),
    JSON.stringify(profile, null, 2)
  );

  // Save reports
  fs.writeFileSync(
    path.join(reportsDir, `candidate_report_${timestamp}.json`),
    JSON.stringify(candidateReport, null, 2)
  );

  fs.writeFileSync(
    path.join(reportsDir, `client_report_${timestamp}.json`),
    JSON.stringify(clientReport, null, 2)
  );
}

module.exports = { handleAssessment };
