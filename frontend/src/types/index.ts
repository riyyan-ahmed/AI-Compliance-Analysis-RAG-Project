export type DocumentStatus = 'uploaded' | 'analyzing' | 'ready' | 'error';

export interface DocumentSummary {
  id: string;
  userId: string;
  originalName: string;
  filename: string;
  fileSize: number;
  uploadedAt: string;
  status: DocumentStatus;
  summary?: string;
  keyPoints?: string[];
  errorMessage?: string;
}

export interface GapItem {
  area: string;
  severity: 'Critical' | 'Major' | 'Minor';
  acmeProcedure: string;
  standardRequirement: string;
  recommendation: string;
}

export interface GapAnalysisResult {
  overallComplianceRating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  overallScore: number;
  summary: string;
  totalGapsFound: number;
  gaps: GapItem[];
  strengths: string[];
  priorityActions: string[];
}

export interface User {
  id: string;
  username: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}
