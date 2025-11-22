import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateWinRate, calculateProfitFactor } from '../lib/calculations';
import { StatCard } from '../components/StatCard';
import { TrendingUp, TrendingDown, Award, BarChart3, Target, Zap, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
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
    const fetchStats = async () => {
      if (!session) return;

      try {
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', session.user.id)
          .order('trade_date', { ascending: false });

        if (!trades) {
          setLoading(false);
          return;
        }

        const completedTrades = trades.filter((t) => t.pl_dollar !== null);

        const wins = completedTrades.filter((t) => t.trade_result === 'Win').length;
        const losses = completedTrades.filter((t) => t.trade_result === 'Loss').length;

        const totalPL = completedTrades.reduce((sum, t) => sum + (t.pl_dollar || 0), 0);
        const totalPLPercent = completedTrades.reduce((sum, t) => sum + (t.pl_percent || 0), 0);
        const avgRR =
          completedTrades.length > 0
            ? completedTrades.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / completedTrades.length
            : 0;

        const totalWins = completedTrades
          .filter((t) => t.trade_result === 'Win')
          .reduce((sum, t) => sum + (t.pl_dollar || 0), 0);
        const totalLosses = Math.abs(
          completedTrades
            .filter((t) => t.trade_result === 'Loss')
            .reduce((sum, t) => sum + (t.pl_dollar || 0), 0)
        );

        const largestWin = Math.max(...completedTrades.map((t) => t.pl_dollar || 0), 0);
        const largestLoss = Math.min(...completedTrades.map((t) => t.pl_dollar || 0), 0);

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
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Trading Dashboard</h1>
        <p className="text-gray-400 text-lg">Your complete trading performance overview</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <BarChart3 className="w-4 h-4" />
          <span>Real-time insights & analytics</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('overview')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">📊 Overview Statistics</h2>
          </div>
          {expandedSections.overview ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.overview && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-200 mb-2">{stats.totalTrades}</div>
                <div className="text-blue-300 text-sm mb-1">Total Trades</div>
                <div className="text-blue-400 text-xs">All recorded trades</div>
              </div>
              <div className={`bg-gradient-to-br border rounded-lg p-6 text-center ${
                stats.winRate >= 50
                  ? 'from-green-900 to-green-800 border-green-700'
                  : 'from-red-900 to-red-800 border-red-700'
              }`}>
                <div className={`text-4xl font-bold mb-2 ${
                  stats.winRate >= 50 ? 'text-green-200' : 'text-red-200'
                }`}>
                  {stats.winRate.toFixed(1)}%
                </div>
                <div className={`text-sm mb-1 ${
                  stats.winRate >= 50 ? 'text-green-300' : 'text-red-300'
                }`}>
                  Win Rate
                </div>
                <div className={`text-xs ${
                  stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stats.wins}W / {stats.losses}L
                </div>
              </div>
              <div className={`bg-gradient-to-br border rounded-lg p-6 text-center ${
                stats.totalPL >= 0
                  ? 'from-green-900 to-green-800 border-green-700'
                  : 'from-red-900 to-red-800 border-red-700'
              }`}>
                <div className={`text-3xl font-bold mb-2 ${
                  stats.totalPL >= 0 ? 'text-green-200' : 'text-red-200'
                }`}>
                  ${stats.totalPL.toFixed(2)}
                </div>
                <div className={`text-sm mb-1 ${
                  stats.totalPL >= 0 ? 'text-green-300' : 'text-red-300'
                }`}>
                  Total P/L
                </div>
                <div className={`text-xs ${
                  stats.totalPL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stats.totalPLPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('performance')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">📈 Performance Metrics</h2>
          </div>
          {expandedSections.performance ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.performance && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-200 mb-2">1:{stats.avgRR}</div>
                <div className="text-purple-300 text-sm mb-1">Average R:R</div>
                <div className="text-purple-400 text-xs">Risk-reward ratio</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 border border-yellow-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-200 mb-2">{stats.profitFactor.toFixed(2)}</div>
                <div className="text-yellow-300 text-sm mb-1">Profit Factor</div>
                <div className="text-yellow-400 text-xs">Gross profit / Gross loss</div>
              </div>
              <div className="bg-gradient-to-br from-orange-900 to-orange-800 border border-orange-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-200 mb-2">{stats.bestStreak}</div>
                <div className="text-orange-300 text-sm mb-1">Best Streak</div>
                <div className="text-orange-400 text-xs">Consecutive wins/losses</div>
              </div>
              <div className={`bg-gradient-to-br border rounded-lg p-6 text-center ${
                stats.currentStreak.type === 'W'
                  ? 'from-green-900 to-green-800 border-green-700'
                  : 'from-red-900 to-red-800 border-red-700'
              }`}>
                <div className={`text-3xl font-bold mb-2 ${
                  stats.currentStreak.type === 'W' ? 'text-green-200' : 'text-red-200'
                }`}>
                  {stats.currentStreak.count}{stats.currentStreak.type}
                </div>
                <div className={`text-sm mb-1 ${
                  stats.currentStreak.type === 'W' ? 'text-green-300' : 'text-red-300'
                }`}>
                  Current Streak
                </div>
                <div className={`text-xs ${
                  stats.currentStreak.type === 'W' ? 'text-green-400' : 'text-red-400'
                }`}>
                  Active streak
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Best/Worst Trades */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('streaks')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">⚡ Best & Worst Trades</h2>
          </div>
          {expandedSections.streaks ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.streaks && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-600 p-2 rounded-full">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-green-200 font-bold text-lg">Largest Win</h3>
                    <p className="text-green-400 text-sm">Your best performing trade</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-100 mb-2">
                  ${stats.largestWin.toFixed(2)}
                </div>
                <div className="text-green-300 text-sm">
                  💚 Outstanding performance
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-600 p-2 rounded-full">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-red-200 font-bold text-lg">Largest Loss</h3>
                    <p className="text-red-400 text-sm">Your most challenging trade</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-100 mb-2">
                  ${stats.largestLoss.toFixed(2)}
                </div>
                <div className="text-red-300 text-sm">
                  📚 Learning opportunity
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Insights */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('insights')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">🔍 Advanced Insights</h2>
          </div>
          {expandedSections.insights ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.insights && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Entry Type Performance
                </h4>
                <p className="text-gray-300 text-sm">Coming soon...</p>
                <p className="text-gray-400 text-xs mt-2">Analyze which entry types work best for you</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  Session Performance
                </h4>
                <p className="text-gray-300 text-sm">Coming soon...</p>
                <p className="text-gray-400 text-xs mt-2">Discover your most profitable trading sessions</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  By Day of Week
                </h4>
                <p className="text-gray-300 text-sm">Coming soon...</p>
                <p className="text-gray-400 text-xs mt-2">Find patterns in weekly performance</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  By Risk %
                </h4>
                <p className="text-gray-300 text-sm">Coming soon...</p>
                <p className="text-gray-400 text-xs mt-2">Optimize your risk management</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <h3 className="text-blue-200 font-bold text-lg mb-3">💡 Performance Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Consistency Over Perfection</div>
            <div className="text-sm">Focus on following your plan rather than chasing perfect trades</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Learn from Losses</div>
            <div className="text-sm">Every loss contains valuable information for improvement</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Risk Management First</div>
            <div className="text-sm">Protecting capital is more important than making profits</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Review Regularly</div>
            <div className="text-sm">Weekly reviews help identify patterns and improvements</div>
          </div>
        </div>
      </div>
    </div>
  );
};
