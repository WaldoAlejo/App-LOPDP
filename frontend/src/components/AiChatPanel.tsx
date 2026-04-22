import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useAiChat } from '../hooks/useAiAssistant';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatPanelProps {
  context?: Record<string, any>;
}

export function AiChatPanel({ context }: AiChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA especializado en protección de datos y la LOPDP del Ecuador. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chat = useAiChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || chat.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const result = await chat.mutateAsync({
      message: userMessage.content,
      context,
    });

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-servi-green text-white shadow-lg shadow-servi-green/30 transition-all hover:scale-110 hover:shadow-xl"
          title="Asistente de IA"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-servi-green px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-white" />
              <div>
                <h3 className="text-sm font-semibold text-white">Asistente IA</h3>
                <p className="text-xs text-white/80">Especialista en LOPDP</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user'
                      ? 'bg-servi-green/10'
                      : 'bg-gray-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User size={14} className="text-servi-green" />
                  ) : (
                    <Bot size={14} className="text-gray-500" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-servi-green text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <span
                    className={`mt-1 block text-[10px] ${
                      msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('es-EC', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {chat.isPending && (
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Bot size={14} className="text-gray-500" />
                </div>
                <div className="rounded-2xl bg-gray-100 px-3 py-2">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta sobre protección de datos..."
                className="min-h-[40px] max-h-[100px] flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-servi-green focus:outline-none focus:ring-1 focus:ring-servi-green/20"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chat.isPending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-servi-green text-white transition-colors hover:bg-servi-green-dark disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-1 text-[10px] text-gray-400 text-center">
              El asistente puede cometer errores. Verifique la información importante.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
