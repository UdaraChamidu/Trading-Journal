import React, { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Award, TrendingUp, BarChart3, MessageSquare, Heart, Image, Settings, X, DollarSign, Target, Activity, Trophy, Wallet, PieChart, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserPost {
  id: string;
  content: string;
  images?: string[];
  type: 'post' | 'trade' | 'idea';
  tradeDetails?: {
    symbol: string;
    direction: 'Long' | 'Short';
    roi?: number;
  };
  likes: string[];
  comments: any[];
  created_at: string;
}

interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avg_buy_price: number;
  current_price?: number;
  total_value?: number;
  pnl?: number;
  pnl_percentage?: number;
}

interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  avgRiskReward: number;
}

interface RecentTrade {
  id: string;
  trade_date: string;
  direction: string;
  entry_price: number;
  exit_price?: number;
  pl_dollar?: number;
  pl_percent?: number;
  trade_result?: string;
  symbol?: string;
  risk_reward_ratio?: number;
}

export const PublicProfilePage: React.FC = () => {
  const { session } = useAuth();
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'portfolio' | 'trades' | 'performance'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: ''
  });
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData();
    }
  }, [session]);

  const fetchPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h'
      );
      const data = await response.json();
      const priceMap: Record<string, number> = {};
      data.forEach((crypto: any) => {
        priceMap[crypto.symbol.toUpperCase()] = crypto.current_price;
      });
      setPrices(priceMap);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch all data in parallel
      const [postsResult, holdingsResult, tradesResult, profileResult] = await Promise.allSettled([
        supabase.from('social_posts').select('*').eq('user_id', session?.user?.id).order('created_at', { ascending: false }),
        supabase.from('portfolio_holdings').select('*').eq('user_id', session?.user?.id).order('created_at', { ascending: false }),
        supabase.from('trades_new').select('*').eq('user_id', session?.user?.id).order('trade_date', { ascending: false }).limit(10),
        supabase.from('users_profile').select('*').eq('id', session?.user?.id).single()
      ]);

      // Handle posts
      if (postsResult.status === 'fulfilled' && postsResult.value.data) {
        setUserPosts(postsResult.value.data);
      }

      // Handle portfolio holdings
      if (holdingsResult.status === 'fulfilled' && holdingsResult.value.data) {
        setPortfolioHoldings(holdingsResult.value.data);
      }

      // Handle trades and calculate stats
      if (tradesResult.status === 'fulfilled' && tradesResult.value.data) {
        const trades = tradesResult.value.data;
        setRecentTrades(trades);

        // Calculate trading statistics
        const totalTrades = trades.length;
        const wins = trades.filter((t: any) => t.trade_result === 'Win').length;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const totalPnL = trades.reduce((sum: number, t: any) => sum + (t.pl_dollar || 0), 0);
        const winningTrades = trades.filter((t: any) => (t.pl_dollar || 0) > 0);
        const losingTrades = trades.filter((t: any) => (t.pl_dollar || 0) < 0);

        const grossProfit = winningTrades.reduce((sum: number, t: any) => sum + (t.pl_dollar || 0), 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum: number, t: any) => sum + (t.pl_dollar || 0), 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

        const bestTrade = Math.max(...trades.map((t: any) => t.pl_dollar || 0), 0);
        const worstTrade = Math.min(...trades.map((t: any) => t.pl_dollar || 0), 0);
        const avgRiskReward = trades.length > 0 ? trades.reduce((sum: number, t: any) => sum + (t.risk_reward_ratio || 0), 0) / trades.length : 0;

        setTradingStats({
          totalTrades,
          winRate,
          totalPnL,
          profitFactor,
          bestTrade,
          worstTrade,
          avgRiskReward
        });
      }

      // Handle user profile
      if (profileResult.status === 'fulfilled' && profileResult.value.data) {
        setUserProfile(profileResult.value.data);
      }

      // Fetch prices for portfolio calculations
      await fetchPrices();

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = userPosts.filter(post => {
    if (activeTab === 'posts') return post.type === 'post';
    return true;
  });

  // Enhanced holdings with real-time prices
  const enhancedHoldings = portfolioHoldings.map(holding => {
    const currentPrice = prices[holding.symbol] || holding.avg_buy_price;
    const totalValue = holding.amount * currentPrice;
    const pnl = (currentPrice - holding.avg_buy_price) * holding.amount;
    const pnlPercentage = holding.avg_buy_price > 0 ? ((currentPrice - holding.avg_buy_price) / holding.avg_buy_price) * 100 : 0;

    return {
      ...holding,
      current_price: currentPrice,
      total_value: totalValue,
      pnl,
      pnl_percentage: pnlPercentage
    };
  });

  // Calculate comprehensive stats
  const stats = {
    totalPosts: userPosts.length,
    totalTrades: userPosts.filter(p => p.type === 'trade').length,
    totalLikes: userPosts.reduce((sum, post) => sum + post.likes.length, 0),
    totalComments: userPosts.reduce((sum, post) => sum + post.comments.length, 0),
    portfolioValue: enhancedHoldings.reduce((sum, holding) => sum + (holding.total_value || 0), 0),
    totalHoldings: enhancedHoldings.length,
    bestHolding: enhancedHoldings.reduce((best, holding) =>
      (holding.pnl || 0) > (best.pnl || 0) ? holding : best,
      enhancedHoldings[0] || { pnl: 0 }
    )
  };

  const handleEditProfile = () => {
    setEditForm({
      full_name: session?.user?.user_metadata?.full_name || '',
      bio: session?.user?.user_metadata?.bio || '',
      location: session?.user?.user_metadata?.location || ''
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: editForm.full_name,
          bio: editForm.bio,
          location: editForm.location
        }
      });

      if (error) throw error;

      setShowEditModal(false);
      // Profile will update automatically when component re-renders
      window.location.reload(); // Simple refresh to update profile data
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const profile = {
    name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous',
    handle: `@${session?.user?.email?.split('@')[0] || 'user'}`,
    bio: session?.user?.user_metadata?.bio || 'Crypto enthusiast sharing trading insights and market analysis.',
    avatar: session?.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id}`,
    location: session?.user?.user_metadata?.location || 'Earth',
    joined: session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    stats: {
      winRate: 68, // This would come from trading data
      totalTrades: stats.totalTrades,
      profitFactor: 2.4, // This would come from trading data
    },
    badges: ['Active Trader', 'Community Member', 'Content Creator'],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full bg-slate-900 p-1">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id}`;
                }}
              />
            </div>
            <button
              onClick={handleEditProfile}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
            <p className="text-gray-400 text-lg mb-4">{profile.handle}</p>
            <p className="text-gray-300 max-w-2xl mb-6">{profile.bio}</p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {profile.joined}
              </div>
            </div>

            <div className="flex gap-2">
              {profile.badges.map((badge) => (
                <span key={badge} className="px-3 py-1 rounded-full bg-slate-700 text-blue-300 text-xs font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-gray-400 text-sm mb-2">Portfolio Value</div>
          <div className="text-2xl font-bold text-green-400">${stats.portfolioValue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.totalHoldings} holdings</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-gray-400 text-sm mb-2">Trading Win Rate</div>
          <div className="text-2xl font-bold text-blue-400">{tradingStats?.winRate.toFixed(1) || 0}%</div>
          <div className="text-xs text-gray-500 mt-1">{tradingStats?.totalTrades || 0} trades</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-gray-400 text-sm mb-2">Total P&L</div>
          <div className={`text-2xl font-bold ${(tradingStats?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${(tradingStats?.totalPnL || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Profit Factor: {tradingStats?.profitFactor.toFixed(2) || 0}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-gray-400 text-sm mb-2">Social Activity</div>
          <div className="text-2xl font-bold text-purple-400">{stats.totalPosts}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.totalLikes} likes • {stats.totalComments} comments</div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-pink-400" />
            My Posts
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-slate-700/50 p-1 rounded-lg overflow-x-auto">
          {[
            { id: 'posts', label: 'Posts', count: userPosts.filter(p => p.type === 'post').length, icon: MessageSquare },
            { id: 'portfolio', label: 'Portfolio', count: stats.totalHoldings, icon: Wallet },
            { id: 'trades', label: 'Recent Trades', count: recentTrades.length, icon: TrendingUp },
            { id: 'performance', label: 'Performance', count: tradingStats?.totalTrades || 0, icon: BarChart3 }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && <span className="text-xs">({tab.count})</span>}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Based on Active Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts yet</h3>
                <p className="text-gray-400">Share your thoughts in the Social Hub!</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-bold text-white text-sm">{profile.name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()} • {post.type}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      post.type === 'trade' ? 'bg-green-900 text-green-100' :
                      post.type === 'idea' ? 'bg-purple-900 text-purple-100' :
                      'bg-blue-900 text-blue-100'
                    }`}>
                      {post.type}
                    </div>
                  </div>

                  <p className="text-gray-200 mb-3 text-sm">{post.content}</p>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {post.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="rounded-lg object-cover h-24 w-full"
                        />
                      ))}
                    </div>
                  )}

                  {/* Trade Details */}
                  {post.type === 'trade' && post.tradeDetails && (
                    <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-slate-600/30">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-white text-sm">{post.tradeDetails.symbol}</div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          post.tradeDetails.direction === 'Long' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                        }`}>
                          {post.tradeDetails.direction}
                        </div>
                        {post.tradeDetails.roi && (
                          <div className="flex items-center gap-1 text-green-400 font-bold text-sm ml-auto">
                            <TrendingUp className="w-3 h-3" />
                            +{post.tradeDetails.roi}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.comments.length}</span>
                    </div>
                    {post.images && post.images.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        <span>{post.images.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            {enhancedHoldings.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No portfolio holdings</h3>
                <p className="text-gray-400">Add some crypto to your portfolio!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-900 to-green-800 border border-green-700 rounded-lg p-4">
                    <div className="text-green-200 text-sm">Total Portfolio Value</div>
                    <div className="text-2xl font-bold text-white">${stats.portfolioValue.toLocaleString()}</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-4">
                    <div className="text-blue-200 text-sm">Total Holdings</div>
                    <div className="text-2xl font-bold text-white">{stats.totalHoldings}</div>
                  </div>
                </div>

                {enhancedHoldings.map((holding) => (
                  <div key={holding.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{holding.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-bold text-white">{holding.symbol}</div>
                          <div className="text-sm text-gray-400">{holding.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono">{holding.amount.toFixed(8)}</div>
                        <div className="text-sm text-gray-400">Amount</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Avg Buy Price</div>
                        <div className="text-white font-mono">${holding.avg_buy_price.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Current Price</div>
                        <div className="text-white font-mono">${holding.current_price?.toFixed(2) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">P&L</div>
                        <div className={`font-mono ${(holding.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${(holding.pnl || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-4">
            {recentTrades.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No recent trades</h3>
                <p className="text-gray-400">Your trading history will appear here!</p>
              </div>
            ) : (
              recentTrades.map((trade) => (
                <div key={trade.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        trade.direction === 'Long' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{trade.symbol || 'N/A'}</div>
                        <div className="text-sm text-gray-400">{trade.direction} • {new Date(trade.trade_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      trade.trade_result === 'Win' ? 'bg-green-900 text-green-100' :
                      trade.trade_result === 'Loss' ? 'bg-red-900 text-red-100' :
                      'bg-gray-900 text-gray-100'
                    }`}>
                      {trade.trade_result || 'Pending'}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Entry</div>
                      <div className="text-white font-mono">${trade.entry_price?.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Exit</div>
                      <div className="text-white font-mono">${trade.exit_price?.toFixed(2) || 'Open'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">P&L</div>
                      <div className={`font-mono ${(trade.pl_dollar || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.pl_dollar?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Risk/Reward</div>
                      <div className="text-white font-mono">{trade.risk_reward_ratio?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {tradingStats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm mb-2">Win Rate</div>
                    <div className="text-2xl font-bold text-green-400">{tradingStats.winRate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm mb-2">Profit Factor</div>
                    <div className="text-2xl font-bold text-blue-400">{tradingStats.profitFactor.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm mb-2">Best Trade</div>
                    <div className="text-2xl font-bold text-green-400">${tradingStats.bestTrade.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm mb-2">Worst Trade</div>
                    <div className="text-2xl font-bold text-red-400">${tradingStats.worstTrade.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tradingStats.winRate >= 70 && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        <div>
                          <div className="text-yellow-400 font-bold">Elite Trader</div>
                          <div className="text-sm text-gray-400">Win rate above 70%</div>
                        </div>
                      </div>
                    )}
                    {tradingStats.profitFactor >= 2 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                        <Target className="w-8 h-8 text-blue-400" />
                        <div>
                          <div className="text-blue-400 font-bold">Profit Master</div>
                          <div className="text-sm text-gray-400">Profit factor above 2.0</div>
                        </div>
                      </div>
                    )}
                    {tradingStats.totalTrades >= 50 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                        <Activity className="w-8 h-8 text-purple-400" />
                        <div>
                          <div className="text-purple-400 font-bold">Experienced Trader</div>
                          <div className="text-sm text-gray-400">50+ trades completed</div>
                        </div>
                      </div>
                    )}
                    {(tradingStats.totalPnL || 0) >= 10000 && (
                      <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                        <DollarSign className="w-8 h-8 text-green-400" />
                        <div>
                          <div className="text-green-400 font-bold">High Earner</div>
                          <div className="text-sm text-gray-400">$10,000+ in profits</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No trading data yet</h3>
                <p className="text-gray-400">Start trading to see your performance metrics!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="Your location"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
