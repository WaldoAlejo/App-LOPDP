import { useMutation } from '@tanstack/react-query';
import { aiService, type SuggestRequest, type ChatRequest } from '../services/ai.service';

export function useAiSuggest() {
  return useMutation({
    mutationFn: (dto: SuggestRequest) => aiService.suggest(dto),
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: (dto: ChatRequest) => aiService.chat(dto),
  });
}
