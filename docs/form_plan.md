# Form Assessment Implementation Plan

## Overview

This document outlines the implementation plan for adding form-based assessment functionality to the existing ChatGPT integration. This plan provides a clear path forward with no ambiguity about implementation details.

## Current State

- We have a working transcript-based assessment endpoint at `/api/chatgpt/assessment`
- We have a test file (`chatgpt-form.test.js`) that attempts to send form data to this endpoint
- We have a sample form data file (`cmo_assessment_form_example.json`)
- Server rejects form requests because it expects a transcript

## Implementation Goals

1. Modify the existing `/api/chatgpt/assessment` endpoint to handle both transcript and form data
2. Store form submissions in CSV and JSON formats
3. Process form data through the assessment pipeline
4. Return consistent response format for both input types

## Technical Approach

### 1. Endpoint Modification (backend/chatgpt-server.js)

```javascript
// Current route handler expects: { transcript: "..." }
// Modified to handle:
// - { transcript: "..." } OR
// - { form: { type: "form", submission_id: "...", sections: [...] } }
```

- Update validation to check for either `transcript` or `form` in the request body
- Add `input_type` flag to track source ("transcript" or "form")
- Update caching mechanism to include input type in cache key

### 2. Form Data Storage

```
backend/data/qresponses/
├── forms.csv            // For all form submissions (CSV format)
└── raw_json/            // For individual form submissions (JSON format)
    └── form_[timestamp]_[id].json
```

- CSV format:
  ```
  timestamp,submission_id,section,question_number,question_title,response
  ```
- Storage happens BEFORE processing (for data integrity)

### 3. Assessment Processing

- Use existing assessment pipeline with form-specific prompt
- Pass form data structure to OpenAI
- Extract data from structured form rather than transcript text

### 4. Response Format

- Maintain consistent response structure regardless of input type
- Add `input_type` field to response to indicate source
- Ensure all consumers can handle both input types

## Implementation Steps

1. **Update Server Code** (backend/chatgpt-server.js)

   - Add form data validation
   - Implement CSV and JSON storage for form data
   - Update caching mechanism
   - Modify assessment handler to support form data

2. **Create Form-Specific Prompt** (backend/prompts/formAssessment.md)

   - Design prompt that works with structured form data
   - Include skill mapping instructions
   - Ensure output format matches transcript assessment

3. **Update Assessment Service** (backend/services/assessment.js)

   - Add form data handling path
   - Connect with appropriate prompt
   - Ensure result structure is consistent

4. **Testing**
   - Use `chatgpt-form.test.js` to verify changes
   - Ensure both transcript and form tests pass
   - Validate storage of form data
   - Compare assessment results between input types

## Success Criteria

1. Form data is correctly stored in CSV and JSON formats
2. Assessment results maintain expected structure
3. All tests pass for both transcript and form data
4. Caching works correctly for both input types
5. Performance metrics are logged for both flows
