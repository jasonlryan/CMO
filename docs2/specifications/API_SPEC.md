# CMO Assessment Tool API Specification

This document provides a comprehensive specification for the CMO Assessment Tool API, including all available endpoints, request and response formats, authentication requirements, and usage examples.

## API Overview

The CMO Assessment Tool API provides programmatic access to the assessment functionality, allowing clients to submit transcripts for analysis, retrieve assessment results, and manage user data. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://cmo-135405620426.europe-west1.run.app/api`

## Authentication

Most endpoints require authentication using a JWT token. The token should be included in the Authorization header using the Bearer scheme.

```
Authorization: Bearer <your_jwt_token>
```

To obtain a token, use the authentication endpoints described below.

## API Versioning

The current API version is v1, which is included in the URL path: `/api/v1/...`

## Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "company": "Example Corp"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "usr_123456789",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**

- 201: Created
- 400: Bad Request (invalid input)
- 409: Conflict (email already exists)

#### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "usr_123456789",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

**Status Codes:**

- 200: OK
- 401: Unauthorized (invalid credentials)

### Assessment Endpoints

#### POST /assessment

Submit a transcript for assessment.

**Authentication:** Required

**Request Body:**

```json
{
  "transcript": "Interview transcript content...",
  "candidateName": "Jane Smith",
  "position": "Chief Marketing Officer",
  "companyMaturityStage": "Growth"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "assessmentId": "asmnt_123456789",
    "status": "processing"
  }
}
```

**Status Codes:**

- 202: Accepted
- 400: Bad Request
- 401: Unauthorized

#### GET /assessment/:assessmentId

Retrieve assessment results by ID.

**Authentication:** Required

**Path Parameters:**

- `assessmentId`: The unique identifier of the assessment

**Response:**

```json
{
  "status": "success",
  "data": {
    "assessmentId": "asmnt_123456789",
    "candidateName": "Jane Smith",
    "position": "Chief Marketing Officer",
    "companyMaturityStage": "Growth",
    "status": "completed",
    "completedAt": "2025-03-03T14:30:00Z",
    "profile": {
      "summary": "Jane is an experienced marketing leader with 15 years of experience...",
      "overallScore": 0.85,
      "maturityFit": {
        "score": 0.78,
        "stage": "Growth",
        "analysis": "Jane shows strong alignment with growth stage requirements..."
      }
    },
    "skillScores": {
      "categories": {
        "hardSkills": 0.82,
        "softSkills": 0.88,
        "leadershipSkills": 0.85,
        "commercialAcumen": 0.79
      },
      "skills": [
        {
          "name": "Marketing Strategy",
          "score": 0.92,
          "evidence": "Demonstrated strong strategic thinking in campaign planning...",
          "depthLevel": 3
        }
        // Additional skills...
      ]
    },
    "depthAnalysis": {
      "overallDepth": 2.8,
      "gapAnalysis": [
        {
          "skill": "Data Analytics",
          "currentDepth": 2,
          "requiredDepth": 3,
          "gap": 1,
          "priority": "High"
        }
        // Additional gaps...
      ]
    },
    "recommendations": [
      "Focus on developing data analytics capabilities to bridge the identified gap"
      // Additional recommendations...
    ]
  }
}
```

**Status Codes:**

- 200: OK
- 401: Unauthorized
- 404: Not Found

#### GET /assessments

Retrieve a list of all assessments for the current user.

**Authentication:** Required

**Query Parameters:**

- `limit` (optional): Maximum number of results to return (default: 10)
- `offset` (optional): Number of results to skip (default: 0)
- `status` (optional): Filter by status ('processing', 'completed', 'failed')

**Response:**

```json
{
  "status": "success",
  "data": {
    "total": 24,
    "limit": 10,
    "offset": 0,
    "assessments": [
      {
        "assessmentId": "asmnt_123456789",
        "candidateName": "Jane Smith",
        "position": "Chief Marketing Officer",
        "status": "completed",
        "completedAt": "2025-03-03T14:30:00Z",
        "overallScore": 0.85
      }
      // Additional assessments...
    ]
  }
}
```

**Status Codes:**

- 200: OK
- 401: Unauthorized

### ChatGPT Integration Endpoint

#### POST /chatgpt/assessment

Process a transcript for assessment through the ChatGPT integration.

**Authentication:** Not required (rate-limited by IP)

**Request Body:**

```json
{
  "transcript": "Interview transcript content...",
  "candidateName": "Jane Smith",
  "position": "Chief Marketing Officer",
  "companyMaturityStage": "Growth"
}
```

**Response:**

```json
{
  "profile": {
    "candidateName": "Jane Smith",
    "position": "Chief Marketing Officer",
    "summary": "Jane is an experienced marketing leader with 15 years of experience...",
    "companyStage": "Growth",
    "overallScore": 0.85
  },
  "scores": {
    "categories": {
      "hardSkills": 0.82,
      "softSkills": 0.88,
      "leadershipSkills": 0.85,
      "commercialAcumen": 0.79
    }
  },
  "skills": [
    {
      "name": "Marketing Strategy",
      "category": "hardSkills",
      "score": 0.92,
      "evidence": "Demonstrated strong strategic thinking in campaign planning...",
      "depthLevel": 3
    }
    // Additional skills...
  ],
  "depthAnalysis": {
    "overallDepth": 2.8,
    "maturityFit": {
      "score": 0.78,
      "analysis": "Jane shows strong alignment with growth stage requirements..."
    },
    "gaps": [
      {
        "skill": "Data Analytics",
        "currentDepth": 2,
        "requiredDepth": 3,
        "gap": 1,
        "priority": "High"
      }
      // Additional gaps...
    ]
  },
  "recommendations": [
    "Focus on developing data analytics capabilities to bridge the identified gap"
    // Additional recommendations...
  ]
}
```

**Status Codes:**

- 200: OK
- 400: Bad Request
- 429: Too Many Requests
- 500: Internal Server Error

## Error Responses

All API errors follow this format:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional information
  }
}
```

### Common Error Codes

| Code             | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `INVALID_INPUT`  | Request body or parameters are invalid                   |
| `UNAUTHORIZED`   | Authentication is required or token is invalid           |
| `FORBIDDEN`      | User does not have permission for the requested resource |
| `NOT_FOUND`      | The requested resource was not found                     |
| `RATE_LIMITED`   | Too many requests from this client                       |
| `INTERNAL_ERROR` | Server encountered an unexpected error                   |

## Rate Limiting

API requests are rate-limited based on the client's IP address or user ID:

- Authenticated users: 100 requests per minute
- Unauthenticated users: 20 requests per minute
- ChatGPT endpoint: 5 requests per minute per IP

The following headers are included in API responses:

- `X-RateLimit-Limit`: Request limit per minute
- `X-RateLimit-Remaining`: Number of requests left in the current window
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets

## Webhooks

For long-running assessment processes, you can register a webhook to receive notifications when an assessment is completed.

### POST /webhooks

Register a new webhook.

**Authentication:** Required

**Request Body:**

```json
{
  "url": "https://example.com/webhook",
  "events": ["assessment.completed", "assessment.failed"],
  "secret": "your_webhook_secret"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "webhookId": "whk_123456789",
    "url": "https://example.com/webhook",
    "events": ["assessment.completed", "assessment.failed"]
  }
}
```

## Client Libraries

Official client libraries are available for:

- JavaScript/TypeScript: [@cmo-assessment/client](https://www.npmjs.com/package/@cmo-assessment/client)
- Python: [cmo-assessment-client](https://pypi.org/project/cmo-assessment-client/)

## Additional Resources

- [Postman Collection](https://www.postman.com/cmo-assessment-tool/workspace/api-collection)
- [OpenAPI Schema](../implementations/chatgpt-openapi.json)
