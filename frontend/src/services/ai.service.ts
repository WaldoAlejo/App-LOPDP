import { api } from './api';

export interface SuggestRequest {
  field: string;
  treatmentName?: string;
  mainPurpose?: string;
  currentValue?: string;
  context?: Record<string, any>;
}

export interface SuggestResponse {
  suggestion: string;
}

export interface ValidateRequest {
  treatment: Record<string, any>;
}

export interface ValidateResponse {
  isValid: boolean;
  score: number;
  observations: string[];
  suggestions: string[];
}

export interface ChatRequest {
  message: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
}

export const aiService = {
  suggest: (dto: SuggestRequest) =>
    api.post<SuggestResponse>('/ai/suggest', dto).then((r) => r.data),

  validate: (dto: ValidateRequest) =>
    api.post<ValidateResponse>('/ai/validate', dto).then((r) => r.data),

  chat: (dto: ChatRequest) =>
    api.post<ChatResponse>('/ai/chat', dto).then((r) => r.data),
};
