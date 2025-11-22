import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { calculateWinRate, calculateProfitFactor } from '../lib/calculations';

export const WeeklyReviewPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today.setDate(today.getDate() - dayOfWeek));
    const end = new Date(today.setDate(today.getDate() + 6));

    return {
      weekStart: start.toISOString().split('T')[0],
      weekEnd: end.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    const fetchWeeklyReview = async () => {
      if (!session) return;

      try {
        const { weekStart, weekEnd } = getWeekDates();

        const { data: existingReview } = await supabase
          .from('weekly_reviews')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('week_start_date', weekStart)
          .maybeSingle();

        const { data: weekTrades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('trade_date', weekStart)
          .lte('trade_date', weekEnd);

        const completed = (weekTrades || []).filter((t) => t.pl_dollar !== null);
        const wins = completed.filter((t) => t.trade_result === 'Win').length;
        const losses = completed.filter((t) => t.trade_result === 'Loss').length;

        const avgRR =
          completed.length > 0
            ? completed.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / completed.length
            : 0;

        const totalWins = completed
          .filter((t) => t.trade_result === 'Win')
          .reduce((sum, t) => sum + (t.pl_dollar || 0), 0);
        const totalLosses = Math.abs(
          completed
            .filter((t) => t.trade_result === 'Loss')
            .reduce((sum, t) => sum + (t.pl_dollar || 0), 0)
        );

        const entryTypes: Record<string, number> = {};
        const sessions: Record<string, number> = {};

        completed.forEach((t) => {
          if (t.m1_entry_type) entryTypes[t.m1_entry_type] = (entryTypes[t.m1_entry_type] || 0) + t.pl_dollar;
          if (t.session) sessions[t.session] = (sessions[t.session] || 0) + t.pl_dollar;
        });

        const bestEntryType = Object.entries(entryTypes).sort((a, b) => b[1] - a[1])[0]?.[0];
        const bestSession = Object.entries(sessions).sort((a, b) => b[1] - a[1])[0]?.[0];

        setReview({
          id: existingReview?.id,
          week_start_date: weekStart,
          week_end_date: weekEnd,
          total_trades: weekTrades?.length || 0,
          win_rate: calculateWinRate(wins, completed.length),
          average_rr: parseFloat(avgRR.toFixed(3)),
          profit_factor: calculateProfitFactor(totalWins, totalLosses),
          best_trade_rr: Math.max(...completed.map((t) => t.risk_reward_ratio || 0), 0),
          worst_trade_rr: Math.min(...completed.map((t) => t.risk_reward_ratio || 0), 0),
          best_session: bestSession || '',
          best_entry_type: bestEntryType || '',
          insights: existingReview?.insights || '',
          reviewed_all_trades: existingReview?.reviewed_all_trades || false,
          identified_improvements: existingReview?.identified_improvements || '',
          plan_updated: existingReview?.plan_updated || false,
        });
      } catch (error) {
        console.error('Error fetching weekly review:', error);
        addToast('Error loading weekly review', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyReview();
  }, [session]);

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    try {
      if (review.id) {
        const { error } = await supabase
          .from('weekly_reviews')
          .update({
            insights: review.insights,
            reviewed_all_trades: review.reviewed_all_trades,
            identified_improvements: review.identified_improvements,
            plan_updated: review.plan_updated,
            updated_at: new Date().toISOString(),
          })
          .eq('id', review.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('weekly_reviews')
          .insert([
            {
              user_id: session.user.id,
              ...review,
              created_at: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
      }

      addToast('Weekly review saved successfully', 'success');
    } catch (error: any) {
      console.error('Error saving review:', error);
      addToast('Error saving review', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading weekly review...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">No review data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Weekly Review</h1>
        <p className="text-gray-400">
          Week of {review.week_start_date} to {review.week_end_date}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Total Trades</p>
          <p className="text-2xl font-bold text-white">{review.total_trades}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Win Rate</p>
          <p className="text-2xl font-bold text-white">{review.win_rate.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Avg R:R</p>
          <p className="text-2xl font-bold text-white">1:{review.average_rr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Best Session</p>
          <p className="text-lg font-bold text-white">{review.best_session || '-'}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Best Entry Type</p>
          <p className="text-lg font-bold text-white">{review.best_entry_type || '-'}</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Checklist</h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={review.reviewed_all_trades}
              onChange={(e) => setReview({ ...review, reviewed_all_trades: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-300">Reviewed all trades</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={review.plan_updated}
              onChange={(e) => setReview({ ...review, plan_updated: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-300">Updated plan if needed</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Insights & Improvements</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Week Insights</label>
          <textarea
            value={review.insights}
            onChange={(e) => setReview({ ...review, insights: e.target.value })}
            placeholder="What went well? What needs improvement?"
            rows={4}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Identified Improvements</label>
          <textarea
            value={review.identified_improvements}
            onChange={(e) => setReview({ ...review, identified_improvements: e.target.value })}
            placeholder="What specific improvements will you implement next week?"
            rows={4}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Weekly Review'}
      </button>
    </div>
  );
};
