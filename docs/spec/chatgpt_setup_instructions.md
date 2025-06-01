# ChatGPT Integration Setup Instructions

This document provides step-by-step instructions for setting up and testing the ChatGPT integration for the CMO Assessment Tool.

## 1. Backend Setup

The backend includes a dedicated server implementation for ChatGPT integration. The integration is controlled by the `ENABLE_CHATGPT_ENDPOINT` environment variable.

### Configuration Options

Add these to your `.env` file:

```
# ChatGPT Integration (enabled by default)
ENABLE_CHATGPT_ENDPOINT=true

# Optional: Enable cloud logging for performance metrics
ENABLE_CLOUD_LOGGING=false
```

### Testing the Endpoint

To test if the endpoint is working correctly:

```bash
# Start the backend server
npm run dev:backend

# In a separate terminal, run the test script
npm run test:chatgpt
```

If successful, you should see a response with assessment data and timing information in the console.

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
   - Set "API server URL" to your deployment URL (default: `https://cmo-135405620426.europe-west1.run.app`)
   - Upload the OpenAPI schema file from `backend/api/chatgpt-openapi.json` or copy-paste its contents

6. **Test and Save**
   - Test the GPT with a sample transcript
   - Save your GPT (you can choose to make it private or public)

## 3. Using the Custom GPT

1. Start your backend server:

   ```bash
   # For local development
   npm run dev:backend

   # For production
   npm run start:backend
   ```

2. Open your Custom GPT in ChatGPT

3. Provide a transcript for analysis:

   ```
   Please analyze this CMO interview transcript: [paste transcript here]
   ```

4. The GPT will call your API endpoint and format the results

## Performance Considerations

The ChatGPT integration includes several performance optimizations:

1. **Response Caching**

   - Responses are cached for 1 hour to improve performance for repeated requests
   - Cache is automatically cleaned up to prevent memory leaks

2. **Compression**

   - Response compression is enabled in production mode
   - Compression threshold is set to 1KB to avoid overhead for small responses

3. **Performance Logging**
   - Request processing times are logged to the console
   - Optional Google Cloud Logging integration for production monitoring

## Troubleshooting

If you encounter issues:

1. **Connection Refused**

   - Ensure your backend server is running
   - Verify you can access the health endpoint in your browser
   - For local testing: http://localhost:3000/health

2. **Invalid Response Format**

   - Check the server logs for errors
   - Ensure your transcript is provided as complete text
   - Verify the OpenAPI schema matches your endpoint implementation

3. **Feature Disabled**
   - Check your `.env` file to ensure `ENABLE_CHATGPT_ENDPOINT=true`
   - Restart the server after changing environment variables

## Deployment Notes

For production deployment:

1. The OpenAPI schema is already configured with the production URL (`https://cmo-135405620426.europe-west1.run.app`)
2. CORS is enabled by default to allow requests from ChatGPT
3. Consider enabling Google Cloud Logging for performance monitoring in production
4. For additional security, consider adding authentication to your production endpoint
