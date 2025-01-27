// ONLY UI-specific types for display/layout
export interface ReportSection {
  title: string;
  content: unknown;
}

export interface Report {
  id: string;
  profileId: string;
  sections: ReportSection[];
  createdAt: Date;
  type: 'candidate' | 'client';
} 