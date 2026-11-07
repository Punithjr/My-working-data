import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Copy, 
  Check, 
  HelpCircle, 
  Scale, 
  FileText, 
  Award,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface KcsrRtiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { displayName?: string; designation?: string; role?: string } | null;
}

export const KcsrRtiChatbot: React.FC<KcsrRtiChatbotProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `ನಮಸ್ಕಾರ ${currentUser?.displayName ? currentUser.displayName : 'ಮಾನ್ಯರೇ'}, ನಾನು ಕರ್ನಾಟಕ ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ (ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ) **KCSR & RTI AI ಸಹಾಯಕ** (ಚಾಲನೆ: Gemini 3.8 Flash).\n\nನಾನು ನಿಮಗೆ ಈ ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ಅಧಿಕೃತ ನಿಯಮಾವಳಿಗಳೊಂದಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ:\n- **ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 (RTI Act 2005)**: ಕಲಂ 6(1) ಅರ್ಜಿ, ಕಲಂ 6(3) ವರ್ಗಾವಣೆ (5 ದಿನಗಳು), ಕಲಂ 7(1) 30-ದಿನಗಳ ವಿಲೇವಾರಿ ಗಡುವು, ಕಲಂ 8/9 ವಿನಾಯಿತಿಗಳು, ಕಲಂ 19(1) ಪ್ರಥಮ ಮೇಲ್ಮನವಿ (BEO).\n- **KCSR ಪಿಂಚಣಿ ನಿಯಮಾವಳಿಗಳು**: ನಿಯಮ 287 (ಮಾಸಿಕ ಪಿಂಚಣಿ), ನಿಯಮ 292B (ನಿವೃತ್ತಿ ಉಪದಾನ DCRG), Appendix-I (ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ CVP), ನಿಯಮ 118A (ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ).\n- **ವೇತನ ಬಡ್ತಿ & ಸೇವಾ ವಿಷಯಗಳು**: ಪ್ರಪತ್ರ-28 (10, 15, 20, 25, 30 ವರ್ಷಗಳ ಬಡ್ತಿ), ಶಿಶುಪಾಲನ ರಜೆ (CCL 180 ದಿನಗಳು), ಶಿಸ್ತು ಕ್ರಮ ನಿಯಮಗಳು.\n\nನಿಮ್ಮ ಪ್ರಶ್ನೆ ಅಥವಾ ಕಡತದ ಸಂದೇಹವನ್ನು ಕೆಳಗೆ ನಮೂದಿಸಿ:`,
      timestamp: new Date().toLocaleTimeString('kn-IN', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('kn-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build multi-turn history payload for server
      const payloadMessages = newHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botReply: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply || 'ಕ್ಷಮಿಸಿ, ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.',
        timestamp: new Date().toLocaleTimeString('kn-IN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chatbot send error:', err);
      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `ತಾತ್ಕಾಲಿಕ ನೆಟ್‌ವರ್ಕ್ ಸಮಸ್ಯೆ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಶ್ನೆ ಕೇಳಿ.\n(ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಗಳಿಗೆ ಕಲಂ 7(1) ರಂತೆ 30 ದಿನಗಳ ಗಡುವು ಅನ್ವಯಿಸುತ್ತದೆ ಮತ್ತು ಪಿಂಚಣಿ ಲೆಕ್ಕಾಚಾರಕ್ಕೆ KCSR 287 ಅನ್ವಯಿಸುತ್ತದೆ).`,
        timestamp: new Date().toLocaleTimeString('kn-IN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'offline-fallback'
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset-msg',
        role: 'model',
        content: 'ಸಂಭಾಷಣೆಯನ್ನು ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ಹೊಸ ಪ್ರಶ್ನೆ ಅಥವಾ ನಿಯಮವನ್ನು ಕೇಳಿ.',
        timestamp: new Date().toLocaleTimeString('kn-IN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-[520px] h-[650px] max-h-[90vh] bg-stone-900 border-2 border-stone-800 rounded-2xl shadow-[8px_8px_0px_#2b2b2b] flex flex-col overflow-hidden text-white font-kannada transition-all animate-in fade-in slide-in-from-bottom-5">
      {/* Header Bar */}
      <div className="bg-stone-950 p-3.5 border-b-2 border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold border border-amber-300 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-amber-300">KCSR & RTI AI ಸಹಾಯಕ</h3>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono-code font-bold">
                Gemini Multi-Turn
              </span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
              <span>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ ಭದ್ರಾವತಿ</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono-code text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="text-[10px] font-mono-code bg-stone-800 border border-stone-700 text-amber-300 rounded px-1.5 py-1 focus:outline-none cursor-pointer"
            title="Gemini ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (ಸಾಮಾನ್ಯ / General)</option>
            <option value="gemini-3.5-flash">gemini-3.5-flash</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (ವೇಗದ ಪ್ರತಿಕ್ರಿಯೆ)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (ಸಂಕೀರ್ಣ ಕಾರ್ಯಗಳು)</option>
          </select>

          <button
            onClick={handleClearHistory}
            className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded transition-all cursor-pointer"
            title="ಸಂಭಾಷಣೆ ಮರುಹೊಂದಿಸಿ (Clear History)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded transition-all cursor-pointer"
            title="ಮುಚ್ಚಿ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="bg-stone-950/80 px-3 py-2 border-b border-stone-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none text-xs">
        <span className="text-[11px] text-stone-400 whitespace-nowrap mr-1">ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು:</span>
        {[
          { label: '⚖️ RTI ಕಲಂ 6(3) ವರ್ಗಾವಣೆ', text: 'ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮದ ಕಲಂ 6(3) ರನ್ವಯ ಅರ್ಜಿಯನ್ನು ಮತ್ತೊಂದು ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ವರ್ಗಾಯಿಸುವ ನಿಯಮವೇನು?' },
          { label: '⏱️ RTI 30 ದಿನಗಳ ಗಡುವು', text: 'ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಗೆ ಮಾಹಿತಿ ಒದಗಿಸಲು ಗರಿಷ್ಠ ಕಾಲಮಿತಿ ಎಷ್ಟು ಮತ್ತು ಗಡುವು ಮೀರಿದರೆ ಏನು ಪರಿಣಾಮ?' },
          { label: '💰 KCSR ಪಿಂಚಣಿ ಸೂತ್ರ', text: 'KCSR ನಿಯಮ 287(2) ರನ್ವಯ ಮಾಸಿಕ ಪಿಂಚಣಿ ಹಾಗೂ ನಿಯಮ 292B ರನ್ವಯ ನಿವೃತ್ತಿ ಉಪದಾನದ ಸೂತ್ರವೇನು?' },
          { label: '🌴 ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ', text: 'KCSR ನಿಯಮ 118A ರಂತೆ ನಿವೃತ್ತಿ ವೇಳೆ ಗರಿಷ್ಠ ಎಷ್ಟು ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣಕ್ಕೆ ಅವಕಾಶವಿದೆ?' }
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 border border-stone-700 hover:border-amber-400 rounded-full text-[11px] font-medium text-stone-300 transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-stone-900/90 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-stone-800 text-amber-300 border border-stone-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-3 border space-y-1 relative group ${
                  isUser
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-50 rounded-tr-none'
                    : 'bg-stone-800/90 border-stone-700 text-stone-100 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-stone-400 border-b border-stone-700/60 pb-1 mb-1">
                  <span className="font-bold">
                    {isUser ? (currentUser?.displayName || 'ನೀವು (You)') : 'KCSR & RTI AI ಸಹಾಯಕ'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono-code">
                    {m.modelUsed && !isUser && (
                      <span className="text-[9px] bg-stone-700 px-1 rounded text-stone-300">
                        {m.modelUsed}
                      </span>
                    )}
                    <span>{m.timestamp}</span>
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity cursor-pointer p-0.5"
                      title="ಪಠ್ಯ ನಕಲಿಸಿ"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-[12px] font-kannada">
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-stone-800 text-amber-300 border border-stone-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-stone-800/90 border border-stone-700 rounded-xl p-3 text-xs text-stone-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Gemini 3.8 Flash ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಉತ್ತರಿಸುತ್ತಿದೆ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-3 bg-stone-950 border-t-2 border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="KCSR ಅಥವಾ RTI ಕುರಿತು ಪ್ರಶ್ನೆ ಕೇಳಿ (Enter ಒತ್ತಿ ಕಳುಹಿಸಿ)..."
            rows={2}
            className="flex-1 bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 resize-none font-kannada"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-3 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 text-stone-950 disabled:text-stone-600 rounded-xl font-bold transition-all border border-amber-300 disabled:border-stone-700 cursor-pointer disabled:cursor-not-allowed shadow-md"
            title="ಕಳುಹಿಸಿ (Send)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="text-[10px] text-stone-500 mt-1.5 flex items-center justify-between font-mono-code px-1">
          <span>ಶಾಲಾ ಶಿಕ್ಷಣ & ಸಾಕ್ಷರತಾ ಇಲಾಖೆ, ಭದ್ರಾವತಿ</span>
          <span>Shift+Enter ಹೊಸ ಸಾಲಿಗೆ</span>
        </div>
      </div>
    </div>
  );
};
