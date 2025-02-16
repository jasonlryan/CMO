import { CMOProfile, AssessmentResult } from '../types';

export interface APIRoutes {
  '/api/assessment': {
    POST: {
      body: { transcript: string };
      response: CMOProfile;
    };
  };
  '/api/reports': {
    GET: {
      params: { id: string };
      response: AssessmentResult;
    };
  };
} 