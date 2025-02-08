const { openaiService } = require("./openai");
const { evaluateSkillsByStage } = require("./scoring");
const { CMO_PROFILE_TEMPLATE } = require("../templates/cmoProfile");
const { performance } = require("perf_hooks");
const { debugLog } = require("../config");
const path = require("path");
const fs = require("fs");

// Helper to validate skill clusters
function getValidCluster(cluster, defaultCluster) {
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
    console.log("\nStarting assessment...");
    const startTotal = performance.now();

    // OpenAI
    console.log("Analyzing transcript with OpenAI...");
    const startOpenAI = performance.now();
    const analysis = await openaiService.analyze(transcript);
    const endOpenAI = performance.now();
    console.log(`✓ OpenAI analysis complete (${endOpenAI - startOpenAI} ms)`);

    // Profile
    console.log("\nCreating profile...");
    const startProfile = performance.now();

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
      capability_analysis:
        analysis.capability_analysis ||
        CMO_PROFILE_TEMPLATE.capability_analysis,
      evidence_analysis:
        analysis.evidence_analysis || CMO_PROFILE_TEMPLATE.evidence_analysis,
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
    const endProfile = performance.now();
    console.log(`✓ Profile created (${endProfile - startProfile} ms)`);

    // Scoring
    console.log("\nCalculating scores...");
    const startScoring = performance.now();
    debugLog("DEBUG - Passing to scoring:", {
      skills: profile.skills,
      stage: profile.maturity_stage?.best_fit || "Growth",
      capabilities: profile.capability_analysis,
    });
    const scores = evaluateSkillsByStage(
      profile.skills,
      profile.maturity_stage?.best_fit || "Growth",
      profile.capability_analysis
    );
    const endScoring = performance.now();
    console.log(`✓ Scoring complete (${endScoring - startScoring} ms)`);

    // Reports
    console.log("\nGenerating reports...");
    const startReports = performance.now();
    const reports = require("../templates/reports");
    const { candidateReport, clientReport } = reports.generateReports(
      profile,
      scores
    );
    const endReports = performance.now();
    console.log(`✓ Reports generated (${endReports - startReports} ms)`);

    // Saving
    console.log("\nSaving outputs...");
    const startSaving = performance.now();
    saveOutputs(profile, candidateReport, clientReport, formatDate(new Date()));
    const endSaving = performance.now();
    console.log(`✓ Outputs saved (${endSaving - startSaving} ms)`);

    const endTotal = performance.now();
    console.log(`\n✓ Assessment complete (${endTotal - startTotal} ms)`);

    return {
      status: "success",
      profile,
      scores,
      reports: {
        candidate: candidateReport,
        client: clientReport,
      },
      timing: {
        total: endTotal - startTotal,
        openai: endOpenAI - startOpenAI,
        profile: endProfile - startProfile,
        scoring: endScoring - startScoring,
        reports: endReports - startReports,
        saving: endSaving - startSaving,
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
