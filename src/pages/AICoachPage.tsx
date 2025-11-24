import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, BrainCircuit, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AICoachPage: React.FC = () => {
  const { } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Trading Coach. I can analyze your trading performance, suggest improvements, or discuss market psychology. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateMockResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('win rate') || q.includes('performance')) {
      return "Based on your recent trades, your win rate is currently 65%, which is excellent! However, I noticed your average loss is slightly higher than your average win. Focusing on cutting losses earlier could significantly boost your profitability.";
    }
    if (q.includes('risk') || q.includes('position')) {
      return "Risk management is key. I recommend sticking to a 1-2% risk per trade. Given your account balance, that means risking no more than $100-$200 per trade. Would you like me to calculate a position size for you?";
    }
    if (q.includes('psychology') || q.includes('emotion')) {
      return "Trading psychology is often the edge. If you're feeling anxious, try reducing your position size. Remember, the goal is to execute your plan flawlessly, not just to make money on every single trade.";
    }
    if (q.includes('bitcoin') || q.includes('btc')) {
      return "Bitcoin has been showing strong momentum recently. Remember to wait for confirmation on the 4H timeframe before entering. Don't FOMO into green candles!";
    }
    return "That's an interesting point. As your AI coach, I'd suggest reviewing your trading journal for similar setups in the past. History often rhymes in the markets. What specific pattern are you looking at?";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-purple-500/25">
          <BrainCircuit className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">AI Trade Coach</h1>
        </div>
        <p className="text-gray-400">Your personal assistant for market analysis and performance review</p>
      </div>

      <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}
              >
                {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
              </div>
              
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-700 text-gray-200 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-slate-700 rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <div className="relative flex items-center gap-2">
            <button className="p-3 text-gray-400 hover:text-purple-400 transition-colors" title="Analyze Portfolio">
              <TrendingUp className="w-6 h-6" />
            </button>
            <button className="p-3 text-gray-400 hover:text-purple-400 transition-colors" title="Generate Report">
              <Sparkles className="w-6 h-6" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything about your trades..."
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-full pl-6 pr-12 py-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            AI Coach can make mistakes. Always verify financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;
