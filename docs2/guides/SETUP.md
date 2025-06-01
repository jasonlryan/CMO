# CMO Assessment Tool - Setup Guide

This guide provides step-by-step instructions for setting up and configuring the CMO Assessment Tool for both development and production use.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Production Deployment](#production-deployment)
6. [ChatGPT Integration Setup](#chatgpt-integration-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the CMO Assessment Tool, ensure you have the following:

- Node.js (v16.x or later)
- npm (v7.x or later)
- Git
- OpenAI API key
- Supabase account (for production)
- Google Cloud account (for production deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/cmo-assessment-tool.git
cd cmo-assessment-tool
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Backend .env file
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
PORT=3000
ENABLE_CHATGPT_ENDPOINT=true
ENABLE_CACHE=true
LOG_LEVEL=debug
```

Create a `.env` file in the `frontend` directory:

```bash
# Frontend .env file
VITE_API_URL=http://localhost:3000
```

## Configuration

### 1. Benchmark Configuration

The system uses configuration files to determine scoring weights and depth level requirements:

- `backend/config/benchmarks.json`: Defines skill weightings for each maturity stage
- `backend/config/depthLevels.json`: Specifies expected depth levels for skills

Review these files to ensure they match your assessment requirements.

### 2. OpenAI Model Configuration

By default, the system uses `gpt-4o-mini` for transcript analysis. You can change this in `backend/config/models.js`:

```javascript
// Example model configuration
module.exports = {
  defaultModel: "gpt-4o-mini",
  analysisModel: "gpt-4o-mini",
  summaryModel: "gpt-4o-mini",
  maxTokens: 4000,
  temperature: 0.2,
};
```

### 3. Report Templates

Review and customize report templates in `backend/templates/`:

- `cmoProfile.js`: Defines the structure of CMO profiles
- `reports.js`: Contains templates for different report types

## Running the Application

### 1. Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3000 (or the port specified in your `.env` file).

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend development server will start on http://localhost:5173.

### 3. Verify the Setup

- Navigate to http://localhost:5173 in your browser
- The dashboard should load without errors
- Try uploading a test transcript to verify the assessment process

## Production Deployment

### 1. Backend Deployment to Google Cloud Run

```bash
# Build the Docker image
cd backend
docker build -t gcr.io/your-project/cmo-assessment-backend .

# Push to Google Container Registry
docker push gcr.io/your-project/cmo-assessment-backend

# Deploy to Cloud Run
gcloud run deploy cmo-assessment-backend \
  --image gcr.io/your-project/cmo-assessment-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your_production_api_key,NODE_ENV=production
```

### 2. Frontend Deployment

The frontend can be deployed to any static hosting service:

```bash
# Build the frontend
cd frontend
npm run build

# Deploy to your hosting service
# Example for Firebase
firebase deploy
```

### 3. Configure Environment Variables

Set these environment variables in your production environment:

- `NODE_ENV=production`
- `OPENAI_API_KEY=your_production_api_key`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_KEY=your_supabase_key`
- `ENABLE_CHATGPT_ENDPOINT=true`
- `ENABLE_CACHE=true`
- `COMPRESSION_THRESHOLD=1024`
- `LOG_LEVEL=info`

## ChatGPT Integration Setup

### 1. Create OpenAPI Schema

The schema file is located at `backend/api/chatgpt-openapi.json`. Update the server URL to match your production backend:

```json
{
  "servers": [
    {
      "url": "https://your-production-backend.com",
      "description": "Production API Server"
    }
  ]
}
```

### 2. Configure Custom GPT

1. Log in to [OpenAI](https://chat.openai.com/)
2. Create a new Custom GPT
3. Configure it using the instructions in [ChatGPT Integration Documentation](../implementations/CHATGPT.md)
4. Upload your OpenAPI schema
5. Test with sample transcripts

## Troubleshooting

### Common Issues

#### OpenAI API Key Issues

```
Error: OpenAI API key invalid or expired
```

**Solution**: Check your OPENAI_API_KEY environment variable and ensure it's valid.

#### Port Already in Use

```
Error: Port 3000 is already in use
```

**Solution**: Change the PORT environment variable or close the application using that port.

#### Frontend API Connection Issues

```
Error: Failed to fetch data from API
```

**Solution**: Verify that the backend is running and that VITE_API_URL is set correctly.

#### Out of Memory Errors

```
JavaScript heap out of memory
```

**Solution**: Increase the Node.js memory limit:

```bash
export NODE_OPTIONS=--max-old-space-size=4096
```

### Getting Help

If you encounter issues not covered in this guide:

1. Check the logs:

   ```bash
   cd backend
   npm run logs
   ```

2. Review the [architecture documentation](../core/ARCHITECTURE.md) to understand the system components

3. Contact technical support with:
   - Error messages
   - Environment information
   - Steps to reproduce the issue
