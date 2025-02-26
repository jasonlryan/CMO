# ChatGPT Frontend Integration Plan for CMO Assessment Tool

This document outlines the plan to quickly add a ChatGPT frontend to the existing CMO Assessment Tool with minimal code changes and risk.

## Overview

The current CMO Assessment Tool operates as follows:
1. Users upload transcript files through a web interface
2. Frontend reads the file contents and sends as text to backend
3. Backend processes the transcript using OpenAI's API with specialized prompts
4. Results are displayed in a web dashboard

The ChatGPT frontend will simplify this process:
1. Users paste transcript text directly to the ChatGPT interface
2. ChatGPT sends text to a new API endpoint
3. Existing backend processing logic handles the analysis
4. ChatGPT formats and displays the results

## Implementation Steps

### Step 1: Add ChatGPT API Endpoint to Backend

Add a single new endpoint to the existing Express server:

```javascript
// Add to server.js
app.post("/api/chatgpt/assessment", async (req, res) => {
  try {
    // Validate request
    if (!req.body || !req.body.transcript) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Missing transcript in request body",
        },
      });
    }

    // Process assessment using existing function
    const result = await handleAssessment(String(req.body.transcript));

    // Return successful response
    return res.json({
      data: result.profile,
      scores: result.scores,
      reports: result.reports,
    });
  } catch (error) {
    console.error("ChatGPT assessment failed:", error);
    return res.status(500).json({
      error: {
        code: "ASSESSMENT_FAILED",
        message: error.message || "Assessment failed",
      },
    });
  }
});
```

### Step 2: Create OpenAPI Schema

Create an OpenAPI schema file for the Custom GPT:

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "CMO Assessment API",
    "description": "API for analyzing CMO interview transcripts",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:3000"
    }
  ],
  "paths": {
    "/api/chatgpt/assessment": {
      "post": {
        "summary": "Analyze a CMO interview transcript",
        "operationId": "analyzeCMOTranscript",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "transcript": {
                    "type": "string",
                    "description": "The interview transcript text"
                  }
                },
                "required": ["transcript"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful analysis",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "description": "Invalid input"
          },
          "500": {
            "description": "Server error"
          }
        }
      }
    }
  }
}
```

### Step 3: Create Custom GPT

Create a Custom GPT with the following configuration:

1. Name: "CMO Assessment Tool"
2. Description: "Analyze Chief Marketing Officer interview transcripts and provide skill assessments."
3. Instructions:

```
You are a CMO Assessment Tool assistant that helps users analyze interview transcripts of Chief Marketing Officer candidates.

When users share a transcript:
1. Send the full transcript text to the API for analysis
2. Format the results into a professional, easy-to-read assessment report
3. Offer insights based on the assessment data

Format your report with these sections:

## Executive Summary
- Candidate Name: [name]
- Current Role: [role]
- Experience: [years] years
- Industry: [industry]
- Maturity Stage: [stage]

## Key Strengths
[List top 3-5 strengths with brief descriptions and evidence]

## Development Areas
[List top 3-5 development areas with brief descriptions and evidence]

## Skill Assessment
[Create a formatted table of skills and scores, organized by category]

## Leadership Profile
- Leadership Style: [style with evidence]
- Values: [key values identified]
- Focus Areas: [primary focus areas]

## Recommendations
[List 3-5 key recommendations]

## Red Flags (if any)
[List any red flags or concerns]

Be helpful and professional. If users have follow-up questions about specific aspects of the assessment, provide detailed explanations based on the data.
```

4. Conversation starters:
   - "I'd like to analyze a CMO interview transcript"
   - "Help me evaluate a marketing leader from their interview"
   - "I have a transcript from a CMO candidate interview to assess"
   - "What insights can you provide from this marketing executive interview?"

5. Configure API access with the OpenAPI schema

### Step 4: Test the Integration

1. Start the backend server
2. Test the new endpoint directly with Postman or curl
3. Test with the Custom GPT using sample transcripts
4. Verify results match the web application output

### Step 5: Deploy

1. Deploy updated backend to production
2. Update the Custom GPT with production API URL
3. Publish the Custom GPT

## Advantages of This Approach

1. **Minimal Code Changes**: Only adds a new endpoint without modifying existing code
2. **Zero Risk to Current Functionality**: Changes are isolated and don't affect existing paths
3. **Reuses Existing Logic**: Leverages all current analysis code without duplication
4. **Fast Implementation**: Can be completed in 3-4 hours
5. **User-Friendly Experience**: Direct transcript entry without file uploading

## Future Enhancements

Once the basic integration is working, consider:
1. Adding authentication for security
2. Enhancing response formatting
3. Adding interactive follow-up capabilities
4. Implementing comparison features for multiple candidates
5. Adding visualization capabilities within ChatGPT

## Timeline

- Backend API endpoint addition: 1 hour
- OpenAPI schema creation: 30 minutes
- Custom GPT setup and testing: 1.5 hours
- End-to-end testing: 1 hour

Total estimated time: 4 hours
