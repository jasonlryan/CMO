# ChatGPT Endpoint Process Flow

## Overview

The ChatGPT endpoint provides analysis and scoring without generating file outputs. This is controlled by the `ENABLE_CHATGPT_ENDPOINT=true` environment variable.

## Flow

1. Request comes to `/api/chatgpt/assessment` with transcript
2. If `ENABLE_CHATGPT_ENDPOINT=true`:
   - Request is checked against in-memory cache (1-hour TTL)
   - If cache hit, return cached result immediately
   - If cache miss, transcript is processed by `openaiService.analyze()` -> gets raw analysis
   - Analysis is passed through `evaluateSkillsByStage()` -> applies scoring
   - File saving is automatically skipped (checked in `saveOutputs()`)
   - Result is cached for future requests
   - JSON with analysis and scores is returned to ChatGPT

## Performance Optimizations

1. **In-Memory Caching**

   - Cache key: MD5 hash of transcript text
   - Cache TTL: 1 hour
   - Automatic cache cleanup every hour
   - Cache hit/miss logging

2. **Compression** (Production Only)

   - Enabled when `NODE_ENV=production`
   - Threshold: 1KB (only compresses responses larger than 1KB)
   - Compression level: 6 (balance between speed and compression ratio)

3. **Performance Logging**
   - Console logging for all environments
   - Google Cloud Logging in production (when `ENABLE_CLOUD_LOGGING=true`)
   - Metrics tracked: request processing time, transcript length, cache status

## Data Flow

```
Transcript -> [Cache Check] -> Analysis -> Scoring -> JSON Response
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
    qualitative_insights,
    depthAnalysis: {
      strategic: { level, skills, evidence, narrative },
      managerial: { level, skills, evidence, narrative },
      conversational: { level, skills, evidence, narrative },
      executional: { level, skills, evidence, narrative }
    }
  },
  scores: {
    gaps: {}, // Skill gaps by category
    score: number, // Overall maturity score
    stageAlignment: {}, // How well skills align with stage
    capabilities: [], // Capability evaluation
    depthAnalysis: {} // Depth level analysis
  }
  // Note: Reports are included in the response but may be omitted in future versions to reduce response size
}
```

## Important Rules

1. NEVER modify the UI code path
2. NEVER touch the profile/report template generation
3. Let the existing code handle the routing through analysis and scoring
4. Only branch logic based on `ENABLE_CHATGPT_ENDPOINT=true`
5. Keep the response size minimal by only including essential data

## Testing

The endpoint can be tested using:

```bash
npm run test:chatgpt
```

This will:

1. Start the server if not already running
2. Send a sample transcript from `docs/transcript.txt`
3. Log the response and timing information
4. Record test results in `backend/tests/test_timings.log`

## Recent Performance Improvements

Recent optimizations have improved response times:

- Initial implementation: ~23-24 seconds
- With caching: ~17-18 seconds for cache misses, <1 second for cache hits
- With compression: Reduced response size by approximately 60%

## Deployment

The endpoint is deployed to production at:

```
https://cmo-135405620426.europe-west1.run.app/api/chatgpt/assessment
```

The OpenAPI schema for ChatGPT integration is available at:

```
backend/api/chatgpt-openapi.json
```
