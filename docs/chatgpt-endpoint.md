# ChatGPT Endpoint Process Flow

## Overview

The ChatGPT endpoint provides analysis and scoring without generating profiles or reports. This is controlled by the `ENABLE_CHATGPT_ENDPOINT=true` environment variable.

## Flow

1. Request comes to `/api/chatgpt/assessment` with transcript
2. If `ENABLE_CHATGPT_ENDPOINT=true`:
   - Transcript is processed by `openaiService.analyze()` -> gets raw analysis
   - Analysis is passed through `evaluateSkillsByStage()` -> applies scoring
   - File saving is automatically skipped (checked in `saveOutputs()`)
   - JSON with analysis and scores is returned to ChatGPT

## Data Flow

```
Transcript -> Analysis -> Scoring -> JSON Response
```

## Response Structure

```javascript
{
  status: "success",
  profile: {
    // Raw analysis from OpenAI
    name, current_role, years_experience, industry,
    skills: {
      hardSkills, softSkills, leadershipSkills, commercialAcumen
    },
    capability_analysis,
    evidence_analysis,
    maturity_stage,
    assessment_notes,
    qualitative_insights
  },
  scores: {
    gaps: {}, // Skill gaps by category
    score: number, // Overall maturity score
    stageAlignment: {}, // How well skills align with stage
    capabilities: [], // Capability evaluation
    depthAnalysis: {} // Depth level analysis
  }
}
```

## Important Rules

1. NEVER modify the UI code path
2. NEVER touch the profile/report template generation
3. Let the existing code handle the routing through analysis and scoring
4. Only branch logic based on `ENABLE_CHATGPT_ENDPOINT=true`
