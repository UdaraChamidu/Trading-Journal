import React from 'react';
import { Users, TrendingUp, MessageSquare, Heart, Share2 } from 'lucide-react';

interface SocialPost {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
  };
  type: 'trade' | 'post';
  content: string;
  tradeDetails?: {
    symbol: string;
    direction: 'Long' | 'Short';
    roi: number;
  };
  likes: number;
  comments: number;
  timestamp: string;
}

const MOCK_POSTS: SocialPost[] = [
  {
    id: '1',
    user: {
      name: 'Alex Thompson',
      handle: '@crypto_alex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    type: 'trade',
    content: 'Just closed my BTC long position. Great reaction from the 4H support level! 🚀',
    tradeDetails: {
      symbol: 'BTC/USD',
      direction: 'Long',
      roi: 12.5,
    },
    likes: 45,
    comments: 12,
    timestamp: '2h ago',
  },
  {
    id: '2',
    user: {
      name: 'Sarah Chen',
      handle: '@sarah_trades',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    type: 'post',
    content: 'Market sentiment is shifting. Seeing a lot of accumulation on altcoins. Keep an eye on ETH and SOL this week.',
    likes: 89,
    comments: 24,
    timestamp: '4h ago',
  },
  {
    id: '3',
    user: {
      name: 'Mike Ross',
      handle: '@mike_r',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    type: 'trade',
    content: 'Short scalping opportunity on MATIC. Tight stop loss.',
    tradeDetails: {
      symbol: 'MATIC/USDT',
      direction: 'Short',
      roi: 5.2,
    },
    likes: 23,
    comments: 5,
    timestamp: '6h ago',
  },
];

export const SocialHubPage: React.FC = () => {


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-pink-500/25">
          <Users className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Social Hub</h1>
        </div>
        <p className="text-gray-400 text-lg">Connect with other traders and share your journey</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Feed */}
        <div className="flex-1 space-y-6">
          {/* Create Post Input */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">ME</span>
            </div>
            <input
              type="text"
              placeholder="Share your thoughts or latest trade..."
              className="flex-1 bg-slate-700 border-none rounded-lg px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Posts */}
          {MOCK_POSTS.map((post) => (
            <div key={post.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full bg-slate-700" />
                  <div>
                    <div className="font-bold text-white hover:text-pink-400 cursor-pointer transition-colors">
                      {post.user.name}
                    </div>
                    <div className="text-sm text-gray-400">{post.user.handle} • {post.timestamp}</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-200 mb-4 text-lg">{post.content}</p>

              {post.type === 'trade' && post.tradeDetails && (
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-white">{post.tradeDetails.symbol}</div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      post.tradeDetails.direction === 'Long' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                    }`}>
                      {post.tradeDetails.direction}
                    </div>
                    <div className="flex items-center gap-1 text-green-400 font-bold ml-auto">
                      <TrendingUp className="w-4 h-4" />
                      +{post.tradeDetails.roi}%
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 text-gray-400">
                <button className="flex items-center gap-2 hover:text-pink-400 transition-colors group">
                  <Heart className="w-5 h-5 group-hover:fill-pink-400" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-400 transition-colors ml-auto">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6">
          {/* Trending Topics */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              Trending
            </h3>
            <div className="space-y-4">
              {['#Bitcoin', '#SolanaSummer', '#TradingPsychology', '#Altseason'].map((tag) => (
                <div key={tag} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-gray-400 group-hover:text-pink-400 transition-colors">{tag}</span>
                  <span className="text-xs text-gray-600">2.4k posts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4">Who to follow</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">Trader {i}</div>
                    <div className="text-xs text-gray-400">@trader_{i}</div>
                  </div>
                  <button className="text-xs font-bold text-pink-400 hover:text-pink-300">Follow</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialHubPage;
