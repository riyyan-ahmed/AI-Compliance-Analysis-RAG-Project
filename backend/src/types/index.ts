export interface User {
  id: string;
  username: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  username: string;
  createdAt: Date;
}

export type DocumentStatus = 'uploaded' | 'analyzing' | 'ready' | 'error';

export interface DocumentChunk {
  index: number;
  text: string;
  startChar: number;
  endChar: number;
}

export interface ComplianceDocument {
  id: string;
  userId: string;
  originalName: string;
  filename: string;
  fileSize: number;
  uploadedAt: Date;
  text: string;
  chunks: DocumentChunk[];
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
