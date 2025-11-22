import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { calculateWinRate, calculateProfitFactor } from '../lib/calculations';
import { ChevronDown, ChevronUp, BarChart3, CheckCircle, TrendingUp, BookOpen, Target, Calendar } from 'lucide-react';

export const WeeklyReviewPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metrics: true,
    checklist: true,
    insights: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Weekly Review</h1>
        <p className="text-gray-400 text-lg">
          Week of {review.week_start_date} to {review.week_end_date}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Analysis & Reflection</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('metrics')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">📊 Performance Metrics</h2>
          </div>
          {expandedSections.metrics ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.metrics && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-200 mb-2">{review.total_trades}</div>
                <div className="text-blue-300 text-sm">Total Trades</div>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-200 mb-2">{review.win_rate.toFixed(1)}%</div>
                <div className="text-green-300 text-sm">Win Rate</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-200 mb-2">1:{review.average_rr}</div>
                <div className="text-purple-300 text-sm">Avg R:R Ratio</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Best Session</div>
                <div className="text-xl font-bold text-white">{review.best_session || 'No data'}</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Best Entry Type</div>
                <div className="text-xl font-bold text-white">{review.best_entry_type || 'No data'}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400 mb-1">Profit Factor</div>
                <div className="text-lg font-bold text-white">{review.profit_factor.toFixed(2)}</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400 mb-1">Best R:R</div>
                <div className="text-lg font-bold text-green-400">1:{review.best_trade_rr}</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400 mb-1">Worst R:R</div>
                <div className="text-lg font-bold text-red-400">1:{review.worst_trade_rr}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Checklist */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('checklist')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">✅ Review Checklist</h2>
          </div>
          {expandedSections.checklist ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.checklist && (
          <div className="border-t border-slate-700 p-6">
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={review.reviewed_all_trades}
                    onChange={(e) => setReview({ ...review, reviewed_all_trades: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-white font-medium">Reviewed all trades</div>
                    <div className="text-gray-400 text-sm">Analyzed each trade for patterns and mistakes</div>
                  </div>
                </label>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={review.plan_updated}
                    onChange={(e) => setReview({ ...review, plan_updated: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-white font-medium">Updated plan if needed</div>
                    <div className="text-gray-400 text-sm">Made adjustments based on weekly performance</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights & Improvements */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('insights')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">💡 Insights & Improvements</h2>
          </div>
          {expandedSections.insights ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.insights && (
          <div className="border-t border-slate-700 p-6 space-y-6">
            <div className="bg-slate-700 p-4 rounded-lg">
              <label className="block text-lg font-semibold text-white mb-3">Week Insights</label>
              <textarea
                value={review.insights}
                onChange={(e) => setReview({ ...review, insights: e.target.value })}
                placeholder="What went well this week? What patterns did you notice? Any challenges faced?"
                rows={5}
                className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <label className="block text-lg font-semibold text-white mb-3">Identified Improvements</label>
              <textarea
                value={review.identified_improvements}
                onChange={(e) => setReview({ ...review, identified_improvements: e.target.value })}
                placeholder="What specific improvements will you implement next week? Be specific and actionable."
                rows={5}
                className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {saving ? '💾 Saving...' : '💾 Save Weekly Review'}
        </button>
        <p className="text-center text-blue-200 text-sm mt-3">
          Regular reviews are the key to consistent improvement
        </p>
      </div>
    </div>
  );
};
