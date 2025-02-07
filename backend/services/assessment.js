const { openaiService } = require("./openai");
const { evaluateSkillsByStage } = require("./scoring");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
const path = require("path");
const fs = require("fs");

// Helper to validate skill clusters
function getValidCluster(cluster, defaultCluster) {
  // Log validation steps
  console.log("\nValidating cluster:", {
    hasCluster: !!cluster,
    isObject: typeof cluster === "object",
    keys: cluster ? Object.keys(cluster) : [],
    usingDefault:
      !cluster ||
      typeof cluster !== "object" ||
      Object.keys(cluster || {}).length === 0,
  });

  if (
    !cluster ||
    typeof cluster !== "object" ||
    Object.keys(cluster || {}).length === 0
  ) {
    return { ...defaultCluster };
  }
  return cluster;
}

async function handleAssessment(transcript) {
  try {
    const analysis = await openaiService.analyze(transcript);

    // Log raw analysis
    console.log("\nRaw Analysis:", {
      hasSkills: !!analysis.skills,
      skillKeys: analysis.skills ? Object.keys(analysis.skills) : [],
      rawSkills: analysis.skills,
    });

    // Log template defaults
    console.log("\nTemplate Defaults:", {
      hasHardSkills: !!CMO_PROFILE_TEMPLATE.skills.hardSkills,
      hardSkillsKeys: Object.keys(CMO_PROFILE_TEMPLATE.skills.hardSkills),
    });

    // Create profile with double validation
    const profile = {
      ...CMO_PROFILE_TEMPLATE,
      id: new Date().toISOString(),
      name: analysis.name || "Anonymous",
      current_role: analysis.current_role || "",
      years_experience: analysis.years_experience || 0,
      industry: analysis.industry || "",
      organization_type: analysis.organization_type || "B2B",
      skills: {
        hardSkills:
          analysis.skills?.hardSkills || CMO_PROFILE_TEMPLATE.skills.hardSkills,
        softSkills:
          analysis.skills?.softSkills || CMO_PROFILE_TEMPLATE.skills.softSkills,
        leadershipSkills: getValidCluster(
          analysis.skills?.leadershipSkills,
          CMO_PROFILE_TEMPLATE.skills.leadershipSkills
        ),
        commercialAcumen: getValidCluster(
          analysis.skills?.commercialAcumen,
          CMO_PROFILE_TEMPLATE.skills.commercialAcumen
        ),
      },
      investor_capabilities: analysis.investor_capabilities || {},
      tech_readiness: analysis.tech_readiness || {},
      skill_depth_levels: analysis.skill_depth_levels || {},
      key_strengths: analysis.key_strengths || [],
      growth_areas: analysis.growth_areas || [],
      maturity_stage: analysis.maturity_stage || {
        best_fit: "",
        alignment_reasons: [],
      },
      evidence: {
        strengths: analysis.evidence?.strengths || {},
        development_areas: analysis.evidence?.development_areas || {},
      },
      assessment_notes: {
        red_flags: analysis.assessment_notes?.red_flags || [],
        follow_up: analysis.assessment_notes?.follow_up || [],
        leadership_style: analysis.assessment_notes?.leadership_style || "",
      },
    };

    // Log final profile
    console.log("\nFinal Profile:", {
      hasSkills: !!profile.skills,
      hardSkills: profile.skills.hardSkills,
      allSkillKeys: Object.keys(profile.skills),
    });

    // Debug log
    console.log("Profile Skills:", {
      hasHardSkills: !!profile.skills.hardSkills,
      hardSkillsKeys: Object.keys(profile.skills.hardSkills),
      allSkills: JSON.stringify(profile.skills, null, 2),
    });

    // 3. Score the assessment
    const scores = evaluateSkillsByStage(
      profile.skills,
      profile.maturity_stage?.best_fit || "Growth"
    );

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
      scores,
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
