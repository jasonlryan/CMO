// Types that match our backend responses
interface APIResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

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

interface AssessmentReport {
  id: string;
  candidateName: string;
  overallScore: number;
  radarData: Array<{
    subject: string;
    A: number;
    fullMark: number;
  }>;
  gapData: Array<{
    name: string;
    current: number;
    required: number;
    gap: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  developmentAreas: string[];
  growthOpportunities: Array<{
    area: string;
    description: string;
    actions: string[];
  }>;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

const getBaseUrl = async () => {
  // Check if we're in a production environment (Vercel deployment)
  const isProduction = window.location.hostname !== 'localhost';
  
  if (isProduction) {
    console.log("Production environment detected, using relative API path");
    return ''; // Empty string means API requests will be relative to the current domain
  }
  
  console.log("Development environment detected, attempting to connect to local backend...");
  
  // Try primary port
  try {
    console.log("Trying primary port (3000)...");
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log("✓ Connected to backend on port 3000");
      return 'http://localhost:3000';
    }
  } catch (error) {
    console.log("⚠️ Failed to connect on port 3000");
  }

  // Try secondary port
  try {
    console.log("Trying secondary port (3001)...");
    const response = await fetch('http://localhost:3001/api/health');
    if (response.ok) {
      console.log("✓ Connected to backend on port 3001");
      return 'http://localhost:3001';
    }
  } catch (error) {
    console.log("❌ Failed to connect on port 3001");
  }
  
  // Try tertiary port
  try {
    console.log("Trying tertiary port (3002)...");
    const response = await fetch('http://localhost:3002/api/health');
    if (response.ok) {
      console.log("✓ Connected to backend on port 3002");
      return 'http://localhost:3002';
    }
  } catch (error) {
    console.log("❌ Failed to connect on port 3002");
  }

  throw new Error("Unable to connect to backend server");
};

const handleApiError = (error: any, operation: string): APIResponse<any> => {
  console.error(`API Error during ${operation}:`, error);
  return {
    error: {
      code: "API_ERROR",
      message: error?.message || `Failed to ${operation}`,
    },
  };
};

export const uploadTranscript = async (transcript: string): Promise<APIResponse<CMOProfile>> => {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        error: {
          code: "UPLOAD_FAILED",
          message: data.error?.message || `Server error: ${response.status}`,
        },
      };
    }
    return data;
  } catch (error) {
    return handleApiError(error, "upload transcript");
  }
};

export const getReport = async (id: string): Promise<APIResponse<AssessmentReport>> => {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/reports/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: {
          code: "FETCH_FAILED",
          message: data.error?.message || `Server error: ${response.status}`,
        },
      };
    }
    return data;
  } catch (error) {
    return handleApiError(error, "fetch report");
  }
};

export const getProfile = async (id: string): Promise<APIResponse<CMOProfile>> => {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/profiles/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: {
          code: "FETCH_FAILED",
          message: data.error?.message || `Server error: ${response.status}`,
        },
      };
    }
    return data;
  } catch (error) {
    return handleApiError(error, "fetch profile");
  }
};

export const getAssessments = async (): Promise<APIResponse<Assessment[]>> => {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/assessments`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: {
          code: "FETCH_FAILED",
          message: data.error?.message || `Server error: ${response.status}`,
        },
      };
    }
    return data;
  } catch (error) {
    return handleApiError(error, "fetch assessments");
  }
}; 