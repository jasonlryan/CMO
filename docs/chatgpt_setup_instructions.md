# ChatGPT Integration Setup Instructions

This document provides step-by-step instructions for setting up and testing the ChatGPT integration for the CMO Assessment Tool.

## 1. Backend Setup

The backend already includes the necessary endpoint for ChatGPT integration. By default, it's enabled, but you can disable it by setting an environment variable if needed.

### Configuration Options

Add these to your `.env` file if you want to change the default settings:

```
# ChatGPT Integration (enabled by default)
ENABLE_CHATGPT_ENDPOINT=true
```

### Testing the Endpoint

To test if the endpoint is working correctly:

```bash
# Start the backend server
npm run dev:backend

# In a separate terminal, run the test script
npm run test:chatgpt
```

If successful, you should see a response with assessment data.

## 2. Creating the Custom GPT

1. **Go to ChatGPT**

   - Visit https://chat.openai.com/
   - Sign in to your account
   - Click on "Explore GPTs" or "Create a GPT"

2. **Configure the GPT**

   - Name: "CMO Assessment Tool"
   - Description: "Analyze Chief Marketing Officer interview transcripts and provide skill assessments."
   - Instructions: (Copy from below)
   - Add the OpenAPI schema from `backend/api/chatgpt-openapi.json`

3. **GPT Instructions**

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

4. **Conversation Starters**

   - "I'd like to analyze a CMO interview transcript"
   - "Help me evaluate a marketing leader from their interview"
   - "I have a transcript from a CMO candidate interview to assess"
   - "What insights can you provide from this marketing executive interview?"

5. **API Configuration**

   - Click "Configure"
   - Select "Authentication: None"
   - Set "API server URL" to `http://localhost:3000` (for local testing)
   - Upload the OpenAPI schema file or copy-paste its contents

6. **Test and Save**
   - Test the GPT with a sample transcript
   - Save your GPT (you can choose to make it private or public)

## 3. Using the Custom GPT

1. Start your backend server:

   ```bash
   npm run dev:backend
   ```

2. Open your Custom GPT in ChatGPT

3. Provide a transcript for analysis:

   ```
   Please analyze this CMO interview transcript: [paste transcript here]
   ```

4. The GPT will call your API endpoint and format the results

## Troubleshooting

If you encounter issues:

1. **Connection Refused**

   - Ensure your backend server is running
   - Verify you can access http://localhost:3000/api/health in your browser

2. **Invalid Response Format**

   - Check the server logs for errors
   - Ensure your transcript is provided as complete text

3. **Feature Disabled**
   - Check your `.env` file to ensure the endpoint is enabled

## Deployment Notes

For production deployment:

1. Update the OpenAPI schema with your production URL
2. Ensure your server's CORS settings allow requests from ChatGPT
3. Consider adding authentication to your production endpoint
