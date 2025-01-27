import type { Report } from './ui-types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export async function submitAssessment(transcript: string) {
  const response = await fetch(`${API_URL}/api/assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  
  if (!response.ok) throw new Error('Assessment failed');
  return response.json();
}

export async function getProfile(id: string) {
  const response = await fetch(`${API_URL}/api/profiles/${id}`);
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

export const api = {
  submitAssessment,
  getProfile
}; 