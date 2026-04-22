import { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useAiSuggest } from '../hooks/useAiAssistant';

interface AiSuggestionButtonProps {
  field: string;
  treatmentName?: string;
  mainPurpose?: string;
  currentValue?: string;
  context?: Record<string, any>;
  onSuggestion: (suggestion: string) => void;
  label?: string;
}

export function AiSuggestionButton({
  field,
  treatmentName,
  mainPurpose,
  currentValue,
  context,
  onSuggestion,
  label = 'Sugerir con IA',
}: AiSuggestionButtonProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const suggest = useAiSuggest();

  const handleSuggest = async () => {
    const result = await suggest.mutateAsync({
      field,
      treatmentName,
      mainPurpose,
      currentValue,
      context,
    });

    if (result.suggestion) {
      setPreviewText(result.suggestion);
      setShowPreview(true);
    }
  };

  const handleAccept = () => {
    onSuggestion(previewText);
    setShowPreview(false);
    setPreviewText('');
  };

  const handleReject = () => {
    setShowPreview(false);
    setPreviewText('');
  };

  return (
    <div className="relative">
      {!showPreview ? (
        <button
          type="button"
          onClick={handleSuggest}
          disabled={suggest.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-servi-green/10 px-3 py-1.5 text-xs font-medium text-servi-green transition-colors hover:bg-servi-green/20 disabled:opacity-50"
        >
          {suggest.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {label}
        </button>
      ) : (
        <div className="rounded-lg border border-servi-green/20 bg-servi-green/5 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Wand2 size={14} className="text-servi-green" />
            <span className="text-xs font-medium text-servi-green">Sugerencia de IA</span>
          </div>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{previewText}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-md bg-servi-green px-3 py-1 text-xs font-medium text-white hover:bg-servi-green-dark transition-colors"
            >
              Usar sugerencia
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
