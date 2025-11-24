import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// System prompt for the AI Trading Coach
const SYSTEM_PROMPT = `You are an expert crypto trading coach and analyst. Your role is to:

1. Provide insightful analysis on trading strategies and market conditions
2. Help traders improve their risk management and psychology
3. Analyze trading performance and suggest improvements
4. Discuss market trends, technical analysis, and trading setups
5. Offer guidance on position sizing, entry/exit strategies, and trade management

Keep your responses:
- Concise and actionable (2-4 sentences typically)
- Professional yet friendly
- Focused on education and improvement
- Grounded in sound trading principles
- Honest about market uncertainties

Never:
- Guarantee profits or specific outcomes
- Provide financial advice (always remind users to do their own research)
- Encourage excessive risk-taking
- Make definitive predictions about price movements

If asked about specific trades or setups, provide educational analysis rather than direct recommendations.`;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export class GeminiService {
  private model;
  private chat;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    if (!genAI) {
      throw new Error('Gemini API is not initialized. Please check your API key.');
    }

    // Initialize the model with configuration
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Start a chat session
    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are a crypto trading coach. Please follow the guidelines provided.' }],
        },
        {
          role: 'model',
          parts: [{ text: SYSTEM_PROMPT }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });
  }

  /**
   * Send a message to the AI and get a response
   */
  async sendMessage(message: string, tradingContext?: any): Promise<string> {
    try {
      // Add trading context if available
      let enhancedMessage = message;
      if (tradingContext) {
        enhancedMessage = `User's Trading Context:
- Win Rate: ${tradingContext.winRate || 'N/A'}%
- Total Trades: ${tradingContext.totalTrades || 'N/A'}
- Profit Factor: ${tradingContext.profitFactor || 'N/A'}

User's Question: ${message}`;
      }

      const result = await this.chat.sendMessage(enhancedMessage);
      const response = await result.response;
      const text = response.text();

      // Store in conversation history
      this.conversationHistory.push(
        { role: 'user', parts: message },
        { role: 'model', parts: text }
      );

      return text;
    } catch (error: any) {
      console.error('Error sending message to Gemini:', error);
      
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API key configuration.');
      }
      
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }

  /**
   * Get the conversation history
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear the conversation history and start fresh
   */
  resetConversation(): void {
    this.conversationHistory = [];
    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are a crypto trading coach. Please follow the guidelines provided.' }],
        },
        {
          role: 'model',
          parts: [{ text: SYSTEM_PROMPT }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });
  }
}

// Export a singleton instance
let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
};
