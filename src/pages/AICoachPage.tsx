import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, BrainCircuit, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getGeminiService } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { calculateWinRate, calculateProfitFactor } from '../lib/calculations';
import { Trade } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AICoachPage: React.FC = () => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Trading Coach powered by Gemini. I can analyze your trading performance, suggest improvements, or discuss market psychology. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradingContext, setTradingContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Gemini service and fetch trading context
  useEffect(() => {
    const initializeAI = async () => {
      try {
        geminiService.current = getGeminiService();
        
        // Fetch user's trading stats for context
        if (session) {
          const { data: trades } = await supabase
            .from('trades_new')
            .select('*')
            .eq('user_id', session.user.id);

          if (trades && trades.length > 0) {
            const completed = trades.filter((t: Trade) => t.pl_dollar !== null);
            const wins = completed.filter((t: Trade) => t.trade_result === 'Win').length;
            
            const totalWins = completed
              .filter((t: Trade) => t.trade_result === 'Win')
              .reduce((sum: number, t: Trade) => sum + (t.pl_dollar || 0), 0);
            const totalLosses = Math.abs(
              completed
                .filter((t: Trade) => t.trade_result === 'Loss')
                .reduce((sum: number, t: Trade) => sum + (t.pl_dollar || 0), 0)
            );

            setTradingContext({
              totalTrades: trades.length,
              winRate: calculateWinRate(wins, completed.length),
              profitFactor: calculateProfitFactor(totalWins, totalLosses),
            });
          }
        }
      } catch (err: any) {
        console.error('Error initializing AI:', err);
        setError(err.message || 'Failed to initialize AI. Please check your API key.');
      }
    };

    initializeAI();
  }, [session]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Send message to Gemini API
      const response = await geminiService.current.sendMessage(input, tradingContext);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Error getting AI response:', err);
      setError(err.message || 'Failed to get response. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please check your API key configuration and try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-red-400 font-bold mb-1">Connection Error</h3>
            <p className="text-red-200/80 text-sm">{error}</p>
          </div>
        </div>
      )}

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
