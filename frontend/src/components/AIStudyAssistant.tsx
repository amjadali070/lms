import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  courseContext?: string;
}

const AIStudyAssistant = ({ courseContext }: Props) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! 👋 I'm your AI Study Assistant. Ask me anything about this course material and I'll help you understand it better!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', {
        question: userMsg.content,
        courseContext: courseContext || ''
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Please check if the AI service is configured and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 group"
          title="AI Study Assistant"
        >
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-8 right-8 z-50 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">AI Study Assistant</h3>
                <p className="text-purple-200 text-xs">Powered by GPT-4o</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-purple-600" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-md shadow-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-purple-600" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the course material..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm disabled:opacity-50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIStudyAssistant;
