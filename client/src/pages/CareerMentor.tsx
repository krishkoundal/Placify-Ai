import React, { useState, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Terminal, HelpCircle } from 'lucide-react';
import api from '../services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CareerMentor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'Teach me Docker containerization',
    'How do I improve my ATS score?',
    'Google software engineer preparation plan',
    'Explain REST vs GraphQL design'
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/mentor/history');
        if (res.data.length > 0) {
          // Convert array format from express mapping to local hooks format
          const formatted = res.data.map((m: any) => ({
            role: m.role,
            content: m.content
          }));
          setMessages(formatted);
        } else {
          // Initial greeting message
          setMessages([
            {
              role: 'assistant',
              content: '### Welcome, Developer! 👋\n\nI am your **AI Digital Career Mentor**. I have reviewed your GitHub commits, LeetCode ratings, and ATS resume parameters.\n\nAsk me anything! For example, try clicking one of the suggested prompts below to start learning.'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching mentor chat history:', err);
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setLoading(true);
    setInput('');
    
    // Add user message to state
    const updatedMsgs = [...messages, { role: 'user', content: textToSend } as ChatMessage];
    setMessages(updatedMsgs);

    try {
      const res = await api.post('/mentor/chat', { message: textToSend });
      setMessages([...updatedMsgs, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error('Error sending message to mentor:', err);
      setMessages([...updatedMsgs, { role: 'assistant', content: 'Connection timed out. Please verify backend server is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
          <Sparkles className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />
          <span>AI Career Mentor</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Ask coding questions, review resume points, or outline system designs instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Suggestions panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-6">
          <div className="flex items-center space-x-2 text-indigo-400">
            <HelpCircle className="w-4.5 h-4.5" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Suggested Prompts</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-left p-3 bg-slate-950 hover:bg-indigo-950/20 border border-slate-850 hover:border-indigo-500/20 rounded-xl text-[11px] text-slate-300 leading-relaxed font-semibold transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Chat Container */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[70vh]">
          {/* Messages pane */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white font-semibold shadow-md' 
                      : 'bg-slate-950 text-slate-200 border border-slate-850'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center space-x-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Form input fields */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} 
            className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-805"
          >
            <input 
              type="text" 
              placeholder="Ask anything (e.g. explain Event Loop in JS)" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-200 px-3 outline-none"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CareerMentor;
