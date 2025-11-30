import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateWinRate, calculateProfitFactor } from '../lib/calculations';
import { StatCard } from '../components/StatCard';
import { TrendingUp, TrendingDown, Award, BarChart3, Target, Zap, Calendar, ChevronDown, ChevronUp, Wallet, DollarSign, Coins, Activity, PieChart, Users, MessageSquare, Newspaper, Bell, Settings, BookOpen, Calculator, BrainCircuit, ExternalLink, Star, Heart, Share2, Image, Clock, CheckCircle, AlertCircle, Info, Globe, Shield, Rocket, TrendingUp as TrendingUpIcon, User, Mail, Github } from 'lucide-react';

interface DashboardStats {
  totalTrades: number;
  winRate: number;
  wins: number;
  losses: number;
  totalPL: number;
  totalPLPercent: number;
  avgRR: number;
  profitFactor: number;
  bestStreak: number;
  currentStreak: { count: number; type: 'W' | 'L' };
  largestWin: number;
  largestLoss: number;
}

interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercentage: number;
  topHolding: { symbol: string; value: number } | null;
  holdingsCount: number;
}

interface AppStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalAlerts: number;
  newsArticles: number;
  goalsCount: number;
  reviewsCount: number;
  notesCount: number;
}

interface RecentActivity {
  id: string;
  type: 'trade' | 'post' | 'alert' | 'goal' | 'review' | 'note';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

interface FeatureHighlight {
  title: string;
  description: string;
  icon: any;
  color: string;
  link: string;
  isNew?: boolean;
}

export const DashboardPage: React.FC = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTrades: 0,
    winRate: 0,
    wins: 0,
    losses: 0,
    totalPL: 0,
    totalPLPercent: 0,
    avgRR: 0,
    profitFactor: 0,
    bestStreak: 0,
    currentStreak: { count: 0, type: 'W' },
    largestWin: 0,
    largestLoss: 0,
  });

  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    topHolding: null,
    holdingsCount: 0,
  });

  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [appStats, setAppStats] = useState<AppStats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalAlerts: 0,
    newsArticles: 0,
    goalsCount: 0,
    reviewsCount: 0,
    notesCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [featureHighlights, setFeatureHighlights] = useState<FeatureHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    activity: true,
    features: true,
    stats: true,
    system: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchTradingStats(),
        fetchPortfolioStats(),
        fetchAppStats(),
        fetchRecentActivities(),
        fetchCryptoPrices()
      ]);

      // Set up feature highlights
      setFeatureHighlights([
        {
          title: "AI Trading Coach",
          description: "Get personalized trading advice powered by advanced AI analysis",
          icon: BrainCircuit,
          color: "from-purple-600 to-pink-600",
          link: "/ai-coach",
          isNew: true
        },
        {
          title: "Real-time Portfolio P&L",
          description: "Track your portfolio performance with live cryptocurrency prices",
          icon: TrendingUpIcon,
          color: "from-green-600 to-blue-600",
          link: "/portfolio"
        },
        {
          title: "Advanced News Filtering",
          description: "Stay informed with categorized crypto news by time, importance, and topic",
          icon: Newspaper,
          color: "from-cyan-600 to-blue-600",
          link: "/crypto-news"
        },
        {
          title: "Social Trading Community",
          description: "Connect with other traders, share strategies, and learn together",
          icon: Users,
          color: "from-orange-600 to-red-600",
          link: "/social-hub"
        },
        {
          title: "Economic Calendar",
          description: "Never miss important economic events that impact crypto markets",
          icon: Calendar,
          color: "from-indigo-600 to-purple-600",
          link: "/economic-calendar"
        },
        {
          title: "Price Alerts System",
          description: "Set custom alerts for price movements and market opportunities",
          icon: Bell,
          color: "from-yellow-600 to-orange-600",
          link: "/price-alerts"
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTradingStats = async () => {
    try {
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('trade_date', { ascending: false });

      if (!trades) return;

      const completedTrades = trades.filter((t: any) => t.pl_dollar !== null);
      const wins = completedTrades.filter((t: any) => t.trade_result === 'Win').length;
      const losses = completedTrades.filter((t: any) => t.trade_result === 'Loss').length;

      const totalPL = completedTrades.reduce((sum: number, t: any) => sum + (t.pl_dollar || 0), 0);
      const totalPLPercent = completedTrades.reduce((sum: number, t: any) => sum + (t.pl_percent || 0), 0);
      const avgRR =
        completedTrades.length > 0
          ? completedTrades.reduce((sum: number, t: any) => sum + (t.risk_reward_ratio || 0), 0) / completedTrades.length
          : 0;

      const totalWins = completedTrades
        .filter((t: any) => t.trade_result === 'Win')
        .reduce((sum: number, t: any) => sum + (t.pl_dollar || 0), 0);
      const totalLosses = Math.abs(
        completedTrades
          .filter((t: any) => t.trade_result === 'Loss')
          .reduce((sum: number, t: any) => sum + (t.pl_dollar || 0), 0)
      );

      const largestWin = Math.max(...completedTrades.map((t: any) => t.pl_dollar || 0), 0);
      const largestLoss = Math.min(...completedTrades.map((t: any) => t.pl_dollar || 0), 0);

      let bestStreak = 0;
      let currentWins = 0;
      let currentLosses = 0;

      for (let i = completedTrades.length - 1; i >= 0; i--) {
        const result = completedTrades[i].trade_result;
        if (result === 'Win') {
          currentWins++;
          currentLosses = 0;
          bestStreak = Math.max(bestStreak, currentWins);
        } else if (result === 'Loss') {
          currentLosses++;
          currentWins = 0;
          bestStreak = Math.max(bestStreak, currentLosses);
        }
      }

      const currentStreakType =
        completedTrades.length > 0
          ? completedTrades[0].trade_result === 'Win'
            ? 'W'
            : 'L'
          : ('W' as const);
      let currentStreakCount = 0;
      for (const trade of completedTrades) {
        if (
          (currentStreakType === 'W' && trade.trade_result === 'Win') ||
          (currentStreakType === 'L' && trade.trade_result === 'Loss')
        ) {
          currentStreakCount++;
        } else {
          break;
        }
      }

      setStats({
        totalTrades: trades.length,
        winRate: calculateWinRate(wins, completedTrades.length),
        wins,
        losses,
        totalPL,
        totalPLPercent,
        avgRR: parseFloat(avgRR.toFixed(3)),
        profitFactor: calculateProfitFactor(totalWins, totalLosses),
        bestStreak,
        currentStreak: { count: currentStreakCount, type: currentStreakType },
        largestWin,
        largestLoss,
      });
    } catch (error) {
      console.error('Error fetching trading stats:', error);
    }
  };

  const fetchPortfolioStats = async () => {
    try {
      const { data: holdings } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', session?.user?.id);

      if (!holdings || holdings.length === 0) return;

      const totalInvested = holdings.reduce((sum: number, holding: any) => {
        return sum + (holding.amount * holding.avg_buy_price);
      }, 0);

      // Fetch current prices for portfolio calculation
      setPriceLoading(true);
      try {
        const symbols = holdings.map((h: any) => h.symbol.toLowerCase());
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbols.join(',')}&vs_currencies=usd`
        );
        const prices = await response.json();
        
        const pricesMap: Record<string, number> = {};
        Object.entries(prices).forEach(([symbol, priceData]: [string, any]) => {
          pricesMap[symbol] = priceData.usd;
        });
        setCryptoPrices(pricesMap);

        const totalValue = holdings.reduce((sum: number, holding: any) => {
          const currentPrice = pricesMap[holding.symbol.toLowerCase()] || holding.avg_buy_price;
          return sum + (holding.amount * currentPrice);
        }, 0);

        const totalPnL = totalValue - totalInvested;
        const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

        // Find top holding
        let topHolding = null;
        let maxValue = 0;
        holdings.forEach((holding: any) => {
          const currentPrice = pricesMap[holding.symbol.toLowerCase()] || holding.avg_buy_price;
          const value = holding.amount * currentPrice;
          if (value > maxValue) {
            maxValue = value;
            topHolding = { symbol: holding.symbol, value };
          }
        });

        setPortfolioStats({
          totalValue,
          totalInvested,
          totalPnL,
          totalPnLPercentage,
          topHolding,
          holdingsCount: holdings.length,
        });
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      } finally {
        setPriceLoading(false);
      }
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
    }
  };

  const fetchAppStats = async () => {
    try {
      const [postsResult, alertsResult, goalsResult, reviewsResult, notesResult] = await Promise.allSettled([
        supabase.from('social_posts').select('likes, comments').eq('user_id', session?.user?.id),
        supabase.from('price_alerts').select('id').eq('user_id', session?.user?.id),
        supabase.from('goals').select('id').eq('user_id', session?.user?.id),
        supabase.from('weekly_reviews').select('id').eq('user_id', session?.user?.id),
        supabase.from('general_notes').select('id').eq('user_id', session?.user?.id)
      ]);

      let totalPosts = 0, totalLikes = 0, totalComments = 0;

      if (postsResult.status === 'fulfilled' && postsResult.value.data) {
        totalPosts = postsResult.value.data.length;
        totalLikes = postsResult.value.data.reduce((sum: number, post: any) => sum + (post.likes?.length || 0), 0);
        totalComments = postsResult.value.data.reduce((sum: number, post: any) => sum + (post.comments?.length || 0), 0);
      }

      const totalAlerts = alertsResult.status === 'fulfilled' && alertsResult.value.data ? alertsResult.value.data.length : 0;
      const goalsCount = goalsResult.status === 'fulfilled' && goalsResult.value.data ? goalsResult.value.data.length : 0;
      const reviewsCount = reviewsResult.status === 'fulfilled' && reviewsResult.value.data ? reviewsResult.value.data.length : 0;
      const notesCount = notesResult.status === 'fulfilled' && notesResult.value.data ? notesResult.value.data.length : 0;

      setAppStats({
        totalPosts,
        totalLikes,
        totalComments,
        totalAlerts,
        newsArticles: 12, // Mock data for now
        goalsCount,
        reviewsCount,
        notesCount,
      });
    } catch (error) {
      console.error('Error fetching app stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Get recent trades
      const { data: recentTrades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentTrades) {
        recentTrades.forEach((trade: any) => {
          activities.push({
            id: `trade-${trade.id}`,
            type: 'trade',
            title: `${trade.direction} ${trade.symbol || 'Trade'}`,
            description: `${trade.trade_result || 'Pending'} • ${formatCurrency(trade.pl_dollar || 0)} P&L`,
            timestamp: trade.created_at,
            icon: TrendingUp,
            color: trade.trade_result === 'Win' ? 'text-green-400' : trade.trade_result === 'Loss' ? 'text-red-400' : 'text-gray-400'
          });
        });
      }

      // Get recent posts
      const { data: recentPosts } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentPosts) {
        recentPosts.forEach((post: any) => {
          activities.push({
            id: `post-${post.id}`,
            type: 'post',
            title: `Posted: ${post.type}`,
            description: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
            timestamp: post.created_at,
            icon: MessageSquare,
            color: 'text-blue-400'
          });
        });
      }

      // Sort by timestamp and take top 8
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 8));

    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
      );
      const data = await response.json();
      // You can use this data for showing top cryptocurrencies
    } catch (error) {
      console.error('Error fetching top crypto data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-4 rounded-full mb-6 shadow-2xl shadow-blue-500/25">
          <Rocket className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-4xl font-bold text-white">🚀 Crypto Trading Hub Dashboard</h1>
            <p className="text-blue-100 text-lg">Your Complete Crypto Trading & Investment Command Center</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Real-time Updates</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Global Market Data</span>
          </div>
        </div>
      </div>

      {/* App Overview */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-400" />
            App Overview
          </h2>
          <button
            onClick={() => toggleSection('overview')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.overview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-blue-200 font-bold text-lg">Trading</div>
                  <div className="text-blue-300 text-sm">Journal & Analytics</div>
                </div>
              </div>
              <p className="text-blue-100 text-sm">Complete trade logging with 4H analysis, M15 confirmation, and M1 entry strategies</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-green-200 font-bold text-lg">Portfolio</div>
                  <div className="text-green-300 text-sm">Live Tracking</div>
                </div>
              </div>
              <p className="text-green-100 text-sm">Real-time portfolio valuation with P&L calculations and performance metrics</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-purple-200 font-bold text-lg">Social</div>
                  <div className="text-purple-300 text-sm">Community</div>
                </div>
              </div>
              <p className="text-purple-100 text-sm">Connect with traders, share strategies, and learn from the community</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border border-cyan-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Newspaper className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-cyan-200 font-bold text-lg">News</div>
                  <div className="text-cyan-300 text-sm">Intelligence</div>
                </div>
              </div>
              <p className="text-cyan-100 text-sm">Curated crypto news with time-based filtering and importance ranking</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(portfolioStats.totalValue)}
          subtitle={formatPercentage(portfolioStats.totalPnLPercentage)}
          variant={portfolioStats.totalPnL >= 0 ? 'success' : 'danger'}
          icon={<Wallet className="w-8 h-8 text-green-400" />}
        />
        <StatCard
          label="Trading Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subtitle={`${stats.wins}W / ${stats.losses}L`}
          variant="default"
          icon={<Target className="w-8 h-8 text-blue-400" />}
        />
        <StatCard
          label="Total P&L"
          value={formatCurrency(stats.totalPL)}
          subtitle={formatPercentage(stats.totalPLPercent)}
          variant={stats.totalPL >= 0 ? 'success' : 'danger'}
          icon={<TrendingUp className="w-8 h-8 text-purple-400" />}
        />
        <StatCard
          label="Social Activity"
          value={appStats.totalPosts.toString()}
          subtitle={`${appStats.totalLikes} likes`}
          variant="default"
          icon={<Users className="w-8 h-8 text-pink-400" />}
        />
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            Featured Features
          </h2>
          <button
            onClick={() => toggleSection('features')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.features ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.features && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureHighlights.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-lg p-4 hover:border-slate-500/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color} flex-shrink-0`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    {feature.isNew && (
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-400" />
            Recent Activity
          </h2>
          <button
            onClick={() => toggleSection('activity')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.activity ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.activity && (
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No recent activity. Start trading and engaging with the community!</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className={`p-2 rounded-lg bg-slate-600 ${activity.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm">{activity.title}</h4>
                      <p className="text-gray-300 text-sm mt-1">{activity.description}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              System Status
            </h2>
            <button
              onClick={() => toggleSection('system')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expandedSections.system ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSections.system && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-200 font-medium">Database Connection</span>
                </div>
                <span className="text-green-400 text-sm">Operational</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-200 font-medium">CoinGecko API</span>
                  </div>
                  <span className="text-blue-400 text-sm">Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-200 font-medium">Data Security</span>
                </div>
                <span className="text-purple-400 text-sm">Encrypted</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-200 font-medium">Last Update</span>
                </div>
                <span className="text-yellow-400 text-sm">Just now</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/trade-entry" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 p-4 rounded-lg text-white font-bold text-center transition-all duration-200 transform hover:scale-105">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">Add Trade</div>
            </Link>

            <Link to="/portfolio" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-lg text-white font-bold text-center transition-all duration-200 transform hover:scale-105">
              <Wallet className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">Portfolio</div>
            </Link>

            <Link to="/crypto-news" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 p-4 rounded-lg text-white font-bold text-center transition-all duration-200 transform hover:scale-105">
              <Newspaper className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">News</div>
            </Link>

            <Link to="/social-hub" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 p-4 rounded-lg text-white font-bold text-center transition-all duration-200 transform hover:scale-105">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">Community</div>
            </Link>
          </div>
        </div>
      </div>

      {/* App Statistics */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            App Statistics
          </h2>
          <button
            onClick={() => toggleSection('stats')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.stats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{appStats.totalPosts}</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{appStats.totalLikes}</div>
              <div className="text-sm text-gray-400">Likes</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{appStats.totalComments}</div>
              <div className="text-sm text-gray-400">Comments</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{appStats.totalAlerts}</div>
              <div className="text-sm text-gray-400">Alerts</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{appStats.goalsCount}</div>
              <div className="text-sm text-gray-400">Goals</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-pink-400">{appStats.reviewsCount}</div>
              <div className="text-sm text-gray-400">Reviews</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Updates/News */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-yellow-400" />
          Recent Updates & Tips
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-200 font-bold mb-1">New Feature: AI Trading Coach</h4>
                  <p className="text-indigo-100 text-sm">Get personalized trading advice powered by advanced AI analysis of your trading patterns and market conditions.</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700/30">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-green-200 font-bold mb-1">Enhanced Portfolio Tracking</h4>
                  <p className="text-indigo-100 text-sm">Real-time portfolio valuation with live cryptocurrency prices and automatic P&L calculations.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-200 font-bold mb-1">Market Intelligence</h4>
                  <p className="text-indigo-100 text-sm">Advanced news filtering by time periods, importance levels, and market categories for better decision making.</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700/30">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-purple-200 font-bold mb-1">Community Features</h4>
                  <p className="text-indigo-100 text-sm">Connect with fellow traders, share strategies, and learn from the community's collective wisdom.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700/30 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Y</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Built by Udara Chamidu</h3>
            <p className="text-indigo-200 text-sm">Full-Stack Developer & Crypto Enthusiast</p>
          </div>
        </div>

        <p className="text-indigo-100 text-sm mb-4 max-w-2xl mx-auto">
          This comprehensive crypto trading platform was built with modern web technologies to help traders
          manage their portfolios, track performance, and stay informed about market developments.
        </p>

        <div className="flex items-center justify-center gap-6 text-sm">
          <a
            href="/about"
            className="text-indigo-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Learn More About Me
          </a>

          <a
            href="mailto:chamiduudara321@gmail.com"
            className="text-indigo-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Get In Touch
          </a>

          <a
            href="https://github.com/UdaraChamidu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            View Source
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
