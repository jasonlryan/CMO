# ChatGPT Assessment Endpoint

## Purpose

This directory contains serverless function handlers specifically for the ChatGPT assessment endpoint on Vercel. These files are **not** part of the core assessment logic but rather serve as API handlers for the Vercel serverless environment.

## File Structure

- `endpoint.js`: Serverless function handler for the `/api/chatgpt/assessment` endpoint
  - This file handles HTTP requests, validates input, and calls the core assessment logic
  - It is separate from the core assessment logic to accommodate Vercel's serverless architecture

## Relationship to Core Assessment Logic

The core assessment logic is located in `backend/services/assessment.js`. The files in this directory:

1. Import and use the core assessment logic
2. Handle HTTP-specific concerns (request validation, CORS, etc.)
3. Format responses according to API standards

## Deployment Notes

In the Vercel environment, files in the `api` directory automatically become API endpoints. The `vercel.json` configuration maps the `/api/chatgpt/assessment` route to the `endpoint.js` file in this directory.

This approach allows us to maintain the core assessment logic in the backend directory while providing a dedicated serverless function for the Vercel environment.
