# CMO Assessment Tool Integration Guide

## 1. API Client Setup

```typescript
// src/services/api.ts
interface APIResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const api = {
  async uploadTranscript(transcript: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });
      return await response.json();
    } catch (error) {
      return { error: { code: "UPLOAD_FAILED", message: error.message } };
    }
  },

  async getReport(id: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`/api/reports/${id}`);
      return await response.json();
    } catch (error) {
      return { error: { code: "FETCH_FAILED", message: error.message } };
    }
  },

  async getProfile(id: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`/api/profiles/${id}`);
      return await response.json();
    } catch (error) {
      return { error: { code: "FETCH_FAILED", message: error.message } };
    }
  },
};
```

## 2. AppContext Integration

Add these actions to your existing AppContext:

- SET_PROFILE
- SET_ASSESSMENTS
- SET_CURRENT_ASSESSMENT
- SET_LOADING
- SET_ERROR

The state should track:

Current profile
Assessment list
Loading states
Error states

## 3. Component Integration Points

### Home Component

- File upload handling
- Transcript processing
- Error handling
- Loading states

### AssessmentDashboard

- Fetch and display assessment list
- Handle assessment selection
- Display quick stats

### ReportViewer

- Fetch report data
- Toggle between client/candidate views
- PDF export functionality

## 4. Data Flow Examples

```typescript
// In Home component
const handleFileUpload = async (file: File) => {
  dispatch({ type: "SET_LOADING", payload: true });
  try {
    const text = await file.text();
    const response = await api.uploadTranscript(text);
    if (response.error) throw new Error(response.error.message);
    dispatch({ type: "SET_PROFILE", payload: response.data });
    dispatch({ type: "SET_VIEW", payload: "dashboard" });
  } catch (error) {
    dispatch({ type: "SET_ERROR", payload: error });
  } finally {
    dispatch({ type: "SET_LOADING", payload: false });
  }
};
```

## 5. Error Handling

Implement consistent error handling across all API calls:

Network errors
Validation errors
Server errors
User feedback

## 6. Loading States

Use loading states for:

File upload
Report fetching
Profile loading
PDF generation

## 7. Type Safety

Ensure type safety across the integration:

```typescript
interface Assessment {
  id: string;
  profileId: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

interface CMOProfile {
  id: string;
  name: string;
  organization: string;
  assessmentDate: string;
}

// Add these to your existing types
```

## 8. Implementation Steps

1. Set up API client
2. Update AppContext with new actions
3. Implement file upload in Home
4. Add report fetching to ReportViewer
5. Implement error handling
6. Add loading states
7. Test all integrations

## 9. Testing Considerations

- Test API responses
- Test error scenarios
- Test loading states
- Test file upload
- Test PDF generation
- Test view transitions

## 10. Security Considerations

- Validate file types
- Handle large files
- Sanitize inputs
- Implement rate limiting
- Add request validation

This guide provides the foundation for integrating your React frontend with the Express backend. Follow these patterns for consistent, type-safe, and error-resistant integration.
