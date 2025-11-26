import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateWinRate, calculateProfitFactor } from '../lib/calculations';
import { StatCard } from '../components/StatCard';
import { TrendingUp, TrendingDown, Award, BarChart3, Target, Zap, Calendar, ChevronDown, ChevronUp, Wallet, DollarSign, Coins, Activity, PieChart } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    crypto: true,
    performance: true,
    streaks: true,
    insights: false,
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
        fetchCryptoPrices()
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">🚀 Crypto Trading Hub Dashboard</h1>
        <p className="text-gray-400 text-lg">Your complete crypto trading & investment overview</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <BarChart3 className="w-4 h-4" />
          <span>Real-time insights & analytics</span>
          <span className="mx-2">•</span>
          <span>Live crypto prices & portfolio tracking</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <h3 className="text-blue-200 font-bold text-lg mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/crypto-prices" className="bg-blue-800/50 p-4 rounded-lg text-blue-100 hover:bg-blue-700/50 transition-colors text-left block">
            <div className="font-semibold mb-1">📊 View Live Prices</div>
            <div className="text-sm">Check current crypto market prices</div>
          </Link>
          <Link to="/portfolio" className="bg-green-800/50 p-4 rounded-lg text-green-100 hover:bg-green-700/50 transition-colors text-left block">
            <div className="font-semibold mb-1">💰 Manage Portfolio</div>
            <div className="text-sm">Track your crypto holdings</div>
          </Link>
          <Link to="/trade-entry" className="bg-purple-800/50 p-4 rounded-lg text-purple-100 hover:bg-purple-700/50 transition-colors text-left block">
            <div className="font-semibold mb-1">📈 Add New Trade</div>
            <div className="text-sm">Record your latest trading activity</div>
          </Link>
          <Link to="/analytics" className="bg-orange-800/50 p-4 rounded-lg text-orange-100 hover:bg-orange-700/50 transition-colors text-left block">
            <div className="font-semibold mb-1">📊 View Analytics</div>
            <div className="text-sm">Analyze your trading performance</div>
          </Link>
        </div>
      </div>

      {/* Crypto Trading Tips */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-700 rounded-lg p-6">
        <h3 className="text-green-200 font-bold text-lg mb-3">💡 Crypto Trading Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-100">
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🎯 Diversify Your Portfolio</div>
            <div className="text-sm">Don't put all your eggs in one basket - spread across different cryptocurrencies</div>
          </div>
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📊 Regular Portfolio Review</div>
            <div className="text-sm">Rebalance your holdings regularly based on market conditions and goals</div>
          </div>
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🛡️ Risk Management First</div>
            <div className="text-sm">Never invest more than you can afford to lose in the volatile crypto market</div>
          </div>
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📈 Track Both Trading & Investing</div>
            <div className="text-sm">Monitor both your trading profits and long-term investment portfolio performance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
