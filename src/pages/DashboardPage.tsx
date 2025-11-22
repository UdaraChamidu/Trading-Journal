import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateWinRate, calculateProfitFactor } from '../lib/calculations';
import { StatCard } from '../components/StatCard';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Your trading performance at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Trades"
          value={stats.totalTrades}
          icon="📊"
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subtitle={`${stats.wins}W / ${stats.losses}L`}
          variant={stats.winRate >= 50 ? 'success' : 'danger'}
          icon="📈"
        />
        <StatCard
          label="Total P/L"
          value={`$${stats.totalPL.toFixed(2)}`}
          subtitle={`${stats.totalPLPercent.toFixed(2)}%`}
          variant={stats.totalPL >= 0 ? 'success' : 'danger'}
          icon={stats.totalPL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Average R:R"
          value={`1:${stats.avgRR}`}
          icon="🎯"
        />
        <StatCard
          label="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          icon="💰"
        />
        <StatCard
          label="Best Streak"
          value={stats.bestStreak}
          icon="🔥"
        />
        <StatCard
          label="Current Streak"
          value={`${stats.currentStreak.count}${stats.currentStreak.type}`}
          variant={stats.currentStreak.type === 'W' ? 'success' : 'danger'}
          icon={<Award className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Largest Win"
          value={`$${stats.largestWin.toFixed(2)}`}
          variant="success"
          icon="💚"
        />
        <StatCard
          label="Largest Loss"
          value={`$${stats.largestLoss.toFixed(2)}`}
          variant="danger"
          icon="💔"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          <div>
            <p className="text-gray-400 text-sm mb-2">Entry Type Performance</p>
            <p className="text-white">Coming soon...</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Session Performance</p>
            <p className="text-white">Coming soon...</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">By Day of Week</p>
            <p className="text-white">Coming soon...</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">By Risk %</p>
            <p className="text-white">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
