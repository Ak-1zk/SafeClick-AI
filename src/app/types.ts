export type AnalysisClassification = 'GENUINE' | 'SUSPICIOUS' | 'SCAM';

export type UrlAnalysis = {
  classification: AnalysisClassification;
  risk_score: number;
  reasons: string[];
  recommendation: string;
  url?: string;
};

export type EmailAnalysis = {
  classification: AnalysisClassification;
  risk_score: number;
  reasons: string[];
  recommendation: string;
};

export type MessageAnalysis = {
  classification: AnalysisClassification;
  risk_score: number;
  reasons: string[];
  recommendation: string;
};

export type AnyAnalysis = UrlAnalysis | EmailAnalysis | MessageAnalysis;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  photoDataUri?: string;
};
